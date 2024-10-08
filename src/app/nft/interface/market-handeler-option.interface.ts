import { NftStatus } from "src/schemas/nft.schema";


export interface MarketHandelerOption {
    // offer: boolean;
    status?: NftStatus;
    data?: {
        fixPrice?: object;

        duration?: any;
        baseValue?: any;
        tokenStatus?: any;

        startTime?: object;

        bidder?: string;
        bidValue?: any

    }
    offerData?: {
        offerer: string,
        wantedPrice: string
    },

    contract_address?: string,
    tokenId?: string
}