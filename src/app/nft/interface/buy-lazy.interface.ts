
export const lazyType = {
    LazyNFTVoucher: [
        { name: "price", type: "uint256" },
        { name: "buyer", type: "address" },
        { name: "royaltyFraction", type: "uint96" },
        { name: "collectionAddress", type: "address" },
        { name: "CID", type: "string" },
        { name: "NFTdb", type: "string" },
        { name: "collaborator_s", type: "bytes" }
    ]
}

export interface lazyMintVoucher {
    price: string,
    buyer: string,
    royaltyFraction: string,
    collectionAddress: string,
    CID: string,
    NFTdb: string,
    collaborator_s: string
}