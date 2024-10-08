import { MiddlewareConsumer, Module, NestModule, RequestMethod } from '@nestjs/common';
import { HomeService } from './home.service';
import { HomeController } from './home.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { NftSchema, Nft } from 'src/schemas/nft.schema';
import { ParentModule } from 'src/common/services/parent.module';
import { GetAddressMiddleware } from 'src/common/middleware/get-address.middleware';
import { DataServicesModule } from 'src/common/services/repository/data-services.module';

/**
 * This module is for handling the home page section to answer the requests of the home client section
 */
@Module({
  imports: [
    ParentModule,
    DataServicesModule
  ],
  controllers: [HomeController],
  providers: [HomeService]
})
export class HomeModule implements NestModule {
  /**
   * In this case, GetAddressMiddleware is a middleware function that is being applied to the /home/header-data route with GET http method.
   * @param consumer 
   */
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(GetAddressMiddleware)
      .forRoutes({ path: '/home/header-data', method: RequestMethod.GET });
  }
}
