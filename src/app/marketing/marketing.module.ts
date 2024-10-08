import { Module } from '@nestjs/common';
import { MarketingService } from './marketing.service';
import { MarketingController } from './marketing.controller';
import { ParentModule } from 'src/common/services/parent.module';

@Module({
  imports: [
    ParentModule,
  ],
  controllers: [MarketingController],
  providers: [MarketingService]
})
export class MarketingModule { }
