import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { ExploreService } from './explore.service';
import { ApiTags } from '@nestjs/swagger';
import { send_response } from 'src/common/response';
import { getExploreDto } from './dto/get-explore.dto';
import { ExploreCollectionDto } from './dto/explore-collection.dto';

/**
 * In this controller endpoint, we have items explorer and collection explorer
 */
@ApiTags('explore')
@Controller('explore')
export class ExploreController {
  constructor(private readonly exploreService: ExploreService) { }


  @Get()
  async findAll(@Query() query: getExploreDto) {

    let data = await this.exploreService.findAll(query);

    return send_response({
      data,
      message: 'explore api data'
    })
  }

  @Get('/collections')
  async exploreCollections(@Query() query: ExploreCollectionDto) {

    let data = await this.exploreService.exploreCollections(query);

    return send_response({
      data,
      message: 'explore api data'
    })
  }
}
