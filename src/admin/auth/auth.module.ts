import { MiddlewareConsumer, Module, NestModule, RequestMethod } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Admin, AdminSchema } from 'src/schemas/admin.schema';
import { JwtModule } from '@nestjs/jwt';
import { LocalStrategy } from '../strategy/local.strategy';
import { HashService } from '../admin/hash.service';
import { AdminService } from '../admin/admin.service';
import { ParentModule } from 'src/common/services/parent.module';
import { GetAddressMiddleware } from 'src/common/middleware/get-address.middleware';
import { jwtConstants } from '../strategy/constants';
import { OptionModule } from 'src/common/services/option/option.module';
import { AdminWelcomeMiddleware } from 'src/common/middleware/admin-welcome.middleware';
import { DataServicesModule } from 'src/common/services/repository/data-services.module';

@Module({
    imports: [
        ParentModule,
        OptionModule,
        DataServicesModule,
        JwtModule.register({
            secret: jwtConstants.secret,
            signOptions: {
                expiresIn: '60d'
            },
        }),
    ],
    controllers: [AuthController],
    providers: [AuthService, AdminService, LocalStrategy, HashService],
})
export class AuthModule implements NestModule{ 
    configure(consumer: MiddlewareConsumer) {
  
      consumer
        .apply(AdminWelcomeMiddleware)
        .forRoutes(
          { path: 'auth/welcome', method: RequestMethod.POST }
        );
    }
} 
