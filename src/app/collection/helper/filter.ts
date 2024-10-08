import { FilterQuery } from "mongoose";
import { methodsQuery } from "src/common/services/interface/query.interface";
import tools from "src/helper/tools";
import { Nft, NftStatus, OfferStatus } from "src/schemas/nft.schema";
import { collectionFilter, collectionSort } from "../dto/get-collection.dto";


/**
 * filter in show nfts 
 * buyNow => for nfts that fix status
 * liveAuction => for nfts that auction status
 * offer => for nfts that find a active offer and not live acution
 * @param {collectionFilter} filter 
 * @Param category
 */
export function filterNftOption(filter: collectionFilter, category, sort) {
    let getNftOption: FilterQuery<Nft> = {
        category
    };
    let nowTime = tools.get_now_time();

    let getNftMethod: methodsQuery<Nft>  = {};


    switch (sort) {
        case collectionSort.listed:
            getNftMethod.sort = { time_listed: 1 }
            break;

        case collectionSort.created:
            getNftMethod.sort = { time_create: 1 }
            break;

        case collectionSort.sold:
            getNftOption.status = NftStatus.sold;
            getNftMethod.sort = { time_sold: 1 }
            break;

        case collectionSort.lowToHigh:
            getNftMethod.sort = { price: 1 }
            break;

        case collectionSort.highToLow:
            getNftMethod.sort = { price: -1 }
            break;

        default:
            break;
    }

    let currentSituation = filter;
    if (currentSituation == collectionFilter.reserve) {             // reserve
        getNftOption.$or = [{ status: NftStatus.reserve }, { status: NftStatus.fixAndReserve }]
    }
    else if (currentSituation == collectionFilter.buyNow) {         // buynow(fix)
        getNftOption.$or = [{ status: NftStatus.fix }, { status: NftStatus.fixAndReserve }]
    } else if (currentSituation == collectionFilter.liveAuction) {  // live acution
        getNftOption.$and = [
            { status: NftStatus.auction },
            { listed: { time_end: { $gte: nowTime } } },
            { listed: { time_start: { $lte: nowTime } } }
        ];
    } else if (currentSituation == collectionFilter.offer) {        // is active offer
        getNftOption.$or = [{ 'offers.status': OfferStatus.active }];
    }

    return { getNftOption, getNftMethod };
}