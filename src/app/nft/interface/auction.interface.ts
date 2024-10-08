
export interface AuctionBidOption {
    tokenId: String,
    contract_address: string,
    scResponse: any,

    bidder: string,
    bidValue: any,
    bidTime: any
}

export interface AuctionUpdatedOption {
    tokenId: String,
    contract_address: string,
    scResponse: any,

    newBaseValue?: any

    newEndTime?: any
}

export interface AuctionWithdrawOption {
    tokenId: String,
    contract_address: string,
    scResponse: any,

    auctionWinner?: any,
    soldValue?: any,

    auctionStatus?: any
}

export interface AuctionPreviousBidOption {
    tokenId: string,
    contract_address: string,
    scResponse: any,

    previousBidder: string,
    refundedValue: any
}