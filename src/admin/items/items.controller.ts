import { Body, Controller, Get, Patch, Query, Request, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags } from '@nestjs/swagger';
import { RolePermisionGuard } from 'src/common/guard/admin-permision.guard';
import { AdminGuard } from 'src/common/guard/admin.guard';
import { send_response } from 'src/common/response';
import { AdminPermisionMethod } from 'src/schemas/admin.schema';
import { GetAllItems } from './dto/show-items.dto';
import { ToggleInShow } from './dto/toggle-in-interface.dto';
import { ItemsService } from './items.service';

@ApiTags('items')
@Controller('items')
export class ItemsController {
  constructor(private readonly itemsService: ItemsService) { }


  /**
   * get all items
   * @returns 
   */
  @UseGuards(AuthGuard('jwt'), AdminGuard, RolePermisionGuard(AdminPermisionMethod.showItems))
  @Get()
  async findAll(@Query() query: GetAllItems, @Request() req) {
    let data = await this.itemsService.getAllItems(query, req.user);

    return send_response({ data });
  }

  /**
   * display or not display the item on the interface
   * @returns 
   */
  @UseGuards(AuthGuard('jwt'), AdminGuard, RolePermisionGuard(AdminPermisionMethod.toggleInInterface))
  @Patch('toggle-in-interface')
  async toggleInInterface(@Body() body: ToggleInShow, @Request() req) {
    let data = await this.itemsService.toggleInInterface(body, req.user);

    return send_response({ data });
  }

}
