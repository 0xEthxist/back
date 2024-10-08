import { FilterQuery } from "mongoose";
import { methodsQuery } from "src/common/services/interface/query.interface";
import { Nft, NftStatus } from "src/schemas/nft.schema";
import { collectionSort } from "../dto/get-collection.dto";


/**
 * 
 * @param {collectionSort} sort 
 */
export function sortNftOption(sort: collectionSort, category) {
    let getNftOption: FilterQuery<Nft> = {
        category
    };

    let getNftMethod: methodsQuery = {};

    switch (sort) {
        case collectionSort.listed:
            getNftMethod.sort = { "time_listed": 'desc' }
            break;

        case collectionSort.created:
            getNftMethod.sort = { "time_create": 'desc' }
            break;

        case collectionSort.sold:
            getNftOption.status = NftStatus.sold;
            getNftMethod.sort = { "time_sold": 'desc' }
            break;

        case collectionSort.lowToHigh:
            getNftMethod.sort = { "price": "asc" }
            break;

        case collectionSort.highToLow:
            getNftMethod.sort = { "price": "desc" }
            break;

        case collectionSort.viewed:
            getNftOption.view_count = {$size: "$views"}
            getNftMethod.sort = { "view_count": "desc" }
            break;

        case collectionSort.favorited:
            getNftMethod.sort = { "like.lenght": "desc" }
            break;

        default:
            break;
    }

    return { getNftOption, getNftMethod };
}