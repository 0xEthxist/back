import { forwardRef, Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { Admin, AdminSchema } from "src/schemas/admin.schema";
import { Category, CategorySchema } from "src/schemas/category.schema";
import { Category_web2, Category_web2Schema } from "src/schemas/category_web2.schema";
import { Listed, ListedSchema } from "src/schemas/listed.schema";
import { Log, LogSchema } from "src/schemas/log.schema";
import { Marketing, MarketingSchema } from "src/schemas/marketing.schema";
import { Nft, NftSchema } from "src/schemas/nft.schema";
import { Trash, TrashSchema } from "src/schemas/trash.schema";
import { User_kyc, User_kycSchema } from "src/schemas/user_kyc.schema";
import { NotificationModule } from "./notification/notification.module";
import { ParentService } from "./parent.service";
import { DataServicesModule } from "./repository/data-services.module";

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User_kyc.name, schema: User_kycSchema },
      { name: Nft.name, schema: NftSchema },
      { name: Category.name, schema: CategorySchema },
      { name: Listed.name, schema: ListedSchema },
      { name: Category_web2.name, schema: Category_web2Schema },
      { name: Marketing.name, schema: MarketingSchema },
      { name: Log.name, schema: LogSchema },
      { name: Trash.name, schema: TrashSchema },
      { name: Admin.name, schema: AdminSchema },
    ]),
    DataServicesModule
  ],
  providers: [ParentService],
  exports: [ParentService],
})
export class ParentModule { }