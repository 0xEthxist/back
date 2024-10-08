import { Module } from '@nestjs/common';
import { ExploreService } from './explore.service';
import { ExploreController } from './explore.controller';
import { ParentModule } from 'src/common/services/parent.module';
import { DataServicesModule } from 'src/common/services/repository/data-services.module';

/**
 * This module is for handling Explore Item and Explore Collection sections
 */
@Module({
  imports: [
    ParentModule
  ],
  controllers: [ExploreController],
  providers: [ExploreService]
})
export class ExploreModule { }
