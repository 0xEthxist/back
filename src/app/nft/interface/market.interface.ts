import { AuctionSetOption } from "./auction-set.interface";
import { AuctionBidOption, AuctionUpdatedOption } from "./auction.interface";
import { SetReserveAuctionOption } from "./reserve.interface";
import { SetOrderFixOption } from "./set-order-fix.interface";

export type CheckListedListenType = SetOrderFixOption | AuctionSetOption | AuctionBidOption | AuctionUpdatedOption | SetReserveAuctionOption