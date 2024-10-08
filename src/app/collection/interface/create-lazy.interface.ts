
export const lazyCollectionType = {
    LazyCollectionVoucher: [
        {name: "owner", type: "address"},
        {name: "maximumSupply", type: "uint256"},
        {name: "name", type: "string"},
        {name: "symbol", type: "string"},
        {name: "catWeb2", type: "string"}
    ]
}

export interface lazyCreateCollection {
    owner :string,
    maximumSupply :string, 
    name :string, 
    symbol :string,
    catWeb2 :string
}
