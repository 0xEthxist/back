import { Injectable } from '@nestjs/common';
import { ParentService } from 'src/common/services/parent.service';
import { CheckNameCollectionDto } from './dto/check-name-collection.dto';
import { CreateCollectionDto } from './dto/create-collection.dto';
import { UpdateCollectionDto } from './dto/update-collection.dto';
import { collectionSort, GetCollectionDto } from './dto/get-collection.dto';
import { GetCollectionMintDto } from './dto/get-collection-mint.dto';
import { NotifEvent } from 'src/schemas/user_kyc.schema';
import { NotificationService } from 'src/common/services/notification/notification.service';
import { FavoriteDto } from './dto/favorite-collection.dto';
import { Category, CategoryDocument, CollectionType } from 'src/schemas/category.schema';
import { CreateCollection } from './interface/collection.interface';
import { CreateLazyDto } from './dto/create-lazy.dto';
import { lazyCollectionType, lazyCreateCollection } from './interface/create-lazy.interface';
import { lazyPermision } from './helper/condition';
import { sortNftOption } from './helper/sort';
import { getCollectionOwners } from './helper/get-owners';
import { getFloorAndHighestPrice, getTotalSales } from './helper/price-sales';
import { filterNftOption } from './helper/filter';
import { getGeneralCollectionDadta } from './helper/general-data';
import { updateCollectionInput } from './interface/update-collection-input';
import { FilterQuery } from 'mongoose';
import { IDataServices } from 'src/common/services/repository/abstract-data-services';
import { OptionService } from 'src/common/services/option/option.service';
import { ProccessNftInterface } from 'src/common/services/interface/process-nft.interface';

/**
 * This service has methods for handling parts related to collections, 
 * such as checking names in collections, getting data related to a collection, updating collections, 
 * adding a collection as a favorite, and creating and updating collections. Making the owners of items in a collection
 */
@Injectable()
export class CollectionService {
  constructor(
    private parentService: ParentService,
    private notifService: NotificationService,
    public dataServices: IDataServices,
    private optionService: OptionService,
  ) { }

  // ************* by websocket *************
  async createCollection(createCollection: CreateCollection) {
    let { name, owner, scResponse, symbol, type, contract_address, catWeb2 } = createCollection

    const lazyAbi = './src/common/abi/lazy.json';
    const normalAbi = './src/common/abi/abi.json';

    let user = await this.parentService.getUser({ address: owner });

    // get collection 
    let collection = await this.parentService.getCollection({ name, owner })
    if (collection)
      return this.parentService.fail(`name: ${name} Repetitious`)

    if (
      type == CollectionType.lazy &&
      user
    )
      if (!lazyPermision(user))
        return this.parentService.fail('permision is not allow')
      else {
        // Reducing the number of permision lazyCollection
        user.permision.collection.lazyCollection -= 1;
        await user.save()
      }

    collection = await new this.parentService.catModel({
      name,
      symbol,
      contract_address,
      owner,
      abi: (type && type == CollectionType.lazy) ? lazyAbi : normalAbi,
      time_created: this.parentService.Tools.get_now_time(),
      category_web2_id: catWeb2,
      type,
    }).save();

    // send notif to followers
    this.notifService.notification({
      address: owner,
      event: NotifEvent.createCollection
    })

  }


  // ************* by api *************
  async check_name(checkNameCollectionDto: CheckNameCollectionDto, userAddressRequested: String) {

    let { name } = checkNameCollectionDto;

    // get collection 
    let collection = await this.parentService.getCollection({
      name,
      owner: userAddressRequested
    })

    if (collection)
      return this.parentService.fail(`You have already created a collection with the same name`)

    // return this.parentService.success(`name: ${name} is ok`)
    return { message: `name: ${name} is ok`, success: true }
  }

  /**
   * collection view with filter or sort
   * @param getCollectionDto 
   * @param userAddressRequested 
   * @returns 
   */
  async get(getCollectionDto: GetCollectionDto, userAddressRequested: String) {
    let { name, sort, filter } = getCollectionDto;

    // get collection data
    let collection = await this.parentService.getCollectionWithOption({ name }, { owner_data: true, nfts: true });
    if (!collection)
      return this.parentService.Error('collection not fount', 404);

    let { CollectionOwners, max, min, totalSales, tabData } = await getGeneralCollectionDadta(collection.nfts);
    delete collection.nfts;

    // get artWork collection
    let artWork = await this.parentService.getCatWeb2(collection.category_web2_id);

    // check user owned of colleciton
    let isOwner: Boolean = (userAddressRequested && collection.owner.toLowerCase() == userAddressRequested.toLowerCase());

    var { getNftOption, getNftMethod } = filterNftOption(filter, collection._id, sort);

    let nfts: ProccessNftInterface[] = await this.parentService.getNfts(getNftOption, [], getNftMethod);

    if (sort && !getNftMethod.sort) {

      if (sort == collectionSort.viewed)
        nfts.sort((a, b) => b.views.length - a.views.length)
      else if (sort == collectionSort.favorited)
        nfts.sort((a, b) => b.like.length - a.like.length)


    }

    return {
      isOwner,
      collection,
      nfts,
      CollectionOwners,
      max,
      min,
      totalSales,
      tabData,
      artWork
    }
  }

  async getMint(getCollectionMintDto: GetCollectionMintDto, userAddressRequested: String) {
    let { category_web2_id } = getCollectionMintDto;

    // get collection data
    let collections = await this.parentService.getCollectionsWithOption({ category_web2_id, owner: userAddressRequested }, { abi: true });

    return {
      message: `${collections.length} collections for this category and this user`,
      collections,
    }
  }

  /**
   * update standard and lazy collection {description , ...}
   * @param updateCollectionDto 
   * @param userAddressRequested 
   * @returns 
   */
  async update(updateCollectionDto: UpdateCollectionDto, userAddressRequested: String) {
    let { banner, description, image, title, id, logo, social } = updateCollectionDto;

    // get collection data
    let collection = await this.parentService.getCollectionWithOption({ _id: id, owner: userAddressRequested });
    if (!collection)
      return this.parentService.Error('not exits collection');

    let newCollection = await this.parentService.catModel.findOneAndUpdate({ _id: id, owner: userAddressRequested }, {
      title,
      description,
      image,
      banner,
      logo,
      social
    })

    collection.title = title
    collection.description = description
    collection.image = image
    collection.banner = banner
    collection.logo = logo
    collection.social = social

    return {
      message: `updated collection success!`,
      collection: newCollection
    }

  }

  /**
   * add collection to favorite`s list
   * @param favoriteDto 
   * @param userAddress 
   * @returns 
   */
  async addFavorite(favoriteDto: FavoriteDto, userAddress: string) {
    let { collectionId } = favoriteDto;

    // check exist collection
    let colleciton = await this.parentService.getCollectionWithOption({ _id: collectionId });
    if (!colleciton)
      return this.parentService.fail('collection not found')

    // check owner cannot favorite your collection
    if (colleciton.owner == userAddress)
      return this.parentService.fail('You cannot favorite your collection');

    // chekc not repetitious user
    if (colleciton.favorite_list.find(fav => fav.address == userAddress))
      colleciton.favorite_list = colleciton.favorite_list.filter(fav => fav.address !== userAddress);
    else
      // add user to favorite list
      colleciton.favorite_list.push({
        address: userAddress
      })

    await this.parentService.catModel.findByIdAndUpdate({ _id: collectionId }, {
      favorite_list: colleciton.favorite_list
    })

    // send notif to collection owner
    this.notifService.notification({
      address: userAddress,
      event: NotifEvent.addFavorite,
      message: ` Your ${colleciton.name} collection was added to ${this.parentService.Tools.getUiName(await this.parentService.getUser({ address: userAddress }))} watchlist`,
      targetUserAddress: colleciton.owner
    })

    return { colleciton }
  }

  /**
   * create lazy collection voucher
   * @param createLazyDto 
   * @param userAddress 
   * @returns 
   */
  async createLazy(createLazyDto: CreateLazyDto, userAddress: string) {
    let { catWeb2_id, name, symbol } = createLazyDto;
    let maximumSupply = 50; // read from option db
    let user = await this.parentService.getUser({ address: userAddress });

    if (
      !user ||
      !user.active
    )
      return this.parentService.Error('You are not kyc', 403);

    if (!lazyPermision(user))
      return this.parentService.Error('You are not allowed to create lazy collection', 403);

    let data: lazyCreateCollection = {
      owner: user.address,
      maximumSupply: maximumSupply.toString(),
      name,
      symbol,
      catWeb2: catWeb2_id
    }

    let voucher = await this.parentService.Tools.makeVoucher(data, lazyCollectionType);

    return {
      voucher
    }
  }

  /**
   * update owners collection 
   * this method called in mint , buyLazyMint, fixBuy, auctionWinner, acceptedOffer, transfer and burn
   * @param filter 
   * @param newOwner 
   * @param tokenId 
   */
  async updateOwnersCollection(filter: FilterQuery<Category>, newOwner: string, tokenId: number) {

    let collection = await this.dataServices.category.get(filter);
    if (!collection)
      return;
    let owners = collection.owners;

    if (newOwner == this.optionService.nullAddress)
      delTokenIdOwner(tokenId); // check condition when item is burn

    else {
      let checkExistUser = owners.find(owner => owner.address == newOwner);
      if (checkExistUser) {
        var checkExistTokenId = owners.find(owner => owner.tokenIds.includes(tokenId) && owner.address == newOwner);
        if (checkExistTokenId?.address != newOwner) {
          // delete from old user 
          delTokenIdOwner(tokenId)
          // update owner count
          addTokenIdOwner(tokenId, newOwner)
        }
      } else {
        var checkExistTokenId = owners.find(owner => owner.tokenIds.includes(2));
        if (checkExistTokenId) {
          // delete from old user 
          delTokenIdOwner(tokenId)
          // create new user with tokenId
          owners.push({ address: newOwner, tokenIds: [tokenId], itemCount: 1 })

        } else
          // create new user with tokenId
          owners.push({ address: newOwner, tokenIds: [tokenId], itemCount: 1 })

      }

    }

    /** delete tokenId from owners list */
    function delTokenIdOwner(tokenIdInput: number) {
      owners.map(owner => {
        if (owner.tokenIds.includes(tokenIdInput)) {
          owner.tokenIds = owner.tokenIds.filter(ti => ti != tokenIdInput);
          owner.itemCount = owner.tokenIds.length;
        }
      })
    }

    /** add tokenId in the address on owners lsit */
    function addTokenIdOwner(tokenIdInput: number, address: string) {
      owners.map(owner => {
        if (owner.address == address) {
          owner.tokenIds.push(tokenIdInput);
          owner.itemCount = owner.tokenIds.length;
        }
      })
    }

    collection.owners = owners;
    collection.ownerLength = owners.length;

    await collection.save();

  }

}
