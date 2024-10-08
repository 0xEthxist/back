import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request, Query } from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { send_response } from 'src/common/response';
import { ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { AdminGuard } from 'src/common/guard/admin.guard';
import { RolePermisionGuard } from 'src/common/guard/admin-permision.guard';
import { AdminPermisionMethod } from 'src/schemas/admin.schema';
import { GetAllUser } from './dto/get-all-user.dto';
import { MakeLazyPermisionPost } from './dto/make-lazy-permision-post.dto';

@ApiTags('users')
@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) { }

  /**
   * get all users
   * @returns 
   */
  @UseGuards(AuthGuard('jwt'), AdminGuard, RolePermisionGuard(AdminPermisionMethod.showUsers))
  @Get()
  async findAll(@Query() query: GetAllUser, @Request() req) {
    console.log("wewewewe",req.user)
    let data = await this.userService.findAll(query, req.user);

    return send_response({ data });
  }

  
  @UseGuards(AuthGuard('jwt'), AdminGuard, RolePermisionGuard(AdminPermisionMethod.makeLazyPermision))
  @Post('/make-lazy-permision')
  async makeLazyPermision(@Body() body: MakeLazyPermisionPost, @Request() req) {
    let data = await this.userService.makeLazyPermision(body, req.user);

    return send_response({ data });
  }

}
