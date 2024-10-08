import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { send_response } from 'src/common/response';
import { CategoryWeb2Service } from './category-web2.service';
import { CreateCategoryWeb2Dto } from './dto/create-category-web2.dto';
import { UpdateCategoryWeb2Dto } from './dto/update-category-web2.dto';

@ApiTags('category-web2')
@Controller('category-web2')
export class CategoryWeb2Controller {
  constructor(private readonly categoryWeb2Service: CategoryWeb2Service) {}

  @Get()
  async findAll() {
    let data = await this.categoryWeb2Service.findAll();

    return send_response({ 
      data,
      message: 'categroy web2 api data'
     })
  }
}
