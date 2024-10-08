import { Module } from '@nestjs/common';
import { CategoryWeb2Service } from './category-web2.service';
import { CategoryWeb2Controller } from './category-web2.controller';
import { ParentModule } from 'src/common/services/parent.module';

@Module({
  imports: [
    ParentModule
  ],
  controllers: [CategoryWeb2Controller],
  providers: [CategoryWeb2Service]
})
export class CategoryWeb2Module {}
