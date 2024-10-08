import { MiddlewareConsumer, Module, NestModule, RequestMethod } from '@nestjs/common';
import { CollectionService } from './collection.service';
import { CollectionController } from './collection.controller';
import { ParentModule } from 'src/common/services/parent.module';
import { GetAddressMiddleware } from 'src/common/middleware/get-address.middleware';
import { GetAddressOptionalMiddleware } from 'src/common/middleware/get-address-optional.middleware';
import { NotificationModule } from 'src/common/services/notification/notification.module';
import { DataServicesModule } from 'src/common/services/repository/data-services.module';
import { OptionModule } from 'src/common/services/option/option.module';

/**
 * This module does all the work related to collections, both APIs and logic related to listeners.
 */
@Module({
  imports: [
    ParentModule,
    NotificationModule,
    DataServicesModule,
    OptionModule
  ],
  exports:[CollectionService],
  controllers: [CollectionController],
  providers: [CollectionService]
})
export class CollectionModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(GetAddressOptionalMiddleware)
      .forRoutes(
        { path: 'collection', method: RequestMethod.GET },
        { path: 'collection/explore', method: RequestMethod.GET }
        );
    consumer
      .apply(GetAddressMiddleware)
      .forRoutes(
        { path: 'collection', method: RequestMethod.POST },
        { path: 'collection/check_name', method: RequestMethod.POST },
        { path: 'collection/mint', method: RequestMethod.GET },
        { path: 'collection/edit', method: RequestMethod.PUT },
        { path: 'collection/favorite', method: RequestMethod.POST },
        { path: 'collection/create-Lazy', method: RequestMethod.GET },
      );
  }
}
