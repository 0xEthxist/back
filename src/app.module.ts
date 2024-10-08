import { Module, CacheModule, Inject, CACHE_MANAGER, Logger } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';
import configuration from './common/config/configuration';
import { ServeStaticModule } from '@nestjs/serve-static'
import { join } from 'path';

import { NftModule } from './app/nft/nft.module';
import { HomeModule } from './app/home/home.module';
import { MintModule } from './app/mint/mint.module';
import { ProfileModule } from './app/profile/profile.module';
import { CollectionModule } from './app/collection/collection.module';
import { SearchModule } from './app/search/search.module';
import { ExploreModule } from './app/explore/explore.module';
import { CategoryWeb2Module } from './app/category-web2/category-web2.module';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import ethUsdt from './providers/eht-websocket';
import * as redisStore from 'cache-manager-redis-store';
import { Cache } from 'cache-manager';
import { MarketingModule } from './app/marketing/marketing.module';
import { WebsocketModule } from './websocket/websocket.module';
import { LogModule } from './app/log/log.module';

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

    // app modules
    /**
     * Below we have the modules related to Market Place, each of which has its own ecosystem, that is:
     * Each of them has a separate controller and services that work independently, 
     * although in some modules there is some dependence on the other.
     */
    NftModule, // To handle all NFT related tasks
    HomeModule, // To handle all home related tasks
    MintModule, // To handle all mint related tasks
    ProfileModule, // To handle all profile related tasks
    CollectionModule, // To handle all collection related tasks
    SearchModule, // To handle all search related tasks
    ExploreModule, // To handle all search explore tasks
    CategoryWeb2Module, // To handle all search cat tasks
    MarketingModule,
    WebsocketModule,
    LogModule

  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ]

})
export class AppModule {
  constructor(@Inject(CACHE_MANAGER) private cacheManager: Cache) { }

  onModuleInit() {
    Logger.log(`on Module Init ...`);
    try {
      let ethWsObject = new ethUsdt();

      ethWsObject.setHandler('getPrice', (params) => {
        this.setToCache(params)

      })

    } catch (error) {
      Logger.error(`in catch eth websocket`, error);

    }
  }

  async setToCache(params): Promise<void> {
    if (params && params.price)
      await this.cacheManager.set('eth-usd', +params.price);
  }
}
