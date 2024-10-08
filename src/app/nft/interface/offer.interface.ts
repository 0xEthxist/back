
export interface AddOfferData {
    tokenId: String,
    contract_address: string,
    scResponse: any,
    
    offerer: string,
    price: any,
}

export interface AcceptOfferData {
    tokenId: String,
    contract_address: string,
    scResponse: any,

    offerer: any,
    price: any
}

export interface CancelOfferData {
    tokenId: String,
    contract_address: string,
    offerer: string,
    scResponse: any
}