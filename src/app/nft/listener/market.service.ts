import { Injectable } from '@nestjs/common';
import { NotificationService } from 'src/common/services/notification/notification.service';
import { ParentService } from 'src/common/services/parent.service';
import { CategoryDocument } from 'src/schemas/category.schema';
import { ListedStatus, Listedtype } from 'src/schemas/listed.schema';
import { NftActions, NftDocument, NftStatus } from 'src/schemas/nft.schema';
import { linkData, NotifEvent } from 'src/schemas/user_kyc.schema';
import { CheckListedListenType } from '../interface/market.interface';

@Injectable()
/** Service for logic related to contract market */
export class MarketService {

    /**
     * market service is to handle all market events related to the NFT module
     * @constructor
     * @param parentService 
     */
    constructor(private parentService: ParentService,
        private notifService: NotificationService) { }


    async checkListedListen(data: CheckListedListenType, type: String, event?: string): Promise<{
        success: Boolean,
        nftDB?: NftDocument,
        nftAlchemy?: any,
    }> {

        let { contract_address, tokenId } = data;

        // get nft DB
        let nftDB = await this.parentService.getNft({ tokenId, contract_address })

        // Checking that the item is listed
        // if (await this.parentService.listedModel.findOne({ status: ListedStatus.active, tokenId, nft_id: nftDB._id }) && event == 'list')
        //     return this.parentService.fail('item is listed')

        // get nft owner with alchemy
        let nftAlchemy = await this.parentService.alchemyWeb3.getOwner(nftDB.tokenId, contract_address)

        // Checking the existence of nft in our artaniom contract
        var newOwner = process.env.market;

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
     * helper fucntion for cancel listed nftS
     * @param typeListed 
     * @param nft_id 
     */
    async cancleListed(typeListed: Listedtype, nftDB: NftDocument) {
        await this.parentService.listedModel.updateOne({ status: ListedStatus.active, nft_id: nftDB._id, type: typeListed }, {
            status: ListedStatus.not_sold
        });

        let action = typeListed == Listedtype.reserve ?
            NftActions.cancelReserve :
            NftActions.cancel;

        return {
            action: action,
            by: nftDB.owner,
            price: null,
            time: this.parentService.Tools.get_now_time()
        }
    }

    /**
     * method update fields of collection after per sale
     * @param collectionAddress 
     * @param bargainedPrice 
     */
    async updateCollectionSales(collectionAddress: string, bargainedPrice: number | Number): Promise<void> {

        let collection = await this.parentService.dataServices.category.get({ contract_address: collectionAddress });
        if (!collection)
            return;

        if (!collection.floor_price || +collection.floor_price > +bargainedPrice)
            collection.floor_price = +bargainedPrice;

        collection.total_sales = collection.total_sales ? (+collection.total_sales + +bargainedPrice) : +bargainedPrice;

        await collection.save();
    }

    /**
     * delete offer from activeOffer user doc
     * @param nftDB 
     */
    async removeActiveOffer(nftDB: NftDocument) {

        await this.parentService.userModel.updateOne({ address: this.parentService.Tools.regexCaseInsensitive(nftDB.offers.slice(-1)[0].address.toString()) }, {
            $pull: {
                activeOffers: {
                    nft_id: nftDB._id,
                    price: nftDB.offers.slice(-1)[0].price
                }
            }
        })

    }

    /**
     * send royalty notification
     * @param nftDB 
     */
    async sendRoyaltyNotif(nftDB: NftDocument, oldOwner: any) {
        // let royalty = nftDB.royalty;
        let primary = true;

        nftDB.nft_path.map(np => {
            if (np.action === NftActions.buy){
                primary = false;
            }
        })

        if (!primary)
            await this.notifService.notification({
                message: `You have received royalty fee`,
                targetUserAddress: nftDB.creator,
                event: NotifEvent.royalty,
                link: this.createNftLink(nftDB),
                linkObject: await this.createNftObjectLink(nftDB)
            })
    }

    /**
     * create nft api endpoind
     * @param nftDB 
     * @returns 
     */
    createNftLink(nftDB: NftDocument) {
        return `/api/nft?tokenId=${nftDB.tokenId}&creator=${nftDB.creator}&collection=${nftDB.category}`;
    }

    /**
     * create nft api endpoind
     * @param nftDB 
     * @returns 
     */
    async createNftObjectLink(nftDB: NftDocument): Promise<linkData> {

        let collectionName = (await this.parentService.getCollectionWithOption({ contract_address: nftDB.category }))?.name || null;
        return {
            tokenId: nftDB.tokenId,
            creator: nftDB.creator,
            collectionName
        }
    }

    /**
     * Checking whether an item is in the market or not
     * @param nftDB 
     * @returns 
     */
    checkListedInMarket(nftDB: NftDocument): boolean {
        if (
            nftDB.status == NftStatus.fix ||
            nftDB.status == NftStatus.reserve ||
            nftDB.status == NftStatus.fixAndReserve ||
            nftDB.status == NftStatus.auction
        )
            return true;

        return false;
    }

}
