import { CACHE_MANAGER, Inject, Injectable, Logger } from '@nestjs/common';
import { Cache } from 'cache-manager';
import { NotificationService } from 'src/common/services/notification/notification.service';
import { ParentService } from 'src/common/services/parent.service';
import { ListedStatus, Listedtype } from 'src/schemas/listed.schema';
import { Nft, NftActions, NftCollaborator, NftDocument, NftOffers, NftStatus } from 'src/schemas/nft.schema';
import { NotifEvent } from 'src/schemas/user_kyc.schema';
import { AuctionNftDto } from './dto/auction-nft.dto';
import { BuyNftDto } from './dto/buy-nft.dto';
import { CancelNftDto } from './dto/cancel-nft.dto';
import { CreateNftDto } from './dto/create-nft.dto';
import { BuyLazyMintDto, FixNftDto } from './dto/fix-nft.dto';
import { GetNftDto } from './dto/get-nft-dto';
import { LikeNftDto } from './dto/like-nft.dto';
import { getIpfsCid } from 'src/providers/ipfs';
import { lazyMintVoucher, lazyType } from './interface/buy-lazy.interface';
import { OptionService } from 'src/common/services/option/option.service';
import { GetNftApi, ViewsNft } from './interface/views-nft.interface';
import { isListedLastAction, requireLazyBuy, nftNotFound } from './helper/conditions';
import { itemSalesChart } from './helper/chart';
import { UpdateNftDto } from './dto/update-nft.dto';
import { processSuggestedNfts, suggestedNfts } from './interface/suggested-item.interface';
import { TransferData } from './interface/burn-adn-transfer.interface';
import { DeleteNftDto } from './dto/delete-nft.dto';
import { TrashLogNature } from 'src/schemas/trash.schema';
import { getMarket } from 'src/helper/web3/geters/market-geter';
import { NftListenerService } from './listener/nft-listener.service';
import { MarketHandelerOption } from './interface/market-handeler-option.interface';
import { CollectionService } from '../collection/collection.service';

@Injectable()
export class NftService {

  /**
   * service nft for api request
   * @param parentService 
   * @param cacheManager 
   * @param notifService 
   * @param optionService 
   */
  constructor(
    private parentService: ParentService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    private notifService: NotificationService,
    private optionService: OptionService,
    private nftListenerService: NftListenerService,
    private collectionService: CollectionService
  ) { }

  /**
   * get nft data with all option for item page in ui
   * @param getNftDto 
   * @param address 
   * @param req 
   * @returns 
   */
  async getNft({ getNftDto, address, req, again }: GetNftApi) {
    let {
      collection,
      creator,
      tokenId } = getNftDto,
      nftCollection,
      contract_address: string,
      nowTime = this.parentService.Tools.get_now_time();

    // get address craetor from username or address
    let creatorAddress = await this.parentService.getNftCreator(creator);

    // check exist collection
    if (collection) {
      nftCollection = await this.parentService.getCollectionWithOption({ name: collection })

      if (!nftCollection)
        return this.parentService.Error(`nft on ${collection} collection not found`, 404)

      contract_address = nftCollection.contract_address
    }

    Logger.log('get nft with option tokenId : ' + tokenId + ' creator : ' + creatorAddress);

    // get nft from db
    let nftDB = await this.parentService.getNft({
      creator: creatorAddress,
      ...(tokenId.length <= 10) && { tokenId: tokenId },
      ...(tokenId.length > 10) && { _id: tokenId },
      category: collection ? nftCollection._id : ''
    })

    // check nft exist and show able
    if (nftNotFound(nftDB, address)) return this.parentService.Error(`nft not found`, 404);

    // get nft owner with alchemy
    let nftAlchemy = await this.parentService.alchemyWeb3.getOwner(nftDB.tokenId, contract_address)

    // condition for know owner of nft is chenged when nft status not one of a market modes
    if (
      // (nftDB.status != NftStatus.fix && nftDB.status != NftStatus.auction) &&
      nftAlchemy &&
      nftAlchemy.owners &&
      nftAlchemy.owners[0] != nftDB.owner.toLowerCase()
    ) {

      /** if burned token */
      if (nftAlchemy.owners[0] == this.optionService.nullAddress) {
        await this.delete({ nft_id: nftDB._id }); return;
      }

      // when owner is market
      if (nftAlchemy.owners[0] == process.env.market.toLowerCase()) {

        // if fist time 1s sleep and again try get nft
        if (!again) {
          await this.parentService.Tools.sleep(1000);
          return this.getNft({ getNftDto, address, req, again: true })
        }

        // use getMrket geter and handel changes
        if (await getMarket({ contract_address, tokenId: nftDB.tokenId, offers: nftDB.offers }, this.marketHandeler))
          return this.getNft({ getNftDto, address, req, again: true })

      }
      else if (nftAlchemy.owners[0] != nftDB.owner.toLowerCase()) {

        // transfer nft to alchemy's reported owner
        await this.burnAndTransfer(
          {
            lastOwner: nftDB.owner,
            owner: nftAlchemy.owners[0],
            tokenId
          },
          nftDB,
          // After confirming the change of owner, we consider that the nft has transferred,
          isListedLastAction(nftDB.nft_path) ? NftActions.buy : NftActions.transfer
        );
        Logger.log('transfer by alchemy to ', nftAlchemy.owners[0]);
        return this.getNft({ getNftDto, address, req, again: true })

      }


    }

    // apply view on nft
    nftDB.views = await this.viewItem({ nftDbViews: nftDB.views, address, ip: req.userAddress });

    await nftDB.save();

    // check is owner user requested
    let isOwner = address && nftDB.owner.toLowerCase() == address.toLowerCase();

    // process nft
    let nftDbProcess = await this.parentService.processNft(nftDB, address);

    let permisionNft = this.parentService.permisionNft(nftDbProcess, isOwner, address)

    /**
     * get chart data in item page
     */
    let chartData = itemSalesChart(nftDbProcess.nft_path)

    return {
      isOwner,
      nft: nftDbProcess,
      nftCollection,
      permisionNft,
      chartData,
      suggestedItems: await this.suggestedItems({ count: 3, nft: nftDB, _process: processSuggestedNfts.auction, nfts: [] })
    }

  }

  /**
   * marketHandeler function handles different market statuses and makes API calls based on the given status
   *
   * @param {object} option - object containing data, status, contract_address, offerData, tokenId 
   * @param {Array} offers - array of NftOffers objects
   * @returns {Promise<void>}
   */
  marketHandeler = async (option: MarketHandelerOption, offers: NftOffers[]) => {
    let { data, status, contract_address, offerData, tokenId } = option,
      nowTime = this.parentService.Tools.get_now_time();

    switch (status) {
      case NftStatus.fix:
        // handel fix
        await this.nftListenerService.setFix({
          contract_address,
          scResponse: { type: 'geter', response: option },

          tokenId,
          price: data.fixPrice
        })
        break;

      case NftStatus.reserve:
        // handel reserve
        await this.nftListenerService.setReserveAuction({
          contract_address,
          tokenId,
          scResponse: { type: 'geter', response: option },

          duration: data.duration,
          baseValue: data.baseValue,
          tokenStatus: data.tokenStatus
        })
        break;

      case NftStatus.fixAndReserve:
        // handel fix
        await this.nftListenerService.setFix({
          contract_address,
          scResponse: { type: 'geter', response: option },

          tokenId,
          price: data.fixPrice
        })
        // handel reserve
        await this.nftListenerService.setReserveAuction({
          contract_address,
          tokenId,
          scResponse: { type: 'geter', response: option },

          duration: data.duration,
          baseValue: data.baseValue,
          tokenStatus: data.tokenStatus
        })
        break;

      case NftStatus.auction:
        // handel auction
        await this.nftListenerService.AuctionSet({
          contract_address,
          tokenId,
          duration: data.duration,
          baseValue: data.baseValue,
          startTime: data.startTime,
          scResponse: { type: 'geter', response: option }
        });

        // handel bid
        if (data.bidder)
          await this.nftListenerService.auctionBid({
            contract_address,
            tokenId,
            scResponse: { type: 'geter', response: option },

            bidder: data.bidder,
            bidTime: nowTime,
            bidValue: data.bidValue
          })
        break;

      default:
        break;
    }

    // check and set offer
    let offer: NftOffers;
    if (offerData) {
      if (offer = this.parentService.Tools.getExistOffer(offers)) { // check exist active offer for this nft
        if (
          offer.address != offerData.offerer ||
          offer.price != offerData.wantedPrice
        )
          await this.nftListenerService.addOffer({
            contract_address,
            tokenId,
            offerer: offerData.offerer,
            price: offerData.wantedPrice,
            scResponse: { type: 'geter', response: option }
          })

      } else
        await this.nftListenerService.addOffer({
          contract_address,
          tokenId,
          offerer: offerData.offerer,
          price: offerData.wantedPrice,
          scResponse: { type: 'geter', response: option }
        })

    }
  }

  /**
   * Checking the existence of the game through this person and public key, and if not, adding the visit to the visits of this item.
   * @param data 
   * @returns 
   */
  async viewItem(data: ViewsNft) {
    let { address, ip, nftDbViews } = data;
    let flagRepetitious = false;

    await Promise.all(nftDbViews.map(view => {
      if (view.address == address) {
        view.count = !view.count ? 1 : (+view.count + 1);

        flagRepetitious = true;
      }
      return view;
    }));

    if (!flagRepetitious)
      nftDbViews.push({
        address,
        ip,
        count: 1
      })

    return nftDbViews;
  }

  /**
   * Priority with listed items from this collection dimension this collection items  and dimension artaniom items
   * @param input 
   * @returns 
   */
  async suggestedItems(input: suggestedNfts): Promise<Nft[]> {
    let { count, nft, nfts, _process } = input;


    let queryNfts = await this.parentService.getNfts({
      ...(
        _process == processSuggestedNfts.auction ||
        _process == processSuggestedNfts.fix ||
        _process == processSuggestedNfts.collection
      ) && { category: nft.category },
      ...(_process == processSuggestedNfts.artaniom) && { category: '' },
      ...(_process == processSuggestedNfts.auction) && { status: NftStatus.auction },
      ...(_process == processSuggestedNfts.fix) && { $or: [{ status: NftStatus.fix }, { status: NftStatus.fixAndReserve }] },
    }, [], { limit: count, collection: true });


    if (
      queryNfts.length < count &&
      _process != processSuggestedNfts.artaniom
    ) {
      input.count -= queryNfts.length;
      input.nfts = [...nfts, ...queryNfts];
      input.nft = nft;
      input._process = this.parentService.Tools.nextProperty(processSuggestedNfts, _process);

      return this.suggestedItems(input);
    }

    if (_process == processSuggestedNfts.artaniom && queryNfts.length <= count) {
      var limitedQueryNfts = queryNfts;
    } else
      var limitedQueryNfts = queryNfts.slice(queryNfts.length - count);

    return [...nfts, ...limitedQueryNfts];
  }


  async checkListed(data: FixNftDto | AuctionNftDto, address: String, type: String) {

    let { nft_id } = data;

    // get nft
    let nftDB = await this.parentService.nftModel.findOne({ _id: nft_id, owner: address });
    if (!nftDB)
      return this.parentService.fail('nft not found');


    // Checking that the item is listed
    if (await this.parentService.listedModel.findOne({ status: ListedStatus.active, tokenId: nftDB.tokenId, nft_id: nftDB._id }))
      return this.parentService.fail('item is listed')

    //get contract created address
    let contract_address = (await this.parentService.getCollection({ id: nftDB.category })).contract_address

    // get nft owner with alchemy
    let nftAlchemy = await this.parentService.alchemyWeb3.getOwner(nftDB.tokenId, contract_address)

    // Checking the existence of nft in our artaniom contract
    if (type == NftStatus.fix)
      var newOwner = process.env.fix;
    else
      var newOwner = process.env.auction;

    if (
      nftAlchemy &&
      nftAlchemy.owners[0] != newOwner.toLowerCase()
    )
      return this.parentService.fail('owner of nft Unknown');

    return {
      success: true,
      nftDB,
      contract_address,
      nftAlchemy,
    }
  }

  /**
   * edit price lazy item befor buy
   * @param updateNftDto 
   * @param address 
   * @returns 
   */
  async edit(updateNftDto: UpdateNftDto, address: string) {
    let { nft_id, price } = updateNftDto;
    let now = this.parentService.Tools.get_now_time().toString();

    // check exist nft and check user is owned
    let nftDB: NftDocument = await this.parentService.getNft({ _id: nft_id, owner: address, status: NftStatus.lazy });

    // update nft on DB to minted status
    nftDB.time_updated = now;
    nftDB.updated_by = address;
    // add cancel log to nft path
    nftDB.price = price;

    await nftDB.save()

    return {
      nftDB
    }

  }

  // like and unlike toggel
  async likeNft(likeNftDto: LikeNftDto, address: String) {
    let { nft_id } = likeNftDto;

    // let nftDB = await this.parentService.existNft()
    // if (!nftDB.success)
    //   return nftDB;

    // let nft = nftDB.data;
    let nft = await this.parentService.getNft({ nft_id })

    // condition for Repetitious like
    if (nft.like.find(n => n.address == address)) {
      nft.like = nft.like.filter(b => b.address !== address);
      var message = 'unlike nft'
    } else {
      nft.like.push({ address: address, time: this.parentService.Tools.get_now_time().toString() })
      var message = 'like nft'
    }

    await nft.save();

    this.notifService.notification({
      address,
      event: NotifEvent.like,
      targetUserAddress: nft.owner,
      message: `${this.parentService.Tools.getUiName(await this.parentService.getUser({ address }))} liked your NFT`
    })

    return {
      nft,
      message
    };

  }

  /**
   * Within the function, there is a variable called ethUsd. The value of ethUsd is being fetched from a cache memory (using the get() method of cacheManager).
   * Finally, the function returns an object containing ethUsd.
   * @param address 
   * @returns 
   */
  async ethPrice(address?: String) {
    var ethUsd = await this.cacheManager.get('eth-usd');

    return { ethUsd };

  }

  /**
   * A method buyLazy takes two parameters named buyLazyMintDto and address.
   * It first extracts the nft_id from the buyLazyMintDto.
   * And then it gets the details of the NFT from database by calling a function getNft.
   * It extracts the extension name of the original image file, as well as its link.
   * Because metadata needed to create a lazy mint voucher, which contains information about name, description, image, and sign (signature) of the NTF object for sale. After that metadata is converted to a JSON string and uploaded to IPFS using a CID (Content Identifier), also extracted at this stage, creating an IPFS link containing the metadata.json content.
   * A lazyMintVoucher is created which contain various important properties like price, buyer, royaltyFraction, collectionAddress and more.
   * Using parentService.Tools.makeVoucher() method, a voucher is created with above lazyMintVoucher object.
   * Finally, returns URI of IPFS metadata , nft_id and voucher as an object.
   * @param buyLazyMintDto 
   * @param address 
   * @returns 
   */
  async buyLazy(buyLazyMintDto: BuyLazyMintDto, address: string) {
    let { nft_id } = buyLazyMintDto,
      image: String,
      fileType: string;

    // get nft DB
    let nftDB: NftDocument = await this.parentService.getNft({ nft_id });

    let fileOrginalArr = nftDB.image_original.split('.');
    fileType = fileOrginalArr[fileOrginalArr.length - 1]

    image = nftDB.image

    // transfer metadata on ipfs
    let metadata = {
      name: nftDB.name,
      description: nftDB.description,
      image,
      sign: this.parentService.Tools.makeSign(`
        ${nftDB.image_original}${this.parentService.Tools.get_now_time()}
      `)
    },
      uri_cid = await getIpfsCid({ filename: `metadata.json`, content: JSON.stringify(metadata) }),

      uri = `${process.env.IPFS_GATEWAY}${uri_cid}`;

    let voucher: lazyMintVoucher = {
      price: nftDB.price.toString(),
      buyer: address,
      royaltyFraction: nftDB.royalty.toString(),
      collectionAddress: (await this.parentService.getCollection({ id: nftDB.category })).contract_address,
      CID: uri_cid,
      NFTdb: nftDB.id,
      collaborator_s: this.parentService.Tools.configCollaborator(nftDB.collaborators),
    }

    let types = lazyType

    let finalVoucher = await this.parentService.Tools.makeVoucher(voucher, types)

    return {
      uri,
      nft_id,
      voucher: finalVoucher
    }

  }

  /**
   * burn and transfer nft
   * @param {TransferData} transferData 
   */
  async burnAndTransfer(transferData: TransferData, nftPassed?: NftDocument, action = NftActions.transfer) {
    let { contract_address, owner, lastOwner, scResponse, tokenId } = transferData;
    let nowTime = this.parentService.Tools.get_now_time()

    let nftDB =
      nftPassed ??
      await this.parentService.getNft({ tokenId, contract_address });

    if (owner == this.optionService.nullAddress) { // burn
      Logger.log(await this.delete({ nft_id: nftDB._id }));

    }
    else {
      nftDB.nft_path.push({
        action,
        by: lastOwner,
        price: null,
        time: nowTime
      });
      nftDB.time_updated = nowTime.toString();
      nftDB.owner = owner;
      nftDB.status = NftStatus.sold;
      await nftDB.save();

    }

    // update collection fields
    this.collectionService.updateOwnersCollection({ contract_address }, owner.toString(), +tokenId);
  }

  /**
   * delete lazy items
   * @param deleteNftDto
   * @param address
   */
  async delete(deleteNftDto: DeleteNftDto, address?: string, isLazy?: boolean) {
    let { nft_id } = deleteNftDto;

    if (isLazy) // call with api
      var nftDB = (await this.parentService.getNft({ _id: nft_id, status: NftStatus.lazy, owner: address })).toJSON();
    else // call with burn method
      var nftDB = (await this.parentService.getNft({ _id: nft_id })).toJSON();

    /**
     * copy item to trash
     */
    await new this.parentService.TrashModel({
      log: {
        nature: TrashLogNature.nft,
        details: nftDB
      }
    }).save();

    /**
     * delete item from nft 
     */
    await this.parentService.nftModel.deleteOne({ _id: nft_id });

    /**
     * update item counter collection
     */
    if (nftDB.category)
      var collection = await this.parentService.catModel.findOneAndUpdate({ _id: nftDB.category }, {
        $inc: {
          itemCounter: -1,
          burnCounter: 1
        }
      }, { new: true });

    return { message: `remove item : ${nft_id}` }

  }


}
