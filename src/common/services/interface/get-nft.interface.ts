import { Listed } from "src/schemas/listed.schema";
import { Nft, NftOffers } from "src/schemas/nft.schema";
import { User_kyc } from "src/schemas/user_kyc.schema";


export interface getNftsInterface extends Nft {
    isOwner?: boolean,
    likeCount?: number,
    viewsCount?: number,
    typeFile?: any,
    ownerData?: User_kyc,
    creatorData?: User_kyc,
    categoryWeb2Data?: any,
    listedData?: Listed,
    reserveData?: Listed,
    currentOwner?: string,

    cancelable?: boolean,
    withdraw?: boolean,
    activeAuction?: boolean,
    activeOffer?: NftOffers,
    havingBid?: boolean,
}