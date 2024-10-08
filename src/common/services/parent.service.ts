import { HttpException, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, HydratedDocument, Model } from 'mongoose';
import Tools, { _Tools } from 'src/helper/tools';
import { nftEtherscanLink, trxEtherscanLink } from 'src/helper/web3/etherscan-links';
import alchemyWeb3 from 'src/providers/alchemy-web3';
import { Admin, AdminDocument } from 'src/schemas/admin.schema';
import { Category, CategoryDocument } from 'src/schemas/category.schema';
import { Category_web2, Category_web2Document } from 'src/schemas/category_web2.schema';
import { Listed, ListedDocument, ListedStatus, Listedtype } from 'src/schemas/listed.schema';
import { Log, LogDocument } from 'src/schemas/log.schema';
import { Marketing, MarketingDocument } from 'src/schemas/marketing.schema';
import { Nft, NftActions, NftDocument, NftStatus } from 'src/schemas/nft.schema';
import { Trash, TrashDocument } from 'src/schemas/trash.schema';
import { NotifEvent, User_kyc, User_kycDocument } from 'src/schemas/user_kyc.schema';
import { collectionWithOption } from './interface/collection.interface';
import { ExistNft } from './interface/exist-nft.interface';
import { GetCollectionOption, GetCollectionOptionProcess } from './interface/get-collection-option.interface';
import { NewUser } from './interface/new-user.interface';
import { getNftOption, getNftOptionWithCollection, NftAuctionsFilter } from './interface/nft.interface';
import { ProccessNftInterface } from './interface/process-nft.interface';
import { methodsQuery, paginationParams, paginationResult } from './interface/query.interface';
import { GetUserOption } from './interface/user.interface';
import { IDataServices } from './repository/abstract-data-services';
import { MongoGenericRepository } from './repository/mongo-generic-repository';

@Injectable()
export class ParentService {

    public Tools: _Tools;
    public alchemyWeb3 = alchemyWeb3;

    // core data
    public zeroAddress = '0x0000000000000000000000000000000000000000';
    public show: boolean = true;
    public lazyLimit: number = 50; // 50$

    constructor(
        @InjectModel(User_kyc.name) public userModel: Model<User_kycDocument>,
        @InjectModel(Nft.name) public nftModel: Model<NftDocument>,
        @InjectModel(Category.name) public catModel: Model<CategoryDocument>,
        @InjectModel(Listed.name) public listedModel: Model<ListedDocument>,
        @InjectModel(Category_web2.name) public catWeb2Model: Model<Category_web2Document>,
        @InjectModel(Marketing.name) public marketingModel: Model<MarketingDocument>,
        @InjectModel(Log.name) public LogModel: Model<LogDocument>,
        @InjectModel(Trash.name) public TrashModel: Model<TrashDocument>,
        @InjectModel(Admin.name) public adminModel: Model<AdminDocument>,
        public dataServices: IDataServices,
        // private crmServices: ICrmServices,
        public configService: ConfigService
    ) {
        this.Tools = Tools;
    }

    fail(mes: string | {}) {
        return this.configService.get('failService')(mes);
    }

    success(data?: string | {}) {
        return this.configService.get('successService')(data)
    }

    Error(mes: string | {}, code?) {
        if (!code)
            code = 400;

        throw new HttpException({
            success: false,
            message: mes,
        }, code)
    }

    // ==== nft methods ====
    async processNft(nftDBo: NftDocument, addressRequested: String) {

        let nftDB: ProccessNftInterface = nftDBo.toObject(),
            nowTime = this.Tools.get_now_time(),
            isOwner = addressRequested && nftDB.owner.toLowerCase() == addressRequested.toLowerCase();

        nftDB['isOwner'] = isOwner;
        nftDB['likeCount'] = nftDB.like.length;
        nftDB['viewsCount'] = nftDB.views.length;
        delete nftDB.views; // delete views log from json result

        // get contract data nft
        let collection = await this.getCollection({ id: nftDB.category });

        /**
         * create etherscan link
         * create etherscan link mit transaction
         */
        nftDB['etherscan'] = nftEtherscanLink(collection.contract_address, nftDB.tokenId);
        nftDB['createEtherscan'] = trxEtherscanLink(nftDB?.history[0]?.transactionHash);

        /** check exist offer */
        nftDB['activeOffer'] = this.Tools.getExistOffer(nftDB.offers);

        await this.nftStatusHandeler(nftDB, addressRequested, collection);

        // // check status fix or auction
        // switch (nftDB.status) {
        //     case NftStatus.fix: // fix list
        //         let fix = await this.listedModel.findOne({
        //             nft_id: nftDB._id,
        //             tokenId: nftDB.tokenId,
        //             type: Listedtype.fix,
        //             status: ListedStatus.active
        //         })
        //         nftDB['listedData'] = fix;
        //         nftDB['currentOwner'] = process.env.fix;
        //         if (isOwner)
        //             nftDB['cancelable'] = true;

        //         break;

        //     case NftStatus.auction: // Auction list

        //         let Auction = await this.listedModel.findOne({
        //             nft_id: nftDB._id,
        //             tokenId: nftDB.tokenId,
        //             type: Listedtype.auction,
        //             status: ListedStatus.active,
        //             // time_end: { $gte: nowTime },
        //             // time_start: { $lte: nowTime },
        //         })
        //         nftDB['listedData'] = Auction;
        //         nftDB['currentOwner'] = process.env.auction;

        //         if (Auction) {
        //             let suggestionsLength = Auction.suggestions.length;

        //             if (+Auction.time_end >= nowTime) {
        //                 // check exist bid and is owner for access to cancel auction
        //                 if (isOwner)
        //                     if (suggestionsLength < 1)
        //                         nftDB['cancelable'] = true;
        //                     else
        //                         nftDB['activeOffer'] = false;


        //                 if (+Auction.time_start <= nowTime)
        //                     nftDB['activeAuction'] = true;

        //             } else { // after time end auction
        //                 nftDB['activeAuction'] = false;

        //                 // check exist bider or no
        //                 // The condition is that the visitor is the owner of the item or the last bider
        //                 if (
        //                     addressRequested == nftDB.owner ||
        //                     addressRequested == Auction?.suggestions[suggestionsLength - 1]?.address
        //                 ) {
        //                     nftDB['withdraw'] = true;

        //                     nftDB['activeOffer'] = false;

        //                     nftDB['withdrawOption'] = {
        //                         tokenId: nftDB.tokenId,
        //                         address: collection.contract_address
        //                     }
        //                 }


        //             }

        //             // nft_path
        //             await Promise.all(Auction.suggestions.map(async bid => {
        //                 bid.biderData = await this.getUser({ address: bid.address }, ['avatar'])
        //                 bid.address = await this.getUsername(bid.address);
        //                 // bid.time = (new Date(+bid.time * 1000)).toLocaleString();
        //                 if (!bid.link)
        //                     bid.link = `${process.env.EHTER_SCAN}/tx/${bid?.scResponse?.scResponse?.transactionHash}`;
        //                 return bid
        //             }))

        //             Auction.suggestions.reverse();

        //         }
        //         break;

        //     default:
        //         break;
        // }

        // get user data owner and creator and categroy web2 data
        let [ownerData, creatorData, categoryWeb2Data] = await Promise.all([
            this.getUser({ address: nftDB.owner }),
            this.getUser({ address: nftDB.creator }),
            this.getCatWeb2(typeof (nftDB.category_web2_id) === 'object' ? nftDB.category_web2_id[0] : nftDB.category_web2_id)
        ]);
        nftDB['ownerData'] = ownerData
        nftDB['creatorData'] = creatorData
        nftDB['categoryWeb2Data'] = categoryWeb2Data

        // nft_path
        nftDB.nft_path.reverse()
        await Promise.all(nftDB.nft_path.map(async path => {
            path.by = await this.getUsername(path.by);
            path['message'] = this.Tools.createMessageNftLogs(path);
            return path
        }))

        // get type file from orginal
        let image_originalArr = nftDB.image_original.split('.');
        nftDB['typeFile'] = image_originalArr[image_originalArr.length - 1];

        // reverse offrers
        nftDB.offers.reverse();

        return nftDB;
        // return JSON.parse(JSON.stringify(nftDB));
    }

    /**
     * handel nft status {fix, reserve , auction , fixAdnReserve, offer}
     * @param nftDB 
     * @param addressRequested 
     */
    async nftStatusHandeler(nftDB: ProccessNftInterface, addressRequested, collection) {
        let nowTime = this.Tools.get_now_time();

        const getActiveListed = async (type: string) => {

            return await this.dataServices.listed.get({
                nft_id: nftDB._id,
                tokenId: nftDB.tokenId,
                type: type,
                status: ListedStatus.active
            })
        }
        nftDB['currentOwner'] = process.env.market;
        switch (nftDB.status) {
            case NftStatus.fix:     // fix status
                // user repository layer for query
                nftDB['listedData'] = await getActiveListed(Listedtype.fix)
                if (nftDB.isOwner) nftDB['cancelable'] = true;
                break;


            case NftStatus.auction: // Auction status
                let Auction = await getActiveListed(Listedtype.auction)
                nftDB['listedData'] = Auction;
                if (Auction) {
                    let suggestionsLength = Auction.suggestions.length;
                    nftDB.havingBid = suggestionsLength > 0

                    if (+Auction.time_end >= nowTime) {
                        // check exist bid and is owner for access to cancel auction
                        if (nftDB.isOwner)
                            if (!nftDB.havingBid) nftDB['cancelable'] = true;

                        if (+Auction.time_start <= nowTime)
                            nftDB['activeAuction'] = true;

                    } else { // after time end auction
                        nftDB['activeAuction'] = false;

                        // check exist bider or no
                        // The condition is that the visitor is the owner of the item or the last bider
                        if (
                            addressRequested == nftDB.owner ||
                            addressRequested == Auction?.suggestions[suggestionsLength - 1]?.address
                        ) {
                            nftDB['withdraw'] = true;

                            nftDB['withdrawOption'] = {
                                tokenId: nftDB.tokenId,
                                address: collection.contract_address
                            }
                        }


                    }

                    // nft_path
                    await Promise.all(Auction.suggestions.map(async bid => {
                        bid.biderData = await this.getUser({ address: bid.address }, ['avatar'])
                        bid.address = await this.getUsername(bid.address);
                        // bid.time = (new Date(+bid.time * 1000)).toLocaleString();
                        if (!bid.link)
                            bid.link = `${process.env.EHTER_SCAN}/tx/${bid?.scResponse?.scResponse?.transactionHash}`;
                        return bid
                    }))

                    Auction.suggestions.reverse();

                }

                break;

            case NftStatus.reserve: // reserve status
                // user repository layer for query
                nftDB['reserveData'] = await getActiveListed(Listedtype.reserve)
                if (nftDB.isOwner) nftDB['cancelable'] = true;
                break;

            case NftStatus.fixAndReserve:
                // user repository layer for query
                nftDB['listedData'] = await getActiveListed(Listedtype.fix)
                nftDB['reserveData'] = await getActiveListed(Listedtype.reserve)
                if (nftDB.isOwner) nftDB['cancelable'] = true;
                break;


            default:
                break;
        }
    }

    /**
     * this method for show or unshow ui button and detecte Allowed actions
     * @param nftData 
     * @param isOwner 
     * @returns 
     */
    permisionNft(nftData: ProccessNftInterface, isOwner: Boolean, address: string): any {

        let Permision = {
            fix: false,

            reserve: false,

            auction: false,
            cancel: false,
            edit: false,
            buy: false,         // for fix & auction & reserve
            withdraw: false,

            lazy: false,

            offer: false,       // owned
            acceptOffer: false, // owned
            cancelOffer: false, // offerer
        }

        if (nftData.show) {
            if (isOwner) {

                if (nftData.activeOffer)
                    Permision.acceptOffer = true;

                if (nftData.withdraw) {
                    Permision.withdraw = true;
                    if (nftData.havingBid)
                        Permision.acceptOffer = false; // if nft is after end time and exist bid 

                } else if (nftData.cancelable)
                    Permision.cancel = true;

                else if (nftData.activeAuction)
                    Permision.acceptOffer = false;

                else if (nftData.status == NftStatus.lazy)
                    Permision.edit = true;

                else {
                    Permision.fix = true;
                    Permision.reserve = true;
                    Permision.auction = true;
                }

                if (nftData.status == NftStatus.reserve)
                    Permision.fix = true;
                else if (nftData.status == NftStatus.fix)
                    Permision.reserve = true;


            } else {

                // offerer always ready for cancel offer
                if (nftData?.activeOffer?.address == address)
                    Permision.cancelOffer = true;

                if (nftData.status == NftStatus.lazy)
                    Permision.lazy = true;

                if (nftData.withdraw)
                    Permision.withdraw = true;
                else if (
                    nftData.activeAuction ||
                    nftData.status == NftStatus.fix ||
                    nftData.status == NftStatus.reserve ||
                    nftData.status == NftStatus.fixAndReserve
                )
                    Permision.buy = true;

                // offer 
                Permision.offer = true;
                if (
                    (nftData.activeAuction) ||
                    Permision.lazy ||
                    (nftData.withdraw && nftData.havingBid)
                )
                    Permision.offer = false


            }

            return Permision;
        }
    }

    async existNft(input: ExistNft) {

        let { nft_id, address, contract_address, category } = input;

        if (address && nft_id) {
            address = this.Tools.regexCaseInsensitive(address);

            var nftDB = await this.nftModel.findOne({ _id: nft_id, owner: address });
        } else if (nft_id)
            var nftDB = await this.nftModel.findOne({ _id: nft_id });
        else {
            if (input.owner)
                input.owner = this.Tools.regexCaseInsensitive(input.owner);
            // when not exist category wich is a id from collections get it from another data likes `contract_address`
            if (contract_address && !category)
                // Getting Collection id if is not artaniom
                input.category = (contract_address.toLowerCase() == process.env.CONTRACT_ADDRESS.toLowerCase()) ? '' :
                    (await this.getCollectionWithOption({
                        contract_address: this.Tools.regexCaseInsensitive(contract_address)
                    }))?._id;

            delete input.contract_address;


            var nftDB = await this.nftModel.findOne(input);

        }

        if (!nftDB)
            return this.fail('nft not found');

        return this.success(nftDB)
    }

    async getNft(input: ExistNft): Promise<NftDocument> {

        // get nft DB
        let existNft = await this.existNft(input)
        if (!existNft.success)
            this.Error(existNft?.mes, 404)

        return existNft.data;
    }

    async getNfts(option: getNftOptionWithCollection, filter?: object, methods?: methodsQuery) {

        if (methods)
            var { pagination } = methods;

        (methods && methods.show == 'all') ?
            Logger.log('in get nfts show == true or false') :
            option.show = true;

        // check condition for minted and listed just
        if (!option.status)
            option.status = { $ne: NftStatus.invisible }

        if (pagination?.page) {
            var PQuery = await this.pagination<Nft, NftDocument>(pagination);
            var nftsOrg = PQuery.results;
            delete PQuery.results;
        } else {
            var nftsOrg = await this.dataServices.nft.getAll(option, filter, methods?.limit, methods?.sort);
        }

        let nfts = JSON.parse(JSON.stringify(nftsOrg));
        // let nfts: ProccessNftInterface[] = nftsOrg;

        for (let i = 0; i < nfts.length; i++) {
            let { owner, creator, image_original, category, _id } = nfts[i];

            let [ownerData, creatorData] = await Promise.all([
                this.getUser({ address: owner }, ['avatar', 'username', 'address']),
                this.getUser({ address: creator }, ['avatar', 'username', 'address'])
            ]);
            nfts[i]['creatorData'] = creatorData;
            [nfts[i].owner, nfts[i].creator] = [ownerData?.username || owner, creatorData?.username || creator];

            // get type file from orginal
            let image_originalArr = image_original.split('.');
            let type = image_originalArr[image_originalArr.length - 1];
            nfts[i]['typeFile'] = type;

            if (methods && methods.collection && category)
                nfts[i]['collection'] = await this.getCollectionWithOption({ _id: category });

            if (
                // (option.status == NftStatus.auction || option.status == { $in: NftStatus.auction }) &&
                methods?.isAuction &&
                (await this.nftAuctions({ time_end: true, time_start: true, queryOption: { nft_id: _id } })).length < 1
            )
                nfts.splice(i, 1);

            if (methods?.UpcomingAuction && (await this.nftAuctions({ time_start: 'Upcoming', queryOption: { nft_id: _id } })).length < 1)
                nfts.splice(i, 1);

        }

        if (pagination?.page)
            return { nfts: JSON.parse(JSON.stringify(nfts)), ...PQuery }

        return JSON.parse(JSON.stringify(nfts));
    }

    async nftAuctions(filter?: NftAuctionsFilter): Promise<Nft[]> {
        let { time_end, time_start, queryOption } = filter

        // get auction nfts
        let nftsAuction = await this.getNfts({ status: NftStatus.auction, ...queryOption });

        let nowTime = this.Tools.get_now_time();

        let resutlListed =
            await nftsAuction.reduce(async (result, auctionList: NftDocument) => {

                let listedAuction: Listed = await this.listedModel.findOne({
                    tokenId: auctionList.tokenId,
                    nft_id: auctionList._id,
                    type: Listedtype.auction,
                    status: ListedStatus.active,
                    ...(time_end) && { time_end: { $gte: nowTime } },
                    ...(time_start === true) && { time_start: { $lte: nowTime } },
                    ...(time_start === 'Upcoming') && { time_start: { $gte: nowTime } }
                })
                if (listedAuction) {
                    auctionList.listed = listedAuction;
                    (await result).push(auctionList);
                }

                return result;

            }, [])

        return resutlListed;

    }

    // ==== collection methods ====
    async getCollection(option: { id?: any, name?: String, owner?: String }) {
        let { id, name, owner } = option;

        if (id) {
            return await this.catModel.findOne({ _id: id });

        }
        else if (name) {
            return await this.catModel.findOne({
                name: {
                    $regex: new RegExp('^' + name.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&') + '$', 'i')
                }
                , owner
            });
        }
        else {

            return {
                name: process.env.NAME ?? 'artaniom',
                symbol: process.env.SYMBOL ?? 'artaniom',
                contract_address: process.env.CONTRACT_ADDRESS
            }
        }

    }

    async getCollectionWithOption(option: GetCollectionOption, processOption?: GetCollectionOptionProcess): Promise<collectionWithOption> {

        if (option && option.name)
            option.name = { $regex: new RegExp('^' + option.name.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&') + '$', 'i') }


        let collectionOrg = await this.catModel.findOne(option);

        let collection = JSON.parse(JSON.stringify(collectionOrg))

        if (collection) {

            // *** check process and done on collection ***
            if (processOption) {
                if (processOption.category_web2)
                    // get web2 data
                    collection['category_web2'] = await this.getCatWeb2(collection.category_web2_id)

                if (processOption.abi)
                    // get abi
                    collection.abi = await this.Tools.getAbi(collection.abi)
                else
                    delete collection.abi;

                if (processOption.owner_data)
                    // get owner data
                    collection['ownerData'] = await this.getUser({ address: collection.owner })

                if (processOption.nfts)
                    // get nfts
                    collection['nfts'] = await this.getNfts({ category: collection._id }, ['creator', 'owner', 'price', 'image_original', 'image', 'show', 'name', 'nft_path'])
            }
            // *** END check process and done on collection ***

            collection.time_created = this.Tools.timeStamp_2_date(collection.time_created);

        }

        return JSON.parse(JSON.stringify(collection));
    }

    async getCollectionsWithOption(option: GetCollectionOption, processOption?: GetCollectionOptionProcess, methods?: methodsQuery<Category>, filter?: object) {

        if (methods)
            var { pagination } = methods;

        if (option && option.name && typeof option.name == 'string')
            option.name = { $regex: new RegExp('^' + option.name.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&') + '$', 'i') }

        if (pagination?.page) {
            var PQuery = await this.pagination<Category, CategoryDocument>(pagination);
            var collectionsOrg = PQuery.results;
            delete PQuery.results;
        } else {
            var collectionsOrg = await this.dataServices.category.getAll(option, filter, methods?.limit, methods?.sort);
        }


        let collections = JSON.parse(JSON.stringify(collectionsOrg))

        await Promise.all(collections.map(async collection => {
            if (collection) {

                // *** check process and done on collection ***
                if (processOption) {
                    if (processOption.category_web2)
                        // get web2 data
                        collection['category_web2'] = await this.getCatWeb2(collection.category_web2_id)

                    if (processOption.abi)
                        // get abi
                        collection.abi = await this.Tools.getAbi(collection.abi)
                    else
                        delete collection.abi;

                    if (processOption.owner_data)
                        // get owner data
                        collection['ownerData'] = await this.getUser({ address: collection.owner })

                    if (processOption.nfts)
                        // get nfts
                        collection['nfts'] = await this.getNfts({ category: collection._id })//['creator', 'image_original', 'image', 'show', 'name']
                }
                // *** END check process and done on collection ***

                collection.time_created = this.Tools.timeStamp_2_date(collection.time_created);

                return collection;
            }
        }))

        if (pagination?.page)
            return { collections: JSON.parse(JSON.stringify(collections)), ...PQuery }
            
        return JSON.parse(JSON.stringify(collections));
    }


    // ==== user methods ====
    async getNftCreator(creator: any) {
        if (creator.includes('0x'))// && creator.length == 40
            return this.Tools.regexCaseInsensitive(creator);

        let user = await this.userModel.findOne({ username: this.Tools.regexCaseInsensitive(creator) });
        if (user)
            return this.Tools.regexCaseInsensitive(user.address);

        return this.Error(`creator in invalid`, 400);

    }

    async getUsername(address: String) {
        if (!address)
            return address;

        let addressValue = { $regex: new RegExp('^' + address.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&') + '$', 'i') };
        let user = await this.userModel.findOne({ address: addressValue });

        return user ? (user.username ?? user.address) : address;

    }

    async getUser(option: FilterQuery<User_kyc>, filter?: object) {

        if (option.address)
            option.address = { $regex: new RegExp('^' + option.address.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&') + '$', 'i') };

        let user = await this.userModel.findOne(option, filter);

        return user;
    }

    async getUsers(option: GetUserOption, filter?: object, methods?: methodsQuery) {

        if (option.address)
            option.address = { $regex: new RegExp('^' + option.address.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&') + '$', 'i') };

        let limit = 1000;
        if (methods && methods.limit)
            limit = methods.limit;

        let users = await this.userModel.find(option, filter).limit(limit);

        return users;
    }

    async checkUser(option: {}) {
        return await this.userModel.findOne(option);

    }

    async createUser(data: NewUser) {
        let { address, name } = data;

        let userExist = this.checkUser({ address }).then(response => {
            if (response)
                return true;

            return false;
        })

        if (!userExist)
            await new this.userModel(data).save();
    }

    // ==== cat web2 methods ====
    async getCatWeb2(id?: String): Promise<any> {
        if (id)
            return await this.catWeb2Model.findById(id)

        return await this.catWeb2Model.find();
    }

    // ==== global ====
    /**
     * pagination query on database collections
     * @param {Model<T>} M 
     * @param page 
     * @param limitOfDocuments 
     * @returns 
     */
    async pagination<T, TDoc>(inputs: paginationParams<T>): Promise<paginationResult<T>> {
        // M: Model<T>, page: number, limitOfDocuments: number, sort?: any
        let { limit, page, sort, filter, projection, queryModel } = inputs;
        let repository = new MongoGenericRepository<T, TDoc>(queryModel);
        let pageIndex = (page - 1)
        if (!sort) sort = { _id: 1 };

        const count = await repository.count(filter);


        let pagesNumber = Math.ceil(count / limit),
            lastPage = pagesNumber == page;

        if (page > pagesNumber || page < 1) {
            Logger.warn(count)
            Logger.warn(page)
            Logger.warn(pagesNumber)
            if (page == 1)
                this.Error('There are no items', 404)

            this.Error('invalid page number', 400);
        }

        if (lastPage) {
            var newLimit = (count - (pageIndex * limit))
            if (newLimit < limit) {
                var newPage = 0;
                var newSort = sort ? this.Tools.reversSort(sort) : { _id: -1 };
                var flagLastPage = true;
            } else {
                newLimit = null
            }
        }

        let documentsToSkip = (newPage ?? pageIndex) * limit;


        const results = await repository.pagination(documentsToSkip, newLimit ?? limit, newSort ?? sort, filter, projection);

        if (flagLastPage)
            results.reverse();

        return {
            results,
            pagesNumber,
            count,
            lastPage
        }
    }

}
