import { Controller, Get, Post, Body, Patch, Param, Delete, Request } from '@nestjs/common';
import { LogService } from './log.service';
import { CreateLogDto } from './dto/create-log.dto';
import { UpdateLogDto } from './dto/update-log.dto';
import { send_response } from 'src/common/response';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('log')
@Controller('log')
export class LogController {
  constructor(private readonly logService: LogService) {}

  /**
   * 
   * @param createLogDto 
   * @param req 
   * @returns {send_response()}
   */
  @Post()
  async create(@Body() createLogDto: CreateLogDto, @Request() req) {

    let data = await this.logService.createLog(createLogDto, req.userAddress);

    return send_response({ data })
  }
}
