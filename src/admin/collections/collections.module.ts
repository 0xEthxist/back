import { Module } from '@nestjs/common';
import { CollectionsService } from './collections.service';
import { CollectionsController } from './collections.controller';
import { DataServicesModule } from 'src/common/services/repository/data-services.module';
import { ParentModule } from 'src/common/services/parent.module';
import { AdminParentModule } from '../parent/admin-parent.module';

@Module({
  imports:[
    DataServicesModule,
    ParentModule,
    AdminParentModule
  ],
  controllers: [CollectionsController],
  providers: [CollectionsService]
})
export class CollectionsModule {}
