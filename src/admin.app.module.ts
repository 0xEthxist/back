import { Module, CacheModule, Inject, CACHE_MANAGER, Logger } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';
import configuration from './common/config/configuration';
import { ServeStaticModule } from '@nestjs/serve-static'
import { join } from 'path';

import { NftModule } from './app/nft/nft.module';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import * as redisStore from 'cache-manager-redis-store';
import { WebsocketModule } from './websocket/websocket.module';
import { AuthModule } from './admin/auth/auth.module';
import { AdminModule } from './admin/admin/admin.module';
import { UserModule } from './admin/user/user.module';
import { CollectionsModule } from './admin/collections/collections.module';
import { ItemsModule } from './admin/items/items.module';

@Module({
    imports: [
        // register redis config and use on appp
        CacheModule.register({
            store: redisStore,
            host: 'localhost',
            port: 6379,
            isGlobal: true,
        }),

        // This code initializes and configures the ThrottlerModule provided by NestJS. This module adds rate limiting functionality to the application.
        /**
         * The .forRoot() method is used to pass in configuration options for the ThrottlerModule. 
         * In this case, it sets a time-to-live (TTL) of 2 seconds and a limit of 4 requests per TTL period. 
         * This means that if more than 4 requests are made within 2 seconds, 
         * the additional requests will be blocked until the next TTL period begins.
         */
        ThrottlerModule.forRoot({
            ttl: 2,
            limit: 4,
        }),

        /**
         * This code is setting up a global configuration module for the Nest.js application using an external configuration file. 
         * ConfigModule accepts an options object with two properties:
         * isGlobal: a boolean that specifies whether the module should be available everywhere in the application. 
         * Setting it to true makes the module a singleton that can be imported anywhere.
         * load: this allows you to specify different sources to load the application configuration from. 
         * In this case, we are passing an imported configuration module to read values from.
         */
        ConfigModule.forRoot(
            {
                isGlobal: true,
                load: [configuration]
            }
        ),

        /**
         * This code initializes connection to MongoDB using the Mongoose package. 
         * It uses the environment variable MONGO_URL to specify the URL of the MongoDB database.
         */
        MongooseModule.forRoot(process.env.MONGO_URL),

        // set static folder public for ssl
        ServeStaticModule.forRoot({
            rootPath: join(__dirname, '..', 'public'),
        }),

        AuthModule,
        AdminModule,
        UserModule,
        CollectionsModule,
        ItemsModule

    ],
    providers: [
        {
            provide: APP_GUARD,
            useClass: ThrottlerGuard,
        },
    ]

})

export class AdminAppModule {}
