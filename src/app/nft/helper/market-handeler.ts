// import tools from "src/helper/tools";
// import { NftStatus } from "src/schemas/nft.schema";
// import { MarketHandelerOption } from "../interface/market-handeler-option.interface";

// export const marketHandeler = async (option: MarketHandelerOption) => {
//     let { data, offer, status, contract_address, offerData, tokenId } = option,
//         nowTime = tools.get_now_time();

//     switch (status) {
//         case NftStatus.fix:
//         case NftStatus.fixAndReserve:
//             // handel fix
//             await this.nftListenerService.setFix({
//                 contract_address,
//                 scResponse: { type: 'geter', response: option },

//                 tokenId,
//                 price: data.fixPrice
//             })
//             break;

//         case NftStatus.reserve:
//         case NftStatus.fixAndReserve:
//             // handel reserve
//             await this.nftListenerService.setReserveAuction({
//                 contract_address,
//                 tokenId,
//                 scResponse: { type: 'geter', response: option },

//                 duration: data.duration,
//                 baseValue: data.baseValue,
//                 tokenStatus: data.tokenStatus
//             })
//             break;

//         case NftStatus.auction:
//             // handel auction
//             await this.nftListenerService.AuctionSet({
//                 contract_address,
//                 tokenId,
//                 duration: data.duration,
//                 baseValue: data.baseValue,
//                 startTime: data.startTime,
//                 scResponse: { type: 'geter', response: option }
//             });

//             // handel bid
//             if (data.bidder)
//                 await this.nftListenerService.auctionBid({
//                     contract_address,
//                     tokenId,
//                     scResponse: { type: 'geter', response: option },

//                     bidder: data.bidder,
//                     bidTime: nowTime,
//                     bidValue: data.bidValue
//                 })
//             break;

//         default:
//             break;
//     }
// }

// // if (Auction) {
// //     let suggestionsLength = Auction.suggestions.length;
//     // let order = await getOrderAuction({ contract_address: collection.contract_address, tokenId: nftDB.tokenId });
//     // if (
//     //     order &&
//     //     order._tokenBidder != this.zeroAddress
//     // ) {
//     //     if (suggestionsLength) {
//     //         if (Auction.suggestions[suggestionsLength - 1].address.toLowerCase() != order._tokenBidder.toLowerCase()) {
//     //             //add a new bid
//     //             Auction.suggestions.push({
//     //                 address: order._tokenBidder,
//     //                 bid: order._highestBidValue,
//     //                 time: nowTime
//     //             })
//     //             await Auction.save()
//     //         }
//     //     }
//     //     else {
//     //         // add a new bid
//     //         Auction.suggestions.push({
//     //             address: order._tokenBidder,
//     //             bid: order._highestBidValue,
//     //             time: nowTime
//     //         })
//     //         await Auction.save();

//     //     }
//     // }