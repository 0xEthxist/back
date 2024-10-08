import { Injectable } from '@nestjs/common';
import { ParentService } from 'src/common/services/parent.service';
import { CreateCategoryWeb2Dto } from './dto/create-category-web2.dto';
import { UpdateCategoryWeb2Dto } from './dto/update-category-web2.dto';

@Injectable()
export class CategoryWeb2Service {
  constructor(private parentService: ParentService) { }

  async findAll() {
    let catgory_web2 = await this.parentService.getCatWeb2();

    return {
      catgory_web2
    }
  }
  
}
