import { MiddlewareConsumer, Module, NestModule, RequestMethod } from '@nestjs/common';
import { LogService } from './log.service';
import { LogController } from './log.controller';
import { GetAddressMiddleware } from 'src/common/middleware/get-address.middleware';
import { ParentModule } from 'src/common/services/parent.module';

@Module({
  imports:[
    ParentModule
    
  ],
  controllers: [LogController],
  providers: [LogService]
})
export class LogModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(GetAddressMiddleware)
      .forRoutes('log'
        // { path: 'log/error', method: RequestMethod.POST }
      );
  }
}
