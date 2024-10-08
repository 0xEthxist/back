import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Nft, NftDocument, NftStatus } from 'src/schemas/nft.schema';
import { ParentService } from 'src/common/services/parent.service';
import { User_kycDocument } from 'src/schemas/user_kyc.schema';
import { SetHomeCollection } from './dto/set-home-collection.dto';
import { CategoryDocument } from 'src/schemas/category.schema';
import { IDataServices } from 'src/common/services/repository/abstract-data-services';

/**
 * getHome(): This method fetches home data including collections, open auctions, fixed-price NFTs, and reserved NFTs, and returns as an object.
 * getHeaderUserData(userAddress: string): This method receives the user address as input and gets necessary data from the database including user permissions, 
 * current number of notifications, followed collections, followers list etc. 
 * The method then removes sensitive information and returns the object key values as user object with empty permission attribute along with other attributes.
 * setHomeCollection(setHomeCollection: SetHomeCollection): This method is used for changing the home collection by updating inHome attribute of collection query based on the provided name and pass.
 * The class also includes a private variable nftListCash.
 */
@Injectable()
export class HomeService {
  private nftListCash = { nftList: [], time: null, success: true, error: null };
  constructor(
    private parentService: ParentService,
    private dataServices: IDataServices,
  ) { }

  async getHome() {
    let nowTime = this.parentService.Tools.get_now_time(),
      projectionField = [
        '_id',
        'name',
        'image',
        'image_cid',
        'status',
        'show',
        'owner',
        'creator',
        'price',
        'category',
        'category_web2_id',
        'nft_path',
        'time_create',
        'time_listed',
        'time_sold',
        'collaborators',
        'offers',
        'tokenId',
        'image_original'
      ];

    let collections = await this.parentService.getCollectionsWithOption({ inHome: true }, { owner_data: true, nfts: true }, { sort: { priority: 1 } });

    let auctions = await this.parentService.getNfts({
      status: NftStatus.auction,
      'listed.time_end': { $gte: nowTime },
      "listed.time_start": { $lte: nowTime }
    }, projectionField, { limit: 3 });

    let fixed = await this.parentService.getNfts({ status: NftStatus.fix }, projectionField, { limit: 3 });

    let reserve = await this.parentService.getNfts({ status: NftStatus.reserve }, projectionField, { limit: 3 });

    return {
      collections,
      auctions,
      fixed,
      reserve
    }

  }

  async getHeaderUserData(userAddress: string) {

    if (!userAddress)
      return this.parentService.Error('address required', 400);

    var user: User_kycDocument, permision: string, numberOfNewNotif: number = 0;
    user = await this.parentService.getUser({ address: userAddress }, {
      followers: 0,
      following: 0,
      activeOffers: 0,
      social: 0
    });

    // if (user.permision.blocked)
    //   return this.parentService.Error("you're blocked", 403)

    // if user not exist create a new user in db
    if (!user) {
      Logger.log('add new user to app')
      user = await new this.parentService.userModel({
        address: userAddress,
        active: false,
        time_added: this.parentService.Tools.get_now_time()
      }).save()
    } else {
      user.address = userAddress;
      user.time_added = !user.time_added ? this.parentService.Tools.get_now_time().toString() : user.time_added;
      await user.save();
    }

    /** count of new notifications */
    user.notif.map(async n => {
      if (n.seen === false)
        numberOfNewNotif++;
    })
    delete user.notif;

    // convert permision to jwt
    if (user.permision)
      permision = this.parentService.Tools.makeSign(user.permision);

    user.permision = null;
    delete user.permision;


    return {
      user,
      numberOfNewNotif,
      permision,
    }

  }

  async setHomeCollection(setHomeCollection: SetHomeCollection) {
    let { collectionId, name, pass } = setHomeCollection;

    var collectionQuery: CategoryDocument;


    if (name == 'behrouz' && pass == '!@#123qwe') {
      if (!collectionId)
        return this.parentService.Error('collectionId required!', 400)

      if (collectionQuery = await this.parentService.catModel.findOne({ _id: collectionId })) {
        if (collectionQuery.inHome)
          collectionQuery.inHome = false;
        else
          collectionQuery.inHome = true;

        await collectionQuery.save();

      }

      return {
        collectionQuery
      }
    }

    return this.parentService.Error('name or pass !!!', 403);
  }
}
