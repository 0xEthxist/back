import { Category, CategoryDocument } from "src/schemas/category.schema";
import { Category_web2 } from "src/schemas/category_web2.schema";
import { Nft } from "src/schemas/nft.schema";
import { User_kyc } from "src/schemas/user_kyc.schema";

export interface collectionWithOption extends CategoryDocument {
    // ...Category;
    category_web2?: any;//Category_web2;
    ownerData?: any;//User_kyc;
    nfts?: any;//Nft;
}
