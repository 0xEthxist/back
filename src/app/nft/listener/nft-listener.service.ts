import { Injectable, Logger } from '@nestjs/common';
import { NotificationService } from 'src/common/services/notification/notification.service';
import { ParentService } from 'src/common/services/parent.service';
import { ListedStatus, Listedtype } from 'src/schemas/listed.schema';
import { NftActions, NftDocument, NftStatus, OfferStatus } from 'src/schemas/nft.schema';
import { NotifEvent } from 'src/schemas/user_kyc.schema';
import { AcceptOfferData, AddOfferData, CancelOfferData } from '../interface/offer.interface';
import { AuctionSetOption } from '../interface/auction-set.interface';
import { AuctionBidOption, AuctionUpdatedOption, AuctionWithdrawOption } from '../interface/auction.interface';
import { OrderAcceptedFixOption } from '../interface/order-accepte-fix.interface';
import { OrderCancelFixOption } from '../interface/order-cancel-fix.interface';
import { SetOrderFixOption } from '../interface/set-order-fix.interface';
import { SetReserveAuctionOption } from '../interface/reserve.interface';
import { CheckListedListenType } from '../interface/market.interface';
import { MarketService } from './market.service';
import { CollectionService } from 'src/app/collection/collection.service';

@Injectable()
/** Service for implementing logic listeners related to NFT module */
export class NftListenerService {

    /**
     * nft listener service is to handle all received events related to the NFT module
     * @constructor
     * @param parentService 
     */
    constructor(
        private parentService: ParentService,
        private notifService: NotificationService,
        private marketService: MarketService,
        private collectionService: CollectionService
    ) { }

    async checkListedListen(data: CheckListedListenType, type: String, event?: string): Promise<{
        success: Boolean,
        nftDB?: NftDocument,
        nftAlchemy?: any,
    }> {

        let { contract_address, tokenId } = data;//address, 

        // get nft DB
        let existNft = await this.parentService.existNft({ tokenId, contract_address })
        if (!existNft.success)
            return this.parentService.fail(existNft.mes)

        let nftDB = existNft.data;

        // Checking that the item is listed
        if (await this.parentService.listedModel.findOne({ status: ListedStatus.active, tokenId, nft_id: nftDB._id }) && event == 'list')
            return this.parentService.fail('item is listed')

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
            nftAlchemy,
        }
    }


    /**
     * 
     * ******************** fix
     * 
     */

    /**
     * when listen event FixedPriceAccepted and handel buy method
     * In this mode, it is possible that the status is on the fixAdnReserve, which should be closed
     * @param orderAcceptedFixOption 
     * @returns 
     */
    async fixAccepted(orderAcceptedFixOption: OrderAcceptedFixOption): Promise<void> { // buy
        let { address, amount, contract_address, scResponse, tokenId } = orderAcceptedFixOption;
        let now = this.parentService.Tools.get_now_time().toString();

        // get nft DB
        try {
            var nftDB: NftDocument = await this.parentService.getNft({ tokenId, contract_address });
        } catch (error) {
            Logger.error(`error in get Nft method in fixAccepted nft with tokenId: ${tokenId} And contrachAddr: ${contract_address}`)
            return;
        }

        // check if status == fixAndReserve cancel reserve
        if (nftDB.status == NftStatus.fixAndReserve)
            nftDB.nft_path.push(await this.marketService.cancleListed(Listedtype.reserve, nftDB));

        let oldOwner = nftDB.owner;

        // update nft lists to selled
        let listed = await this.parentService.listedModel.findOne({ status: ListedStatus.active, nft_id: nftDB._id, type: Listedtype.fix });
        listed.status = ListedStatus.selled;
        listed.bought_by = address;
        await listed.save();

        // update nft DB
        nftDB.status = NftStatus.sold;
        nftDB.time_updated = now;
        nftDB.time_sold = now;
        nftDB.updated_by = address;
        nftDB.owner = address;
        nftDB.price = listed.fix_price;
        nftDB.nft_path.push({
            action: NftActions.buy,
            by: address,
            price: listed.fix_price,
            time: now
        })
        nftDB.history.push(scResponse)
        nftDB.listed = null
        await nftDB.save();

        this.marketService.updateCollectionSales(contract_address, listed.fix_price);
        this.collectionService.updateOwnersCollection({ contract_address }, nftDB.owner.toString(), +tokenId)

        // send notification for old owner
        this.notifService.notification({
            address,
            event: NotifEvent.buy,
            targetUserAddress: oldOwner,
            message: `${this.parentService.Tools.getUiName(await this.parentService.getUser({ address }))} bought your NFT in fixed price market`
        })

        this.marketService.sendRoyaltyNotif(nftDB, oldOwner);

    }

    /**
     * when listen event FixedPriceCanceled
     * @param orderCancelFixOption 
     * @returns 
     */
    async FixCancelled(orderCancelFixOption: OrderCancelFixOption): Promise<void> { // cancelNft
        let {
            contract_address,
            scResponse,
            tokenId } = orderCancelFixOption,
            now = this.parentService.Tools.get_now_time().toString();

        // get nft DB
        try {
            var nftDB: NftDocument = await this.parentService.getNft({ tokenId, contract_address });
        } catch (error) {
            Logger.error(`error in get Nft method in FixCancelled nft with tokenId: ${tokenId} And contrachAddr: ${contract_address}`)
            return;
        }

        // update nft on DB to minted status or reserve status
        nftDB.status == NftStatus.fixAndReserve ?
            nftDB.status = NftStatus.reserve : // If it was fixAndReserve's status, it will change to reserve
            nftDB.status = NftStatus.minted;
        nftDB.time_updated = now;
        nftDB.updated_by = nftDB.owner;
        /*      add cancel log to nft path */
        nftDB.nft_path.push({
            action: NftActions.cancel,
            by: nftDB.owner,
            price: null,
            time: now
        })
        nftDB.history.push(scResponse)

        // update nft lists
        let listed = await this.parentService.listedModel.findOne({ status: ListedStatus.active, nft_id: nftDB._id, type: Listedtype.fix });
        listed.status = ListedStatus.not_sold;
        await listed.save();

        if (!this.marketService.checkListedInMarket(nftDB))
            nftDB.listed = null


        await nftDB.save();

    }

    /**
     * when listen event FixedPriceSet
     * @param setOrderFixOption 
     * @returns 
     */
    async setFix(setOrderFixOption: SetOrderFixOption): Promise<void> {
        let {
            tokenId,
            contract_address,
            scResponse,
            price } = setOrderFixOption,
            now = this.parentService.Tools.get_now_time().toString();

        // get nft DB
        try {
            var nftDB: NftDocument = await this.parentService.getNft({ tokenId, contract_address });
        } catch (error) {
            Logger.error(`error in get Nft method in setFix nft with tokenId: ${tokenId} And contrachAddr: ${contract_address}`)
            return;
        }

        // update nftDB to fixed item
        nftDB.status == NftStatus.reserve ?
            nftDB.status = NftStatus.fixAndReserve : // If it was reserve's status, it will change to fixAndReserve
            nftDB.status = NftStatus.fix;
        nftDB.time_updated = now;
        nftDB.time_listed = now;
        nftDB.updated_by = nftDB.owner;
        nftDB.nft_path.push({
            action: NftActions.fix,
            by: nftDB.owner,
            price: price,
            time: now
        })
        nftDB.history.push(scResponse)

        // add new document type fix to listed
        let listed = await new this.parentService.listedModel({
            nft_id: nftDB.id,
            time_listed: now,
            tokenId: nftDB.tokenId,
            fix_price: price,
            status: ListedStatus.active,
            type: Listedtype.fix,
        }).save()

        nftDB.listed = listed;
        await nftDB.save();

        Logger.log(`add nft with id ${nftDB.id} to fix`);

        // notification for followers
        this.notifService.notification({
            address: nftDB.owner,
            event: NotifEvent.list,
            linkObject: await this.marketService.createNftObjectLink(nftDB)
        })
    }



    /**
     * 
     * ******************** auction
     * 
     */

    /**
     * when set standard auction
     * @param auctionSetOption 
     * @returns 
     */
    async AuctionSet(auctionSetOption: AuctionSetOption): Promise<void> {
        let {
            baseValue,
            contract_address,
            duration,
            scResponse,
            startTime,
            tokenId } = auctionSetOption,
            now = this.parentService.Tools.get_now_time().toString();

        // get nft from db
        try {
            var nftDB: NftDocument = await this.parentService.getNft({ tokenId, contract_address });
        } catch (error) {
            Logger.error(`error in get Nft method in AuctionSet nft with tokenId: ${tokenId} And contrachAddr: ${contract_address}`)
            return;
        }

        // update nft
        nftDB.status = NftStatus.auction;
        nftDB.time_updated = now;
        nftDB.time_listed = now;
        nftDB.updated_by = nftDB.owner;
        nftDB.nft_path.push({
            action: NftActions.auction,
            by: nftDB.owner,
            price: baseValue,
            time: now
        })
        nftDB.history.push(scResponse)

        // add a new listed document for auction
        let listed = await new this.parentService.listedModel({
            nft_id: nftDB.id,
            time_listed: now,
            tokenId: nftDB.tokenId,
            status: ListedStatus.active,
            type: Listedtype.auction,
            time_start: startTime,
            time_end: (+startTime + +duration),
            base_value: baseValue,
        }).save()

        nftDB.listed = listed;
        await nftDB.save()

        // notif follwers when listed item
        this.notifService.notification({
            address: nftDB.owner,
            event: NotifEvent.list,
            message: `${this.parentService.Tools.getUiName(await this.parentService.getUser(nftDB.owner))} set a standard auction`,
            linkObject: await this.marketService.createNftObjectLink(nftDB)
        })

        // pending notif timer unstarted and unfinished auctions
        this.notifService.notifUnfinishedActions()

    }

    /**
     * handel event AuctionCompleted    => when auction is successfull and has a bid
     * handel event AuctionInvalidated  => when (auction or reserve or reserveFix) canceled And Withdraw after end time by owner
     * @param {AuctionWithdrawOption} auctionWithdrawOption 
     * @returns 
     */
    async auctionWithdraw(auctionWithdrawOption: AuctionWithdrawOption): Promise<void> {
        let {
            contract_address,
            scResponse,
            tokenId,
            auctionWinner,  // success
            soldValue,      // success
            auctionStatus   // Invalidated
        } = auctionWithdrawOption,
            now = this.parentService.Tools.get_now_time().toString();

        // get nft DB
        try {
            var nftDB: NftDocument = await this.parentService.getNft({ tokenId, contract_address });
        } catch (error) {
            Logger.error(`error in get Nft method in auctionWithdraw nft with tokenId: ${tokenId} And contrachAddr: ${contract_address}`)
            return;
        }
        let oldOwner = nftDB.owner;

        // update nft on DB to minted status
        nftDB.updated_by = nftDB.owner;
        nftDB.time_updated = now;
        nftDB.history.push(scResponse)

        // get listed with type auction or reserve
        var listed = await this.parentService.listedModel.findOne({
            tokenId, nft_id: nftDB._id, status: ListedStatus.active,
            $or: [{ type: Listedtype.auction }, { type: Listedtype.reserve }]
        });

        if (listed)
            listed.time_update = now;

        if (auctionStatus) { // There is no bid

            // change nft status
            nftDB.status = (nftDB.status == NftStatus.fixAndReserve) ?
                NftStatus.fix :    // if fixAndReserve => reserve canceled and just status fix
                NftStatus.minted;   // else if( reserve or auction ) status minted

            if (+listed.time_end > +now) { // cancel

                // add cancel log to nft path
                nftDB.nft_path.push({
                    action: NftActions.cancel,
                    by: nftDB.owner,
                    price: null,
                    time: now
                })

            } // else withdraw by nftS'owner


            /** check if this nft not is market remove chash listed field in nft object */
            if (!this.marketService.checkListedInMarket(nftDB))
                nftDB.listed = null

            // update nft listed
            if (listed)
                listed.status = ListedStatus.not_sold;

        } else if (auctionWinner) { // auction successfull
            nftDB.status = NftStatus.sold;
            nftDB.price = soldValue;
            nftDB.time_sold = listed.time_end;
            nftDB.owner = auctionWinner;
            nftDB.listed = null

            // add buy log to nft path
            nftDB.nft_path.push({
                action: NftActions.buy,
                by: auctionWinner,
                price: soldValue,
                time: listed.time_end
            })

            // update nft listed
            listed.status = ListedStatus.selled;
            listed.bought_by = auctionWinner;

            // update collection fields
            this.marketService.updateCollectionSales(contract_address, soldValue);
            this.collectionService.updateOwnersCollection({ contract_address }, auctionWinner.toString(), +tokenId)

            // send notifications 
            Promise.all([
                // someone win in auction notif collection'owner
                this.notifService.notification({
                    address: auctionWinner,
                    event: NotifEvent.auctionSuccess,
                    targetUserAddress: oldOwner,
                    message: `${this.parentService.Tools.getUiName(await this.parentService.getUser({ address: auctionWinner }))} won in your auction`
                }),

                // notif owner for withdraw
                // this.notifService.notification({
                //     event: NotifEvent.withdraw,
                //     targetUserAddress: oldOwner,
                //     message: `withdraw your Ethers` 
                // }),

                // notif won for withdraw
                this.notifService.notification({
                    address: 'admin',
                    event: NotifEvent.withdraw,
                    targetUserAddress: auctionWinner,
                    message: `withdraw your nft`
                }),

                // send royalty notification
                this.marketService.sendRoyaltyNotif(nftDB, oldOwner)
            ])

        }

        await listed.save();
        await nftDB.save();
    }

    /**
     * when emited the AuctionGetsBid event 
     *  For two modes
     *  Standard and reserve
     * @param {AuctionBidOption} auctionBidOption 
     * @returns 
     */
    async auctionBid(auctionBidOption: AuctionBidOption): Promise<void> {
        let { bidTime, bidValue, bidder, contract_address, scResponse, tokenId } = auctionBidOption;

        // Check the conditions for listing
        try {
            var nftDB: NftDocument = await this.parentService.getNft({ tokenId, contract_address });
        } catch (error) {
            Logger.error(`error in get Nft method in auctionUpdated nft with tokenId: ${tokenId} And contrachAddr: ${contract_address}`)
            return;
        }

        var listed = await this.parentService.listedModel.findOne({
            tokenId, nft_id: nftDB._id, status: ListedStatus.active,
            $or: [{ type: Listedtype.auction }, { type: Listedtype.reserve }]
        });
        listed.suggestions.push({
            address: bidder,
            bid: bidValue,
            time: bidTime,
            scResponse: auctionBidOption,
            link: `${process.env.EHTER_SCAN}/tx/${scResponse?.transactionHash}`
        })

        if (nftDB.status != NftStatus.auction) {
            // A condition when  is fixAndReserve
            if (nftDB.status == NftStatus.fixAndReserve)
                // log in nft path for cancle fix
                nftDB.nft_path.push(await this.marketService.cancleListed(Listedtype.fix, nftDB))


            // update listed
            listed.type = Listedtype.auction;
            listed.time_start = bidTime;
            listed.time_end = (+bidTime + +listed.duration).toString();

            nftDB.status = NftStatus.auction;
        }
        await listed.save();
        nftDB.listed = listed;
        await nftDB.save();

        // send notification to previous bidder
        if (listed.suggestions.length > 1) // check exist previous bidder
            this.notifService.notification({
                address: bidder,
                targetUserAddress: listed.suggestions[listed.suggestions.length - 2].address,
                event: NotifEvent.previousBid,
                message: `You have been outbid from ${nftDB.name} Auction`
            })

        // send notification to seller
        this.notifService.notification({
            address: bidder,
            targetUserAddress: nftDB.owner,
            event: NotifEvent.bid,
            message: `${this.parentService.Tools.getUiName(await this.parentService.getUser({ address: bidder }))} placed a bid in your auction`
        })

    }

    /**
     * when a new bid at The last 15 minutes 
     * AND
     * when update price auction 
     * @param auctionPriceUpdated 
     * @returns 
     */
    async auctionUpdated(auctionPriceUpdated: AuctionUpdatedOption): Promise<void> {
        let {
            contract_address,
            newBaseValue,
            scResponse,
            tokenId,
            newEndTime } = auctionPriceUpdated,
            now = this.parentService.Tools.get_now_time();

        // Check the conditions for listing
        // let checkListed = await this.marketService.checkListedListen(auctionPriceUpdated, NftStatus.auction);
        // if (!checkListed.success)
        //     return;

        // let { nftDB } = checkListed
        try {
            var nftDB: NftDocument = await this.parentService.getNft({ tokenId, contract_address });
        } catch (error) {
            Logger.error(`error in get Nft method in auctionUpdated nft with tokenId: ${tokenId} And contrachAddr: ${contract_address}`)
            return;
        }

        let listed = await this.parentService.listedModel.findOne({ tokenId, nft_id: nftDB._id, status: ListedStatus.active });
        if (listed) {
            newBaseValue ?
                listed.base_value = newBaseValue :  // update price
                listed.time_end = newEndTime;        // a new bid at The last 15 minutes 


            listed.time_update = now.toString();
            await listed.save()
            nftDB.listed = listed;

            await nftDB.save();
        }


    }



    /**
     * 
     * ******************** reserve
     * 
     */

    /**
     * handel events ReserveAuctionSet => when set a token in reserve
     * @param {SetReserveAuctionOption} setReserveAuctionOption 
     * @returns 
     */
    async setReserveAuction(setReserveAuctionOption: SetReserveAuctionOption) {
        let { contract_address, scResponse, tokenId, baseValue, tokenStatus, duration } = setReserveAuctionOption;
        let now = this.parentService.Tools.get_now_time().toString();

        // Check the conditions for listing
        // let checkListed = await this.marketService.checkListedListen(setReserveAuctionOption, NftStatus.reserve, 'list');
        // if (!checkListed.success)
        //     return checkListed;

        // let { nftDB } = checkListed
        try {
            var nftDB: NftDocument = await this.parentService.getNft({ tokenId, contract_address });
        } catch (error) {
            Logger.error(`error in get Nft method in auctionUpdated nft with tokenId: ${tokenId} And contrachAddr: ${contract_address}`)
            return;
        }

        // update nftDB to fixed item
        let newStatus = nftDB.status == NftStatus.fix ? NftStatus.fixAndReserve : NftStatus.reserve;
        nftDB.status = newStatus
        nftDB.history.push(scResponse);
        nftDB.updated_by = 'listener';
        nftDB.nft_path.push({
            action: NftActions.reserve,
            by: nftDB.owner,
            price: baseValue,
            time: now
        })
        nftDB.time_updated = now;
        nftDB.time_listed = now;

        // add a reserve document listed 
        let listed = await new this.parentService.listedModel({
            nft_id: nftDB.id,
            tokenId: nftDB.tokenId,

            status: ListedStatus.active,

            type: Listedtype.reserve,
            historyType: Listedtype.reserve,

            time_listed: now,
            duration,

            base_value: baseValue,
        }).save();

        nftDB.listed = listed;
        await nftDB.save();

        Logger.log(`add nft with id ${nftDB.id} to reserve status is : ${tokenStatus}`);

        // notif follwers when listed item
        this.notifService.notification({
            address: nftDB.owner,
            event: NotifEvent.list,
            message: `${this.parentService.Tools.getUiName(await this.parentService.getUser(nftDB.owner))} set a reserved auction`,
            linkObject: await this.marketService.createNftObjectLink(nftDB)
        })

    }



    /**
     * 
     * ******************** offer
     * 
     */

    /**
     * handel event OfferMade
     * add a offer on the item
     * @param {AddOfferData} addOfferData 
     */
    async addOffer(addOfferData: AddOfferData): Promise<void> {
        let { tokenId, contract_address, scResponse, offerer, price } = addOfferData;

        /**
         * get nft
         */
        try {
            var nftDB: NftDocument = await this.parentService.getNft({ tokenId, contract_address });
        } catch (error) {
            Logger.error(`error in get Nft method in addOffer nft with tokenId: ${tokenId} And contrachAddr: ${contract_address}`)
            return;
        }

        /**
         * create link notification
         */
        let link = this.marketService.createNftLink(nftDB);
        let linkObject = await this.marketService.createNftObjectLink(nftDB)

        if (nftDB?.offers?.length > 0) {

            // send notif to previous offerer 
            this.notifService.notification({
                address: offerer,
                targetUserAddress: nftDB.offers.slice(-1)[0].address,
                event: NotifEvent.previousOffer,
                message: `A higher offer than you came in on ${nftDB.name} and the money was returned to your wallet`,
                link,
                linkObject
            })

            // change status before offer to withrawal
            nftDB.offers.slice(-1)[0].status = OfferStatus.withrawal;

            // delete offer from activeOffer user doc
            this.marketService.removeActiveOffer(nftDB)

        }


        /*
        if (
            nftDB?.offers?.length > 0 &&
            offerer.toLowerCase() == nftDB.offers.slice(-1)[0].address.toLowerCase()
        )
            // change message for owner
        */

        // send notif to owner 
        this.notifService.notification({
            address: offerer,
            targetUserAddress: nftDB.owner,
            event: NotifEvent.makeOffer,
            message: `@${this.parentService.Tools.getUiName(await this.parentService.getUser({ address: offerer }))} made an offer on "${nftDB.name}"`,
            link,
            linkObject
        })


        // add active offer on this nft
        let newOffer = {
            address: offerer,
            username: await this.parentService.getUsername(offerer),
            price,
            status: OfferStatus.active,
            create_time: this.parentService.Tools.get_now_time().toString(),
            scResponse
        }
        nftDB.offers.push(newOffer);

        // add active offer to user doc
        this.parentService.userModel.updateOne({ address: this.parentService.Tools.regexCaseInsensitive(offerer) }, {
            $push: {
                activeOffers: {
                    nft_id: nftDB._id,
                    price,
                }
            }
        })

        await nftDB.save();

    }

    /**
     * when listen event OfferAccepted , method for when accpeted a offer
     * @param {AcceptOfferData} acceptOfferData 
     */
    async acceptOffer(acceptOfferData: AcceptOfferData): Promise<void> {
        let { tokenId, contract_address, scResponse, price, offerer } = acceptOfferData;
        let now = this.parentService.Tools.get_now_time().toString();

        /**
         * get nft
         */
        try {
            var nftDB: NftDocument = await this.parentService.getNft({ tokenId, contract_address });
        } catch (error) {
            Logger.error(`error in get Nft method in acceptOffer nft with tokenId: ${tokenId} And contrachAddr: ${contract_address}`)
            return;
        }
        let previousOwner = nftDB.owner;
        // let offerer = nftDB.offers.slice(-1)[0].address;
        // let price = nftDB.offers.slice(-1)[0].price

        /**
         * ready link notif
         */
        let link = this.marketService.createNftLink(nftDB);
        let linkObject = await this.marketService.createNftObjectLink(nftDB)

        // change status last offer or active offer on this nft
        nftDB.offers.slice(-1)[0].status = OfferStatus.accept;
        // change other nft db data { owner, price, status, time_updated, updated_by, nft_path, history }
        nftDB.owner = offerer;
        nftDB.price = price;

        //      If the offer is accepted, other market modes such as fix and reserve should be canceled if any
        if (nftDB.status == NftStatus.reserve || nftDB.status == NftStatus.fixAndReserve) {   // cancle reserve
            let cancleLog = await this.marketService.cancleListed(Listedtype.reserve, nftDB);
            nftDB.nft_path.push(cancleLog);
        }
        if (nftDB.status == NftStatus.fix || nftDB.status == NftStatus.fixAndReserve) {       // cancle fix
            let cancleLog = await this.marketService.cancleListed(Listedtype.fix, nftDB);
            nftDB.nft_path.push(cancleLog);
        }
        nftDB.status = NftStatus.sold;
        nftDB.time_updated = now;
        nftDB.time_sold = now;
        nftDB.updated_by = previousOwner;
        nftDB.nft_path.push({
            action: NftActions.buy,
            by: offerer,
            price,
            time: now
        })
        nftDB.history.push(scResponse)

        Promise.all([
            // send notif to offerer
            this.notifService.notification({
                address: previousOwner,
                targetUserAddress: offerer,
                event: NotifEvent.previousOffer,
                message: `accepted your offer on ${nftDB.name} and transfer item to you`,
                link,
                linkObject
            }),

            // send royalty notification
            this.marketService.sendRoyaltyNotif(nftDB, previousOwner)
        ])

        // update collection fields
        this.marketService.updateCollectionSales(contract_address, price);
        this.collectionService.updateOwnersCollection({ contract_address }, offerer.toString(), +tokenId);

        // delete offer from activeOffer user doc
        this.marketService.removeActiveOffer(nftDB)

        nftDB.listed = null
        await nftDB.save();

    }

    /**
     * method for when cancel a offer
     * @param addOfferData 
     */
    async cancelOffer(cancelOfferData: CancelOfferData): Promise<void> {
        let { tokenId, contract_address, scResponse, offerer } = cancelOfferData;

        /**
         * get nft
         */
        try {
            var nftDB: NftDocument = await this.parentService.getNft({ tokenId, contract_address });
        } catch (error) {
            Logger.error(`error in get Nft method in cancelOffer nft with tokenId: ${tokenId} And contrachAddr: ${contract_address}`)
            return;
        }

        // change status last offer or active offer on this nft to withrawal
        nftDB.offers.slice(-1)[0].status = OfferStatus.withrawal;

        // create link notification /
        let link = this.marketService.createNftLink(nftDB);
        let linkObject = await this.marketService.createNftObjectLink(nftDB)

        // send notif to owner 
        this.notifService.notification({
            address: offerer,
            targetUserAddress: nftDB.owner,
            event: NotifEvent.previousOffer,
            message: `@${this.parentService.Tools.getUiName(await this.parentService.getUser({ address: offerer }))} canceled & withdrawed her/his offer on "${nftDB.name}"`,
            link,
            linkObject
        })
        // delete offer from activeOffer user doc
        this.marketService.removeActiveOffer(nftDB);

        await nftDB.save();

    }


}
