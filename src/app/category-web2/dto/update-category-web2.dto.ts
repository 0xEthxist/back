import { PartialType } from '@nestjs/swagger';
import { CreateCategoryWeb2Dto } from './create-category-web2.dto';

export class UpdateCategoryWeb2Dto extends PartialType(CreateCategoryWeb2Dto) {}
