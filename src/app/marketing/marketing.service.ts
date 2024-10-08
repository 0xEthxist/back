import { Injectable } from '@nestjs/common';
import { ParentService } from 'src/common/services/parent.service';
import { CreateMarketingDto } from './dto/create-marketing.dto';
import { SubscribeDto } from './dto/subscribe.dto';
import { UpdateMarketingDto } from './dto/update-marketing.dto';

@Injectable()
export class MarketingService {
  constructor(private parentService: ParentService) { }

  async subscribe(subscribeDto: SubscribeDto) {
    let { email } = subscribeDto;

    let existSubscribe = await this.parentService.marketingModel.findOne({ email });

    if (existSubscribe)
      return this.parentService.fail('This is a duplicate email');

    let sub = await new this.parentService.marketingModel({
      email
    }).save();

    return {
      sub
    }
  }

}
