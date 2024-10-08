import { Nft, NftStatus, OfferStatus } from "src/schemas/nft.schema";
import { getCollectionOwners } from "./get-owners";
import { getFloorAndHighestPrice, getTotalSales } from "./price-sales";

/**
 * get general collection data
 * @param { Nft[] } nfts 
 * @returns 
 */
export const getGeneralCollectionDadta = async (nfts: Nft[]) => {


    let [
        CollectionOwners,
        { max, min },
        totalSales
    ] =
        await Promise.all([
            getCollectionOwners(nfts),
            getFloorAndHighestPrice(nfts),
            getTotalSales(nfts)
        ]);

    let tabData = {
        buyNow: nfts.filter(nft => (nft.status == NftStatus.fix || nft.status == NftStatus.fixAndReserve)).length,
        liveAuction: nfts.filter(nft => nft.status == NftStatus.auction).length,
        reserve: nfts.filter(nft => (nft.status == NftStatus.reserve || nft.status == NftStatus.fixAndReserve)).length,
        offer: 0,
    }

    /**
     * get offer count
     */
    nfts.map(
        nft => {
            if (nft?.offers?.length > 0)
                nft.offers.map(offer => offer.status == OfferStatus.active ? tabData.offer++ : null)
        }
    )


    return {
        CollectionOwners,
        max,
        min,
        totalSales,
        tabData
    };
}