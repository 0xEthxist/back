import { Nft } from "src/schemas/nft.schema";


export const getCollectionOwners = (nfts: Nft[]) => {
    let owners: collctionOwners[] = [];

    nfts.map(nft => {
        let user: collctionOwners;
        if (user = owners.find(owner => owner.address == nft.owner))
            user.count++;
        else
            owners.push({ address: nft.owner, count: 1 })

    })

    return owners;
}



export interface collctionOwners {
    address: String,
    count: number
}