import { Controller, Get, Post, Body, Request, Query, Put, Logger } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { send_response } from 'src/common/response';
import { CollectionService } from './collection.service';
import { CheckNameCollectionDto } from './dto/check-name-collection.dto';
import { CreateCollectionDto } from './dto/create-collection.dto';
import { CreateLazyDto } from './dto/create-lazy.dto';
import { FavoriteDto } from './dto/favorite-collection.dto';
import { GetCollectionMintDto } from './dto/get-collection-mint.dto';
import { GetCollectionDto } from './dto/get-collection.dto';
import { UpdateCollectionDto } from './dto/update-collection.dto';

/**
 * All endpoints related to collections are located in this controller
 */
@ApiTags('collection')
@Controller('collection')
export class CollectionController {
  constructor(private readonly collectionService: CollectionService) { }

  @Post('check_name')
  async check_name(@Body() checkNameCollectionDto: CheckNameCollectionDto, @Request() req) {
    let data = await this.collectionService.check_name(checkNameCollectionDto, req.userAddress);

    return send_response({
      data,
      message: 'send collection result'
    });
  }

  @Get()
  async get(@Query() query: GetCollectionDto, @Request() req) {
    let data = await this.collectionService.get(query, req.userAddress);

    return send_response({
      data,
      message: 'send collection result'
    });

  }

  @Get('/mint')
  async getMint(@Query() query: GetCollectionMintDto, @Request() req) {
    let data = await this.collectionService.getMint(query, req.userAddress);

    return send_response({
      data,
      message: 'send collection result'
    });

  }

  // update for Feature web2
  @Put('/edit')
  async update(@Body() updateCollectionDto: UpdateCollectionDto, @Request() req) {
    let data = await this.collectionService.update(updateCollectionDto, req.userAddress);

    return send_response({
      data,
      message: 'send collection result'
    });

  }

  @Post('favorite')
  async favorite(@Body() favoriteDto: FavoriteDto, @Request() req) {
    let data = await this.collectionService.addFavorite(favoriteDto, req.userAddress);

    return send_response({
      data,
      message: 'favorite collection result'
    });

  }

  @Get('create-Lazy')
  async createLazy(@Query() query: CreateLazyDto, @Request() req) {
    let data = await this.collectionService.createLazy(query, req.userAddress);

    return send_response({
      data,
      message: 'create Lazy collection result'
    });

  }

}
