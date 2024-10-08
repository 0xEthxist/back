import { Controller, Get, Post, Body, Patch, Param, Delete, Request } from '@nestjs/common';
import { MarketingService } from './marketing.service';
import { CreateMarketingDto } from './dto/create-marketing.dto';
import { UpdateMarketingDto } from './dto/update-marketing.dto';
import { SubscribeDto } from './dto/subscribe.dto';
import { send_response } from 'src/common/response';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('marketing')
@Controller('marketing/subscribe')
export class MarketingController {
  constructor(private readonly marketingService: MarketingService) { }

  @Post()
  async subscribe(@Body() subscribeDto: SubscribeDto, @Request() req) {
    let data = await this.marketingService.subscribe(subscribeDto);

    return send_response({
      data,
      message: 'subscribe message'
    });
  }

}
