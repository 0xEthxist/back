import { Module } from '@nestjs/common';
import { MintService } from './mint.service';
import { MintController } from './mint.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Category_web2, Category_web2Schema } from 'src/schemas/category_web2.schema';
import { Nft, NftSchema } from 'src/schemas/nft.schema';
import { User_kyc, User_kycSchema } from 'src/schemas/user_kyc.schema';
import { ParentModule } from 'src/common/services/parent.module';
import { NotificationModule } from 'src/common/services/notification/notification.module';
import { NftModule } from '../nft/nft.module';
import { OptionModule } from 'src/common/services/option/option.module';
import { CollectionModule } from '../collection/collection.module';

/**
 * This module is for handling the mint part, which includes mint and lizi mint, etc
 */
@Module({
  imports: [
    ParentModule,
    OptionModule,
    NotificationModule,
    NftModule,
    CollectionModule,
    MongooseModule.forFeature([
      { name: User_kyc.name, schema: User_kycSchema },
    ])
  ],
  exports: [MintService],
  controllers: [MintController],
  providers: [MintService]
})

export class MintModule { }
