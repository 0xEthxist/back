import { FilterQuery } from "mongoose";
import { methodsQuery } from "src/common/services/interface/query.interface";
import { Category, CollectionType } from "src/schemas/category.schema";
import { ExploreCollectionDto, exploreCollectionSort, exploreCollectionType } from "../dto/explore-collection.dto";
import { catWeb2Filter } from "./filter";

export const filterExploreCollections = (querys: ExploreCollectionDto) => {

    let { category_web2_ids, collectionType, limit, maxFloorPrice, maxNumberOfArtworks, maxTotalSales, minFloorPrice, minNumberOfArtworks, minTotalSales,
        page, sort } = querys;
    let getCollectionOption: FilterQuery<Category> = {};
    let getCollectionMethod: methodsQuery<Category> = {};

    // sort
    switch (sort) {
        case exploreCollectionSort.floorPriceHighest:
            getCollectionMethod.sort = { floor_price: -1 }
            break;
        case exploreCollectionSort.floorPriceLowest:
            getCollectionMethod.sort = { floor_price: 1 }
            break;
        case exploreCollectionSort.newest:
            getCollectionMethod.sort = { time_created: -1 }
            break;
        case exploreCollectionSort.oldest:
            getCollectionMethod.sort = { time_created: 1 }
            break;
        case exploreCollectionSort.owners:
            getCollectionMethod.sort = { ownerLength: 1 }
            break;

        default:
            getCollectionMethod.sort = { _id: -1 }
            break;
    }

    // handel cat web2 filter
    if (category_web2_ids)
        getCollectionOption.category_web2_id = catWeb2Filter(category_web2_ids);


    // handel collection type filter
    let type: string;
    if (collectionType && (type = collectinTypeFilter(collectionType)))
        getCollectionOption.type = type;


    // handel FloorPrice filter
    if (maxFloorPrice) getCollectionOption.floor_price = { $gte: maxFloorPrice }
    if (minFloorPrice) getCollectionOption.floor_price = { $lte: minFloorPrice }

    // handel TotalSales filter
    if (maxTotalSales) getCollectionOption.total_sales = { $gte: maxTotalSales }
    if (minTotalSales) getCollectionOption.total_sales = { $lte: minTotalSales }

    // handel NumberOfArtworks filter
    if (maxNumberOfArtworks) getCollectionOption.itemCounter = { $gte: maxNumberOfArtworks }
    if (minNumberOfArtworks) getCollectionOption.itemCounter = { $lte: minNumberOfArtworks }


    return { getCollectionOption, getCollectionMethod };
}


const collectinTypeFilter = (collectionType) => {
    if (collectionType == exploreCollectionType.standard)
        return CollectionType.normal
    else if (collectionType == exploreCollectionType.lazyMint)
        return CollectionType.lazy;
}