// import { Injectable, Logger } from "@nestjs/common";
// import { NftListenerService } from "src/app/nft/listener/nft-listener.service";
// import { ParentService } from "src/common/services/parent.service";
// import instance from "./instance";
// const contractName = 'auction';
// let queueNftTargets = [];

// @Injectable()
// export class AuctionServiceWs {

//     private socketInstance: any;
//     private eventList = ['AuctionSet', 'AuctionGetsBid', 'AuctionUpdated', 'AuctionReturnedToVendor', 'AuctionWasSuccessful', 'AuctionTimeExtended'];

//     constructor(private parentService: ParentService, 
//         private nftListenerService: NftListenerService) { }

//     onModuleInit() {
//         this.createListener()
//     }

//     createListener() {
//         this.socketInstance = instance(contractName, process.env.auction);
//         Logger.log('create auction listener')
//         this.listener();
//     }

//     listener() {
//         this.socketInstance.events.allEvents(async (err, events) => {
//             if (err) {
//                 Logger.error('error in auction listener', err);
//                 this.createListener()
//                 return;
//             }

//             Logger.log(`in ${events.event} listen`);

//             let return_values = events.returnValues;
//             if (this.eventList.includes(events.event))
//                 var { returnValues } = await this.searchInQueue(events.blockNumber);

//             switch (events.event) {
//                 case 'TargetNFT':
//                     queueNftTargets.push(events);
//                     break;

//                 // when create a auction
//                 case "AuctionSet":
//                     var { tokenContract, tokenId, tokenVendor } = returnValues
//                     var { baseValue, startTime, endTime } = return_values;
//                     this.nftListenerService.AuctionSet({
//                         baseValue,
//                         contract_address: tokenContract,
//                         endTime,
//                         startTime,
//                         tokenId,
//                         scResponse: events
//                     })
//                     Logger.log(`AuctionSet for tokenId : ${tokenId} `);
//                     break;

//                 // when place a bid on auction
//                 case "AuctionGetsBid":
//                     var { tokenContract, tokenId, tokenVendor } = returnValues
//                     var { bidder, bidValue, bidTime } = return_values;
//                     this.nftListenerService.auctionBid({
//                         bidTime,
//                         contract_address: tokenContract,
//                         bidValue,
//                         bidder,
//                         tokenId,
//                         scResponse: events
//                     })
//                     Logger.log(`auctionBid on tokenId : ${tokenId} from contract: ${tokenContract}`);
//                     break;

//                 // when updated price auction 
//                 case "AuctionUpdated":
//                     var { tokenContract, tokenId, tokenVendor } = returnValues
//                     var { newBaseValue, baseValue, updatedTime } = return_values;
//                     this.nftListenerService.auctionUpdated({
//                         contract_address: tokenContract,
//                         tokenId,
//                         scResponse: events,

//                         newBaseValue,
//                         updatedTime,
//                     })
//                     Logger.log(`AuctionUpdated on tokenId : ${tokenId} from contract: ${tokenContract}`);
//                     break;

//                 // when cancel or Withdraw while there is no bid
//                 case "AuctionReturnedToVendor":
//                     var { tokenContract, tokenId, tokenVendor } = returnValues
//                     var { executedTime, baseValue, endTime } = return_values;
//                     this.nftListenerService.auctionWithdraw({
//                         contract_address: tokenContract,
//                         tokenId,
//                         scResponse: events,

//                         executedTime,
//                         endTime,
//                     })
//                     Logger.log(`AuctionReturnedToVendor on tokenId : ${tokenId} from contract: ${tokenContract}`);
//                     break;

//                 // when Withdraw owner or last bider
//                 case "AuctionWasSuccessful":
//                     var { tokenContract, tokenId, tokenVendor } = returnValues
//                     var { auctionWinner, soldValue, elapsedTimeAfterAuctionEndTime } = return_values;
//                     this.nftListenerService.auctionWithdraw({
//                         contract_address: tokenContract,
//                         tokenId,
//                         scResponse: events,

//                         auctionWinner,
//                         soldValue,
//                     })
//                     Logger.log(`AuctionWasSuccessful on tokenId : ${tokenId} from contract: ${tokenContract}`)
//                     break;

//                 // when Withdraw owner or last bider
//                 case "AuctionTimeExtended":
//                     var { tokenContract, tokenId } = returnValues
//                     var { newEndTime } = return_values;
//                     this.nftListenerService.auctionUpdated({
//                         contract_address: tokenContract,
//                         tokenId,
//                         scResponse: events,

//                         newEndTime,

//                     })
//                     Logger.log(`AuctionTimeExtended on tokenId : ${tokenId} from contract: ${tokenContract}`)
//                     break;

//                 default:
//                     break;
//             }

//         });

//     }


//     async searchInQueue(blockNumber: number) {
//         // find nft target from queue
//         let nft = queueNftTargets.find(nftTarget => nftTarget.blockNumber == blockNumber);

//         if (!nft) {
//             await this.parentService.Tools.sleep(1000); /// waiting 1 second.
//             return this.searchInQueue(blockNumber);
//         }
//         let tempNft = nft;


//         if (queueNftTargets.length > 100)
//             queueNftTargets.shift()
//         // queueNftTargets = queueNftTargets.filter(nftTarget => nft.blockNumber !== nftTarget.blockNumber);
//         // if (queueNftTargets.length > 300)
//         //     queueNftTargets.shift()


//         return tempNft;
//     }
// }