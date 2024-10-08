import { Module } from '@nestjs/common';
import { ItemsService } from './items.service';
import { ItemsController } from './items.controller';
import { DataServicesModule } from 'src/common/services/repository/data-services.module';
import { ParentModule } from 'src/common/services/parent.module';
import { AdminParentModule } from '../parent/admin-parent.module';

@Module({
  imports:[
    DataServicesModule,
    ParentModule,
    AdminParentModule
  ],
  controllers: [ItemsController],
  providers: [ItemsService]
})
export class ItemsModule {}
