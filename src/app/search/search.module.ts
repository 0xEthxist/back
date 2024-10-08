import { Module } from '@nestjs/common';
import { SearchService } from './search.service';
import { SearchController } from './search.controller';
import { ParentModule } from 'src/common/services/parent.module';

/** This module handles the search section of our police market */
@Module({
  imports: [
    ParentModule,
  ],
  controllers: [SearchController],
  providers: [SearchService]
})
export class SearchModule {}
