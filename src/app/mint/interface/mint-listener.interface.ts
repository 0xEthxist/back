
export interface MintUpdateData {
    nftId: string,
    tokenId: number,
    contract_address: string,
    scResponse: any
}


export interface LazyMintUpdateData extends MintUpdateData {
    buyer: string,
    cid: string
}