import { Nft, NftStatus } from "src/schemas/nft.schema";

export interface suggestedNfts {
    count: number,
    nft: Nft,
    nfts?: Nft[],
    _process?: processSuggestedNfts
}

export class processSuggestedNfts { 
    static auction = 'auction';
    static fix = 'fix';
    static collection = 'collection';
    static artaniom = 'artaniom'
}