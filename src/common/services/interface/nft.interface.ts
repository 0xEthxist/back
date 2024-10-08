// export interface getNftOption  : getNftOptionWithCollection | String;

import { FilterQuery } from "mongoose"
import { Nft, NftCollaborator, NftStatus } from "src/schemas/nft.schema"

export interface getNftOptionWithCollection extends FilterQuery<Nft> {
    category?,
    show?: any,
    name?,
    category_web2_id?,
    creator?,
    owner?,
    status?: NftStatus | object,
    $or?: any,
    collaborators?: collaboratorsQuery
}

interface collaboratorsQuery {
    address?: string | {},
    share?: number,
    avatar?: string,
    username?: string

}


export interface getNftOption {
    show: Boolean,
    category?,
    filter?: {}
}

export interface NftAuctionsFilter {
    time_start?: string | number | boolean,
    time_end?: string | number| boolean,
    queryOption?: {
        nft_id?: string
    }
}
