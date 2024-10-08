import { CacheModule, MiddlewareConsumer, Module, NestModule, RequestMethod } from '@nestjs/common';
import { NftService } from './nft.service';
import { NftController } from './nft.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { User_kyc, User_kycSchema } from 'src/schemas/user_kyc.schema';
import { Nft, NftSchema } from 'src/schemas/nft.schema';
import { Category, CategorySchema } from 'src/schemas/category.schema';
import { ParentModule } from 'src/common/services/parent.module';
import { GetAddressMiddleware } from 'src/common/middleware/get-address.middleware';
import { GetAddressOptionalMiddleware } from 'src/common/middleware/get-address-optional.middleware';
import { WebsocketModule } from 'src/websocket/websocket.module';
import { NotificationModule } from 'src/common/services/notification/notification.module';
import { OptionModule } from 'src/common/services/option/option.module';
import { NftListenerService } from './listener/nft-listener.service';
import { MarketService } from './listener/market.service';
import { CollectionModule } from '../collection/collection.module';

/**
 * To handle all NFT related tasks
 */
@Module({
  imports: [
    ParentModule,
    NotificationModule,
    OptionModule,
    CollectionModule
  ],
  exports: [
    NftService,
    NftListenerService,
    MarketService
  ],
  controllers: [NftController],
  providers: [
    /** Service to respond to client requests */
    NftService,

    /** Service for implementing logic listeners related to NFT module */
    NftListenerService,

    /** Service for logic related to contract market */
    MarketService
  ]
})
export class NftModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {

    // The following code applies the middleware function `GetAddressOptionalMiddleware` to the GET request 
    // with route path 'nft' on the consumer.
    consumer
      .apply(GetAddressOptionalMiddleware)
      .forRoutes({ path: 'nft', method: RequestMethod.GET });


    // Apply `GetAddressMiddleware` to protect several routes
    consumer
      .apply(GetAddressMiddleware)

      // Set the routes for which the middleware should be applied
      .forRoutes(
        { path: 'nft/cancel', method: RequestMethod.PATCH },
        { path: 'nft/like', method: RequestMethod.PATCH },
        { path: 'nft/like', method: RequestMethod.POST },
        { path: 'nft/buy-lazy-mint', method: RequestMethod.POST },
        { path: 'nft/edit', method: RequestMethod.PUT },
        { path: 'nft/delete', method: RequestMethod.DELETE },
      );
  }
}
