import { Nft } from "src/schemas/nft.schema";

export interface lazyMintResponse {
    success: boolean,
    newNft: Nft
}

export interface lazyResponse extends lazyMintResponse {
    data: string;
}