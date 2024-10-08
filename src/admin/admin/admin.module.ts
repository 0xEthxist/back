import { Module } from '@nestjs/common';
import { AdminService } from './admin.service';
import { AdminController } from './admin.controller';
import { ParentModule } from 'src/common/services/parent.module';
import { NotificationModule } from 'src/common/services/notification/notification.module';
import { OptionModule } from 'src/common/services/option/option.module';
import { AdminListenerService } from './listener/admin-listener.service';
import { HashService } from './hash.service';
import { AuthService } from '../auth/auth.service';
import { JwtStrategy } from '../strategy/jwt.strategy';
import { LocalStrategy } from '../strategy/local.strategy';
import { Admin, AdminSchema } from 'src/schemas/admin.schema';
import { MongooseModule } from '@nestjs/mongoose';
import { JwtModule } from '@nestjs/jwt';
import { jwtConstants } from '../strategy/constants';
import { DataServicesModule } from 'src/common/services/repository/data-services.module';

@Module({
  imports: [
    ParentModule,
    NotificationModule,
    DataServicesModule,
    OptionModule,
    JwtModule.register({
       secret: jwtConstants.secret,
       signOptions: {
         expiresIn: jwtConstants.expiresTime
       },
     }),
  ],
  exports: [
    AdminListenerService,
  ],
  controllers: [AdminController],
  providers: [AdminService, HashService, AuthService, JwtStrategy, LocalStrategy, AdminListenerService]
})
export class AdminModule { }
