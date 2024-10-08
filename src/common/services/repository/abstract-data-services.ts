import { Admin, AdminDocument } from "src/schemas/admin.schema";
import { Category, CategoryDocument } from "src/schemas/category.schema";
import { Listed, ListedDocument } from "src/schemas/listed.schema";
import { Nft, NftDocument } from "src/schemas/nft.schema";
import { User_kyc, User_kycDocument } from "src/schemas/user_kyc.schema";
import { IGenericRepository } from "./abstract-repository";

export abstract class IDataServices {
  abstract listed: IGenericRepository<Listed, ListedDocument>;
  abstract user_kyc: IGenericRepository<User_kyc, User_kycDocument>;
  abstract admin: IGenericRepository<Admin, AdminDocument>;
  abstract nft: IGenericRepository<Nft, NftDocument>;
  abstract category: IGenericRepository<Category, CategoryDocument>;
}