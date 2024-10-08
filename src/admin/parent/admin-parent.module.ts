import { Module } from '@nestjs/common';
import { DataServicesModule } from 'src/common/services/repository/data-services.module';
import { ParentModule } from 'src/common/services/parent.module';
import { AdminParentService } from './admin-parent.service';

@Module({
  imports:[
    DataServicesModule,
    ParentModule
  ],
  providers: [AdminParentService],
  exports:[AdminParentService]
})
export class AdminParentModule {}
