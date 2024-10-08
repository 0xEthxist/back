// import { Injectable, Logger } from "@nestjs/common";
// import { NftListenerService } from "src/app/nft/listener/nft-listener.service";
// import { ParentService } from "src/common/services/parent.service";
// import instance from "./instance";
// const contractName = 'fix';

// @Injectable()
// export class FixServiceWs {

//     private socketInstance: any;

//     constructor(
//         private nftListenerService: NftListenerService
//     ) { }

//     onModuleInit() {
//         this.createListener()
//     }

//     createListener() {
//         this.socketInstance = instance(contractName, process.env.fix);
//         Logger.log('create fix listener')
//         this.listener();
//     }

//     listener() {
//         this.socketInstance.events.allEvents((err, events) => {
//             if (err) {
//                 Logger.error('error in fix listener', err);
//                 this.createListener()
//                 return;
//             }

//             Logger.log(`in ${events.event} listener`);
//             let { returnValues } = events

//             switch (events.event) {
//                 case 'OrderSet':
//                     Logger.log('OrderSet return value', returnValues._user);
//                     this.nftListenerService.setOrderFix({
//                         address: returnValues[0],
//                         contract_address: returnValues[1],
//                         tokenId: returnValues[2],
//                         price: returnValues[3],
//                         scResponse: events
//                     })
//                     break;

//                 case 'OrderAccepted':
//                     this.nftListenerService.fixAccepted({
//                         address: returnValues[0],
//                         contract_address: returnValues[3],
//                         tokenId: returnValues[4],
//                         amount: returnValues[2],
//                         scResponse: events
//                     })
//                     break;

//                 case 'OrderCancelled':
//                     this.nftListenerService.OrderCancelled({
//                         address: returnValues[0],
//                         contract_address: returnValues[2],
//                         tokenId: returnValues[3],
//                         scResponse: events
//                     })
//                     break;

//                 // offer

//                 case 'addNewOffer':
//                     this.nftListenerService.addOffer({
//                         tokenId: returnValues.tokenId,
//                         contract_address: returnValues.contract_address,
//                         offerer: returnValues.offerer,
//                         price: returnValues.price,
//                         scResponse: events
//                     });
//                     break;
//                 case 'AcceptOffer':
//                     this.nftListenerService.acceptOffer({
//                         tokenId: returnValues.tokenId,
//                         contract_address: returnValues.contract_address,
//                         offerer: returnValues.offerer,
//                         price: returnValues.price,
//                         scResponse: events
//                     });
//                     break;
//                 case 'cancelOffer':
//                     this.nftListenerService.cancelOffer({
//                         tokenId: returnValues.tokenId,
//                         contract_address: returnValues.contract_address,
//                         offerer: returnValues.offerer,
//                         scResponse: events
//                     });
//                     break;

//                 default:
//                     break;
//             }

//         });

//     }
// }