import { Body, Controller, Get, Param, Post, UseGuards, Request, Put } from '@nestjs/common';
import { AdminService } from './admin.service';
import { AuthGuard } from '@nestjs/passport';
import { AdminGuard } from 'src/common/guard/admin.guard';
import { send_response } from 'src/common/response';
import { EditAdminDto } from './dto/edit-admin.dto';
import { RolePermisionGuard } from '../../common/guard/admin-permision.guard';
import { AdminPermisionMethod, AdminType } from '../../schemas/admin.schema';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('admin')
@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) { }

  // @UseGuards(AuthGuard('jwt'), AdminGuard)
  // @Get('username/:username')
  // async getUserByUsername(@Param() param, @Request() req) {
  //   let data = await this.adminService.getUserByUsername(param.username, req);

  //   return send_response({ data });
  // }

  /**
   * get all admins
   * @param {EditAdminDto}editAdminDto 
   * @param req 
   * @returns 
   */
  @UseGuards(AuthGuard('jwt'), AdminGuard, RolePermisionGuard(AdminPermisionMethod.getAdmins))
  @Get()
  async getAdmins(@Request() req) {
    console.log("ss")
    let data = await this.adminService.getAdmins(req.user);

    return send_response({ data });

  }

  /**
   * edit admins by manager
   * @param {EditAdminDto}editAdminDto 
   * @param req 
   * @returns 
   */
  @UseGuards(AuthGuard('jwt'), AdminGuard, RolePermisionGuard(AdminPermisionMethod.editAdmin))
  @Put('/edit')
  async editAdmin(@Body() editAdminDto: EditAdminDto, @Request() req) {
    let data = await this.adminService.editAdmin(editAdminDto, req.user);

    return send_response({ data });

  }

  /**
   * get create viewer by manger data
   * @param req 
   * @returns 
   */
  @UseGuards(AuthGuard('jwt'), AdminGuard, RolePermisionGuard(AdminPermisionMethod.getCreateAdmin))
  @Get('/create')
  async getCreateAdmin(@Request() req) {
    let data = this.adminService.getViewerPermisions(req.user);

    return send_response({ data });

  }

  /**
   * post endpoint create viewer by manger
   * @param createViewerDto 
   * @param req 
   * @returns 
   */
  @UseGuards(AuthGuard('jwt'), AdminGuard, RolePermisionGuard(AdminPermisionMethod.postCreateAdmin))
  @Post('/create')
  async postCreateAdmin(@Body() createViewerDto: EditAdminDto, @Request() req) {
    let data = await this.adminService.editAdmin(createViewerDto, req.user);

    return send_response({ data });

  }

}
