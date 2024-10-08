import { FilterQuery } from "mongoose";
import { Category } from "src/schemas/category.schema";

export interface GetCollectionOption extends FilterQuery<Category> {
    _id?: any,
    name?: any,
    category_web2_id?:any,
    owner?:any,
    contract_address?: any,
    favorite_list?: any,
    inHome?: boolean
}


export interface GetCollectionOptionProcess {
    category_web2?,
    owner_data?,
    abi?,
    nfts?,
}
