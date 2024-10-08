import { Injectable } from '@nestjs/common';
import { ParentService } from 'src/common/services/parent.service';
import { CreateLogDto } from './dto/create-log.dto';
import { UpdateLogDto } from './dto/update-log.dto';

@Injectable()
export class LogService {

  constructor(private parentService: ParentService) { }

  /**
   * This action adds a new log from ui bug
   * @param createLogDto 
   * @param address 
   * @returns 
   */
  async createLog(createLogDto: CreateLogDto, address: string) {
    let { log, nft_id, time } = createLogDto; 

    await new this.parentService.LogModel({
      address,
      log,
      nft_id,
      time: this.parentService.Tools.get_now_time()

    }).save()

    return {
      message: 'This action adds a new log'
    };
  }
}
