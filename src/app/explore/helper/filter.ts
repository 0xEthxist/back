import { FilterQuery } from "mongoose";
import { methodsQuery, paginationParams } from "src/common/services/interface/query.interface";
import tools from "src/helper/tools";
import { Nft, NftStatus, NftActions, OfferStatus } from "src/schemas/nft.schema";
import { exploreFeatureFilter, exploreSort, exploreStatusFilter, getExploreDto, marketSaleType } from "../dto/get-explore.dto";

let statusFiltered = [];

export const filterExplore = (querys: getExploreDto) => {
    statusFiltered = [];
    let { category_web2_ids, feature, market, priceMax, priceMin, sort, status } = querys;
    let getNftOption: FilterQuery<Nft> = {};
    let getNftMethod: methodsQuery = {
        collection: true
    };

    // sort
    switch (sort) {
        case exploreSort.listed:
            getNftMethod.sort = { time_listed: -1 }
            break;
        case exploreSort.created:
            getNftMethod.sort = { time_create: -1 }
            break;
        case exploreSort.sold:
            getNftMethod.sort = { time_sold: -1 }
            break;
        case exploreSort.EndingSoon:
            getNftMethod.sort = { 'listed.time_end': 1 }
            break;
        case exploreSort.HighestPrice:
            getNftMethod.sort = { price: -1 }
            break;
        case exploreSort.LowestPrice:
            getNftMethod.sort = { price: 1 }
            break;

        default:
            getNftMethod.sort = { _id: -1 }
            break;
    }

    // handel cat web2 filter
    if (category_web2_ids)
        getNftOption.category_web2_id = catWeb2Filter(category_web2_ids);

    // handel max nad min price filter
    if (priceMax) getNftOption.price = { $gte: priceMax }
    if (priceMin) getNftOption.price = { $lte: priceMin }


    // handel sale market filter
    if (market)
        if (market == marketSaleType.secondary)
            getNftOption['nft_path.action'] = NftActions.buy;
        else if (market == marketSaleType.primary)
            getNftOption['nft_path.action'] = { $ne: NftActions.buy };

    // handel status
    let $or: any[];
    if (status && ($or = statusFilter(status)))
        if ($or.length > 1) getNftOption.$or = $or;


    // handel featur filter => lazy and collaboration
    if (feature) {
        var $orTow = [];
        const setFeatureOnOption = (featureCase) => {
            if (featureCase == exploreFeatureFilter.collaborations)
                $orTow.push({ 'collaborators.1': { $exists: true } });
            else if (featureCase == exploreFeatureFilter.lazyMint)
                $orTow.push({ status: NftStatus.lazy });
        }

        let featureArray = feature.split(',');
        if (featureArray.length > 0) {
            for (let index = 0; index < featureArray.length; index++) {
                setFeatureOnOption(featureArray[index]);
            }

        } else {
            setFeatureOnOption(feature);
        }

        if ($orTow.length > 0)
            if ($or?.length > 0) {
                getNftOption.$and = [{ $or: $or }, { $or: $orTow }]
                delete getNftOption.$or;
            } else
                getNftOption.$or = $orTow

    }
    
    return { getNftOption, getNftMethod };
}

/**
 * convert cat web2 ids to array and create query with $in
 * @param category_web2_ids 
 * @returns 
 */
export const catWeb2Filter = (category_web2_ids: string) => {
    let catweb2Array = category_web2_ids.split(',');
    if (catweb2Array.length > 0)
        return { $in: catweb2Array }
    else
        return category_web2_ids

}

/**
 * handel status filetr
 * @param status 
 * @returns 
 */
const statusFilter = (status) => {
    let statusArray = status.split(',');
    let nowTime = tools.get_now_time();
    let $or = [];

    for (let i = 0; i < statusArray.length; i++) {
        const currentSituation = statusArray[i];
        if (currentSituation == exploreStatusFilter.Reserve) {
            $or.push({ status: NftStatus.reserve })
            $or.push({ status: NftStatus.fixAndReserve })
        }
        else if (currentSituation == exploreStatusFilter.buyNow) {
            $or.push({ status: NftStatus.fix })
            $or.push({ status: NftStatus.fixAndReserve })
        } else if (currentSituation == exploreStatusFilter.liveAuction) {
            $or.push({
                $and: [
                    { status: NftStatus.auction },
                    { listed: { time_end: { $gte: nowTime } } },
                    { listed: { time_start: { $lte: nowTime } } }
                ]
            })
        } else if (currentSituation == exploreStatusFilter.UpcomingAuction) {
            $or.push({
                $and: [
                    { status: NftStatus.auction },
                    { listed: { time_start: { $gte: nowTime } } }
                ]
            })
        } else if (currentSituation == exploreStatusFilter.offer) {
            $or.push({ 'offers.status': OfferStatus.active });
        }
    }

    return $or;
}