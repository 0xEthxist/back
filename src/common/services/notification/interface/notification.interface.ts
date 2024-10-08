import { Nft } from "src/schemas/nft.schema";
import { NotifEvent } from "src/schemas/user_kyc.schema";

export interface NotifAuctionUsers {
    message ?: string,
    auctionData ?: Nft,
    event?: NotifEvent
}