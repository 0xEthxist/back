import { Injectable, Logger } from "@nestjs/common";
import { NftListenerService } from "src/app/nft/listener/nft-listener.service";
import { ParentService } from "src/common/services/parent.service";
import instance from "./instance";
const contractName = 'market';
let queueTokenInfo = [];

@Injectable()
export class MarketerviceWs {

    private socketInstance: any;
    private ignoreEventTokenInfo = ['TokenInfo']

    constructor(private parentService: ParentService,
        private nftListenerService: NftListenerService) { }

    onModuleInit() {
        this.createListener()
    }

    createListener() {
        this.socketInstance = instance(contractName, process.env.market);
        Logger.log(`create ${contractName} listener`)
        this.listener();
    }

    listener() {
        this.socketInstance.events.allEvents(async (err, events) => {

            console.log('events', events);

            // handel error listener and handel crash 
            if (err) {
                Logger.error(`error in ${contractName} listener`, err);
                this.createListener()
                return;
            }

            Logger.log(`in ${events.event} listen`);

            // check event not include of ignore event list => ignore events = All the events that do not need to get {tokenId, collection}
            let return_values = events.returnValues;
            if (!this.ignoreEventTokenInfo.includes(events.event)) {
                var { returnValues } = await this.searchInQueue(events.blockNumber);
                var { collection, tokenId, tokenVendor } = returnValues;
            }

            switch (events.event) {
                case 'TokenInfo':
                    queueTokenInfo.push(events);
                    break;

                /**
                 * **************** auction
                 */

                // when Withdraw owner or last bider
                case "AuctionCompleted":
                    var { auctionWinner, soldValue } = return_values;
                    this.nftListenerService.auctionWithdraw({
                        contract_address: collection,
                        tokenId,
                        scResponse: events,

                        auctionWinner,
                        soldValue,
                    })
                    break;

                // when place a bid on auction
                case "AuctionGetsBid":
                    var { bidder, bidValue, executionTime } = return_values;
                    this.nftListenerService.auctionBid({
                        contract_address: collection,
                        tokenId,
                        scResponse: events,

                        bidValue,
                        bidTime: executionTime,
                        bidder
                    })
                    break;

                // when set a Reserve auction
                case "ReserveAuctionSet":
                    var { tokenStatus, baseValue, duration } = return_values;
                    this.nftListenerService.setReserveAuction({
                        contract_address: collection,
                        tokenId,
                        scResponse: events,

                        baseValue,
                        tokenStatus,
                        duration
                    })
                    break;

                // when cancel or Withdraw while there is no bid
                case "AuctionInvalidated":
                    var { auctionStatus } = return_values;
                    this.nftListenerService.auctionWithdraw({
                        contract_address: collection,
                        tokenId,
                        scResponse: events,

                        auctionStatus,
                    })
                    break;

                // when a new bid at The last 15 minutes
                case "AuctionTimeExtended":
                    var { newEndTime } = return_values;
                    this.nftListenerService.auctionUpdated({
                        contract_address: collection,
                        tokenId,
                        scResponse: events,

                        newEndTime,

                    })
                    break;

                // when updated price auction 
                case "AuctionValueUpdated":
                    var { lastValue, newValue } = return_values;
                    this.nftListenerService.auctionUpdated({
                        contract_address: collection,
                        tokenId,
                        scResponse: events,

                        newBaseValue: newValue
                    })
                    break;

                // when create a auction
                case "StandardAuctionSet":
                    var { baseValue, startTime, duration } = return_values;
                    this.nftListenerService.AuctionSet({
                        baseValue,
                        contract_address: collection,
                        duration,
                        startTime,
                        tokenId,
                        scResponse: events
                    })
                    break;



                /**
                 * **************** fix
                 */

                // when Accepted a fix
                case "BuyOrderAccepted":
                    var { buyer, soldValue, wasOnReserveAuctionToo } = return_values;
                    this.nftListenerService.fixAccepted({
                        address: buyer,
                        contract_address: collection,
                        tokenId,
                        amount: soldValue,
                        scResponse: events
                    })
                    break;

                // when cancel a fix
                case "SellOrderCanceled":
                    var { lastPrice, tokenStatus } = return_values;
                    this.nftListenerService.FixCancelled({
                        contract_address: collection,
                        tokenId,
                        scResponse: events
                    })
                    break;

                // when set an nft to fix
                case "SellOrderSet":
                    var { price, tokenStatus } = return_values;
                    this.nftListenerService.setFix({
                        contract_address: collection,
                        tokenId,
                        price,
                        scResponse: events
                    })
                    break;



                /**
                 * **************** offer
                 */

                // when Accepted a offer
                case "OfferAccepted":
                    var { offerer, soldValue, lastTokenStatus } = return_values;
                    this.nftListenerService.acceptOffer({
                        tokenId,
                        contract_address: collection,
                        scResponse: events,
                        offerer,
                        price: soldValue
                    });
                    break;

                // when cancle a offer
                case "OfferCanceled":
                    var { lastOfferPrice, lastOfferer } = return_values;
                    this.nftListenerService.cancelOffer({
                        tokenId,
                        contract_address: collection,
                        offerer: lastOfferer,
                        scResponse: events
                    });
                    break;

                // when made a offer
                case "OfferMade":
                    var { wantedPrice, offerer } = return_values;
                    this.nftListenerService.addOffer({
                        tokenId,
                        contract_address: collection,
                        offerer: offerer,
                        price: wantedPrice,
                        scResponse: events
                    });
                    break;


                default:
                    break;
            }

            // log on All the events Except all that do not need to get {tokenId, collection}
            if (!this.ignoreEventTokenInfo.includes(events.event))
                Logger.log(`${events.event} on tokenId : ${returnValues?.tokenId} from contract: ${returnValues?.collection}`)

        });

    }


    /**
     * search in queue of events tokenInfo and check condition with and 
     * checking the condition that if there are more than 100, the first one will be deleted
     * That is, in the form of FIFO
     * @param blockNumber 
     * @returns 
     */
    async searchInQueue(blockNumber: number) {
        // find nft target from queue
        let nft = queueTokenInfo.find(nftTarget => nftTarget.blockNumber == blockNumber);

        if (!nft) {
            await this.parentService.Tools.sleep(1000); /// waiting 1 second.
            return this.searchInQueue(blockNumber);
        }
        let tempNft = nft;


        if (queueTokenInfo.length > 100)
            queueTokenInfo.shift()
        // queueNftTargets = queueNftTargets.filter(nftTarget => nft.blockNumber !== nftTarget.blockNumber);
        // if (queueNftTargets.length > 300)
        //     queueNftTargets.shift()


        return tempNft;
    }
}