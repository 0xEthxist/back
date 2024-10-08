import { Nft, NftActions } from "src/schemas/nft.schema";
import { collctionOwners } from "./get-owners";



export const getFloorAndHighestPrice = (nfts: Nft[]) => {
    let min = 0;
    let max = 0;

    for (let i = 0; i < nfts.length; i++) {
        let nft = nfts[i];
        if (i == 0)
            min = +nft.price;
        else
            min = Math.min(+min, +nft.price);

        max = Math.max(+max, +nft.price)

    }

    return { max, min };
}


export const getTotalSales = (nfts: Nft[]) => {
    let total = 0;

    nfts.map(nft => {
        nft.nft_path.map(np => {
            if (np.action == NftActions.buy)
                total += +np.price;
        })
    })

    return total;
}