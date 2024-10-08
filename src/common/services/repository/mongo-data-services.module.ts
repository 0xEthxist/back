import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Admin, AdminSchema } from 'src/schemas/admin.schema';
import { Category, CategorySchema } from 'src/schemas/category.schema';
import { Listed, ListedSchema } from 'src/schemas/listed.schema';
import { Nft, NftSchema } from 'src/schemas/nft.schema';
import { User_kyc, User_kycSchema } from 'src/schemas/user_kyc.schema';
import { IDataServices } from './abstract-data-services';
import { MongoDataServices } from './mongo-data-services';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Listed.name, schema: ListedSchema },
      { name: User_kyc.name, schema: User_kycSchema },
      { name: Admin.name, schema: AdminSchema },
      { name: Nft.name, schema: NftSchema },
      { name: Category.name, schema: CategorySchema },
    ])
  ],
  providers: [
    {
      provide: IDataServices,
      useClass: MongoDataServices,
    },
  ],
  exports: [IDataServices],
})
export class MongoDataServicesModule {}