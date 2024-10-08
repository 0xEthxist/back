import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { DataServicesModule } from 'src/common/services/repository/data-services.module';
import { ParentModule } from 'src/common/services/parent.module';
import { AdminParentModule } from '../parent/admin-parent.module';

@Module({
  imports:[
    DataServicesModule,
    ParentModule,
    AdminParentModule
  ],
  controllers: [UserController],
  providers: [UserService]
})
export class UserModule {}
