import { MiddlewareConsumer, Module, NestModule, RequestMethod } from '@nestjs/common';
import { ProfileService } from './profile.service';
import { ProfileController } from './profile.controller';
import { User_kyc, User_kycSchema } from 'src/schemas/user_kyc.schema';
import { MongooseModule } from '@nestjs/mongoose';
import { Nft, NftSchema } from 'src/schemas/nft.schema';
import { Category, CategorySchema } from 'src/schemas/category.schema';
import { GetAddressMiddleware } from 'src/common/middleware/get-address.middleware';
import { ParentModule } from 'src/common/services/parent.module';
import { NotificationModule } from 'src/common/services/notification/notification.module';
import { GetAddressOptionalMiddleware } from 'src/common/middleware/get-address-optional.middleware';

/**
 * Profile handling module, including profile capture and editing, etc., 
 * as well as like, follow, unfollow, and any part related to the account and user.
 */
@Module({
  imports: [
    ParentModule,
    NotificationModule,
    MongooseModule.forFeature([
      { name: User_kyc.name, schema: User_kycSchema },
      { name: Nft.name, schema: NftSchema },
      { name: Category.name, schema: CategorySchema },
    ])
  ],
  exports: [ProfileService],
  controllers: [ProfileController],
  providers: [ProfileService],
})

/**
 * The first group applies the GetAddressOptionalMiddleware middleware function to handle GET requests for the /profile path with an optional address parameter.
 * The second group applies the GetAddressMiddleware middleware function to handle PUT, POST and GET requests for various nested paths starting with /profile.
 * This module provides middleware functions to handle requests related to user profile features, such as updating profile data, managing media uploaders, 
 * sending notifications, handling follow/favorite collections/search and retrieving offers/bids data.
 */
export class ProfileModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(GetAddressOptionalMiddleware)
      .forRoutes(
        { path: '/profile', method: RequestMethod.GET }
      );

    consumer
      .apply(GetAddressMiddleware)
      .forRoutes(
        { path: 'profile', method: RequestMethod.PUT },
        { path: 'profile/media_uploader', method: RequestMethod.POST },
        { path: 'profile/notifications', method: RequestMethod.GET },
        { path: 'profile/notif_allow', method: RequestMethod.PUT },
        { path: 'profile/follow', method: RequestMethod.POST },
        { path: 'profile/favorite-collection', method: RequestMethod.GET },
        { path: 'profile/search-complete-users', method: RequestMethod.GET },
        { path: 'profile/checkUsername', method: RequestMethod.GET },
        { path: 'profile/offers', method: RequestMethod.GET },
      );
  }
}
