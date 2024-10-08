import { FilterQuery } from "mongoose";
import { Nft, NftDocument, NftStatus } from "src/schemas/nft.schema";

export interface ExistNft extends FilterQuery<NftDocument> {
    nft_id?: any,
    address?: String | any,
    tokenId?: String,
    category?: String,
    contract_address ?: string,
    owner?: string | any,
    // _id?: string,
    status?: NftStatus
}