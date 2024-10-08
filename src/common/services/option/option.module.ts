import { forwardRef, Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { Category, CategorySchema } from "src/schemas/category.schema";
import { Category_web2, Category_web2Schema } from "src/schemas/category_web2.schema";
import { Listed, ListedSchema } from "src/schemas/listed.schema";
import { Marketing, MarketingSchema } from "src/schemas/marketing.schema";
import { Nft, NftSchema } from "src/schemas/nft.schema";
import { Option, OptionSchema } from "src/schemas/option.schema";
import { User_kyc, User_kycSchema } from "src/schemas/user_kyc.schema";
import { OptionService } from "./option.service";

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User_kyc.name, schema: User_kycSchema },
      { name: Nft.name, schema: NftSchema },
      { name: Category.name, schema: CategorySchema },
      { name: Listed.name, schema: ListedSchema },
      { name: Category_web2.name, schema: Category_web2Schema },
      { name: Marketing.name, schema: MarketingSchema },
      { name: Option.name, schema: OptionSchema },
    ])
  ],
  providers: [OptionService],
  exports: [OptionService],
})
export class OptionModule {}
