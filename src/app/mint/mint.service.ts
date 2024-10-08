import { Inject, Injectable, Logger } from '@nestjs/common';
import { getIpfsCid } from 'src/providers/ipfs';
import { CreateLazyMintDto, CreateMintDto } from './dto/create-mint.dto';
import { UpdateMintDto } from './dto/update-mint.dto';
import * as fs from 'fs';
import { Nft, NftActions, NftCollaborator, NftDocument, NftMintTypes, NftStatus } from 'src/schemas/nft.schema';
import Tools from '../../helper/tools'
import { NotifEvent, User_kyc, User_kycDocument } from 'src/schemas/user_kyc.schema';
import { ParentService } from 'src/common/services/parent.service';
import { NotificationService } from 'src/common/services/notification/notification.service';
import { NftService } from '../nft/nft.service';
import { CollectionType, CategoryDocument } from 'src/schemas/category.schema';
import { LazyMintUpdateData, MintUpdateData } from './interface/mint-listener.interface';
import { OptionService } from 'src/common/services/option/option.service';
import { lazyMintResponse, lazyResponse } from './interface/mint-response.interface';
import { CollectionService } from '../collection/collection.service';
import { MarketService } from '../nft/listener/market.service';

@Injectable()
export class MintService {

  @Inject(NftService)
  private readonly nftService: NftService;

  /**
   * mint service
   * @param parentService 
   * @param notifService 
   * @param optionService 
   * @param collectionService 
   * @param marketService 
   */
  constructor(
    private parentService: ParentService,
    private notifService: NotificationService,
    private optionService: OptionService,
    private collectionService: CollectionService,
    private marketService: MarketService,
  ) { }

  // ******************* with websocket

  /**
   * update nft minted to stable nft and minted on smart contract
   * @param {MintUpdateData} mintUpdateData 
   * @returns 
   */
  async mintUpdate(mintUpdateData: MintUpdateData) {
    let { nftId, scResponse, contract_address, tokenId } = mintUpdateData,
      nowTime = Tools.get_now_time();

    // get nft minted on blockchain
    let existNft = await this.parentService.existNft({ nft_id: nftId })
    if (!existNft.success)
      return this.parentService.fail(existNft.mes)

    let nftDB: NftDocument = existNft.data;

    // api on node with alchemy for get my nft report;
    let nftAlchemy = await this.parentService.alchemyWeb3.getOwner(tokenId, contract_address)

    if (
      !nftAlchemy ||
      !nftAlchemy.owners ||
      nftAlchemy.owners[0] != nftDB.owner.toLowerCase()
    )
      return this.parentService.fail('nft has not been minted')

    let ownerItem: User_kycDocument = await this.parentService.getUser({ address: nftDB.owner })

    nftDB.history.push(scResponse);
    nftDB.status = NftStatus.minted;
    nftDB.updated_by = ownerItem.id
    nftDB.time_updated = Tools.get_now_time().toString();
    nftDB.tokenId = tokenId;

    // add mint action to nft path
    nftDB.nft_path.push({
      action: NftActions.mint,
      by: nftDB.owner,
      price: 0,
      time: nowTime,
    })

    /**
     * update item counter at mint on collections
     */
    if (contract_address.toLowerCase() != process.env.CONTRACT_ADDRESS)
      await Promise.all([
        this.parentService.catModel.findOneAndUpdate({ contract_address }, {
          $inc: {
            itemCounter: 1
          }
        }),
        this.collectionService.updateOwnersCollection({ contract_address }, nftDB.owner.toString(), tokenId)
      ])

    await nftDB.save();

    Logger.log(`create a new item wiht name : ${nftDB.name} and owner : ${nftDB.creator}`);

    this.notifService.notification({
      address: ownerItem.address,
      event: NotifEvent.mint
    })
  }
  async lazyMintBuy(lazyMintUpdateData: LazyMintUpdateData): Promise<void> {
    let { nftId, scResponse, contract_address, tokenId, cid, buyer } = lazyMintUpdateData,
      nowTime = Tools.get_now_time();

    // get nft minted on blockchain
    let existNft = await this.parentService.existNft({ nft_id: nftId })
    if (!existNft.success)
      return this.parentService.fail(existNft.mes)

    let nftDB: NftDocument = existNft.data;

    // api on node with alchemy for get my nft report;
    let nftAlchemy = await this.parentService.alchemyWeb3.getOwner(tokenId, contract_address)

    if (
      !nftAlchemy ||
      !nftAlchemy.owners ||
      nftAlchemy.owners[0] != buyer.toLowerCase()
    )
      return this.parentService.fail('nft has not been buy')

    nftDB.history.push(scResponse);
    nftDB.status = NftStatus.sold;
    nftDB.updated_by = buyer;
    nftDB.owner = buyer;
    nftDB.time_updated = Tools.get_now_time().toString()
    nftDB.tokenId = tokenId;
    nftDB.uri = `${process.env.IPFS_GATEWAY}${cid}`;
    nftDB.uri_cid = cid;
    // nftDB.uri_original = 
    // add buy action to nft path
    nftDB.nft_path.push({
      action: NftActions.buy,
      by: buyer,
      price: nftDB.price,
      time: nowTime,
    })

    // update collection fields
    this.marketService.updateCollectionSales(contract_address, nftDB.price);
    this.collectionService.updateOwnersCollection({ contract_address }, nftDB.owner.toString(), tokenId)

    await nftDB.save();

    Logger.log(`buy a new item lazy Mint wiht name : ${nftDB.name} and owner : ${nftDB.creator}`);

  }


  // ******************* with api
  async get_category_web2() {
    return await this.parentService.catWeb2Model.find({});// show: 1 

  }

  /**
   * mint
   * @param {CreateMintDto} createMintDto 
   * @param file 
   * @param user 
   * @returns { Promise<lazyResponse> } Promise<lazyResponse> 
   */
  async mint(createMintDto: CreateMintDto, file: Express.Multer.File, user: User_kycDocument | any): Promise<lazyResponse> {
    const { path, filename } = file;

    const { name, description, tags, category_id, category_web2_id, royalty, _collaborators, description_ui } = createMintDto;
    let owner = user.address,
      image: string,
      nowTime = Tools.get_now_time(),
      collaborators: NftCollaborator[] = JSON.parse(_collaborators.replace("\\", '')),
      fileType = filename.split('.')[1];

    this.globalRequired(createMintDto, user);

    // transfer image on ipfs
    let image_cid = await getIpfsCid({ filename: `nft.${fileType}`, content: fs.readFileSync(`./${path}`) });

    if (category_id)
      image = `${process.env.IPFS_PROTOCOL}${image_cid}`;
    else
      image = `${process.env.IPFS_GATEWAY}${image_cid}`

    // transfer metadata on ipfs
    let metadata = { name, description, image };

    let uri_cid = await getIpfsCid({ filename: `metadata.json`, content: JSON.stringify(metadata) }),
      uri = `${process.env.IPFS_GATEWAY}${uri_cid}`;

    // check exist nft with Repetitious uri
    await this.mintRequired(uri, owner);

    // add Nft data to db
    let newNft = await new this.parentService.nftModel({
      name,
      description,
      description_ui,
      image,
      image_original: `./${path}`,
      image_cid,
      uri,
      uri_original: metadata,
      uri_cid,
      like: [],
      views: [],
      owner,
      creator: owner,
      tags,
      category: category_id,
      category_web2_id,
      status: NftStatus.invisible,
      show: this.parentService.show,
      time_create: nowTime,
      royalty,
      collaborators
    }).save();

    return { data: uri, success: true, newNft };

  }

  /**
   * upload data in server and ready for buy lazy mint
   * @param {CreateLazyMintDto} createMintDto 
   * @param file 
   * @param user 
   * @returns {Promise<lazyMintResponse>}
   */
  async lazyMint(createMintDto: CreateLazyMintDto, file: Express.Multer.File, user: User_kycDocument): Promise<lazyMintResponse> {
    const { path, filename } = file,
      { name, description, tags, category_id, category_web2_id, price, royalty, _collaborators, description_ui } = createMintDto;
    let owner = user.address,
      image: string,
      nowTime = Tools.get_now_time(),
      collaborators: NftCollaborator[] = JSON.parse(_collaborators.replace("\\", '')),
      fileType = filename.split('.')[1];

    this.globalRequired(createMintDto, user);

    let collection = await this.lazyRequired(createMintDto, owner);

    let image_cid = await getIpfsCid({ filename: `nft.${fileType}`, content: fs.readFileSync(`./${path}`) });

    if (category_id)
      image = `${process.env.IPFS_PROTOCOL}${image_cid}`;
    else
      image = `${process.env.IPFS_GATEWAY}${image_cid}`

    // add Nft data to db
    let newNft = await new this.parentService.nftModel({
      name,
      description,
      description_ui,
      image,
      image_original: `./${path}`,
      image_cid,
      // uri,
      // uri_original: metadata,
      // uri_cid,
      like: [],
      views: [],
      owner,
      creator: owner,
      tags,
      category: category_id,
      category_web2_id,
      status: NftStatus.lazy,
      show: this.parentService.show,
      time_create: nowTime,
      royalty,
      collaborators,

      // lazy prop
      price,
      nft_path: [
        {
          action: NftActions.lazyMint,
          by: user.address,
          price: price,
          time: nowTime
        }
      ],
      mintTypes: NftMintTypes.lazyMint
    }).save();

    // update item counter collection
    if (!collection.itemCounter)
      collection.itemCounter = 1;
    else
      collection.itemCounter = collection.itemCounter + 1;
    await collection.save();

    // send notif to all following
    this.notifService.notification({
      address: owner,
      event: NotifEvent.mint
    })

    return { success: true, newNft };//data: uri, 

  }

  /**
   * requirements for lazy upload data
   * @param createMintDto 
   * @param owner 
   * @returns 
   */
  async lazyRequired(createMintDto: CreateLazyMintDto, owner: string): Promise<CategoryDocument> {

    let { price, category_id } = createMintDto;

    // check price >= 50$
    let ethUsd = (await this.nftService.ethPrice()).ethUsd;
    //      /* convert wei to eth */
    let PriceBaseEth = this.parentService.alchemyWeb3.getFromWei(price);

    if (PriceBaseEth < 0.1)
      this.parentService.Error('The price should not be less than 0.1 ether');

    // check user == owner collection & collection be lazy type & total suplay bigger count of item minted
    let collection = await this.parentService.catModel.findOne({
      _id: category_id
    })
    if (
      !collection ||
      collection.type != CollectionType.lazy ||
      collection.owner.toLowerCase() != owner.toLowerCase() ||
      (collection.totalSupply && collection.totalSupply <= collection.itemCounter)
    )
      this.parentService.Error('The collection does not accept this item')

    return collection;
  }

  /**
   * requirements for mint upload data
   * @param uri 
   * @param owner 
   * @returns 
   */
  async mintRequired(uri: string, owner: string) {

    // check exist nft with Repetitious uri
    let checkNft = await this.parentService.nftModel.findOne({ uri });

    if ( // condition for exist uri Repetitious 
      checkNft &&
      ( // And also check that the owner of the nft is the same person
        checkNft.owner.toLowerCase() != owner.toLowerCase() ||
        ( // and status nft invisible
          checkNft.owner.toLowerCase() == owner.toLowerCase() &&
          checkNft.status != NftStatus.invisible
        )
      )
    )
      return this.parentService.Error('You are not able to mint')

  }

  /**
   * function requirements for mint and lazyMinit upload data
   * @param inputs 
   * @param user 
   * @returns 
   */
  globalRequired(inputs: CreateLazyMintDto | CreateMintDto, user: User_kycDocument) {
    let { _collaborators, royalty } = inputs
    let collaborators: NftCollaborator[] = JSON.parse(_collaborators);

    // The first collaborator must be the creator the item
    if (
      collaborators?.length > 0 &&
      user.address != collaborators[0].address
    )
      return this.parentService.Error('The first collaborator must be the creator the item')

    // collaborator check
    let collaboratorsR = this.parentService.Tools.collaboratorRequire(collaborators);
    if (!collaboratorsR.success)
      return this.parentService.Error(collaboratorsR.message)

    // royalty check
    if (royalty > +(this.optionService.royalty.max()))
      return this.parentService.Error(collaboratorsR.message);

  }

}
