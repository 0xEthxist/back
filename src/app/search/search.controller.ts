import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { SearchService } from './search.service';
import { CreateSearchDto } from './dto/create-search.dto';
import { UpdateSearchDto } from './dto/update-search.dto';
import { ApiTags } from '@nestjs/swagger';
import { GetSearchDto } from './dto/get-search.dto';
import { send_response } from 'src/common/response';

/**
 * The endpoint related to searching in Market Place is located in this controller
 */
@ApiTags('search')
@Controller('search')
export class SearchController {
  constructor(private readonly searchService: SearchService) {}

  @Get()
  async search(@Query() query: GetSearchDto) {
    
    let data = await this.searchService.search(query);

    return send_response({
      data,
      message: 'search result'
    });
  }

}
