import { Body, Controller, Get, Patch, Query, Request, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags } from '@nestjs/swagger';
import { SetHomeCollection } from 'src/app/home/dto/set-home-collection.dto';
import { RolePermisionGuard } from 'src/common/guard/admin-permision.guard';
import { AdminGuard } from 'src/common/guard/admin.guard';
import { send_response } from 'src/common/response';
import { AdminPermisionMethod } from 'src/schemas/admin.schema';
import { CollectionsService } from './collections.service';
import { changeHomeCollectionDto } from './dto/change-home-collection.dto';

@ApiTags('collections')
@Controller('collections')
export class CollectionsController {
  constructor(private readonly collectionsService: CollectionsService) { }

  /**
   * get all collection
   * @returns 
   */
  @UseGuards(AuthGuard('jwt'), AdminGuard, RolePermisionGuard(AdminPermisionMethod.getAllCollection))
  @Get()
  async getAllCollection(@Request() req) {
    let data = await this.collectionsService.getAllCollection(req.user);

    return send_response({ data });
  }


  /**
   * 
   * @param body 
   * @param req 
   * @returns 
   */
  @UseGuards(AuthGuard('jwt'), AdminGuard, RolePermisionGuard(AdminPermisionMethod.changeHomeCollection))
  @Patch('/change-home-collection')
  async changeHomeCollection(@Body() body: changeHomeCollectionDto, @Request() req) {
    let data = await this.collectionsService.changeHomeCollection(body, req.user);

    return send_response({ data });
  }


  /**
   * 
   * @param setHomeCollection; 
   * @param req 
   * @returns 
   */
  @UseGuards(AuthGuard('jwt'), AdminGuard, RolePermisionGuard(AdminPermisionMethod.changeHomeCollection))
  @Patch('/set-and-remove-collection')
  async setAndRemoveHomeCollection(@Body() setHomeCollection: SetHomeCollection, @Request() req) {
    let data = await this.collectionsService.setAndRemoveHomeCollection(setHomeCollection, req.user);

    return send_response({ data });
  }


}
