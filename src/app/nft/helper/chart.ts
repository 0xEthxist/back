import { Nft, NftActions } from "src/schemas/nft.schema";


/**
 * data for item sales chart
 * @param nft_path 
 * @return {chartInterface}
 */
export const itemSalesChart = (nft_path: Nft["nft_path"]): chartInterface[] => {
    let chartData: chartInterface[] = [];
    nft_path.map(p => {
        if (p.action == NftActions.buy)
            chartData.push({
                by: p.by,
                price: p.price,
                time: p.time
            })
    })

    return chartData;
}

export interface chartInterface {
    price: Number,
    time: string,
    by: String
}