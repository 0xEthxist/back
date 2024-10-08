import { NftDocument } from "src/schemas/nft.schema";
import { GetNftDto } from "../dto/get-nft-dto";

export interface ViewsNft{
    nftDbViews: NftDocument["views"],
    address: string,
    ip: string,
}

export interface GetNftApi{
    getNftDto: GetNftDto, 
    address?: string, 
    req?: any,
    again?: boolean
}