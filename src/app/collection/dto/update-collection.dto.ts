import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, MaxLength } from 'class-validator';
import { collectionSocial } from 'src/schemas/category.schema';
import { CreateCollectionDto } from './create-collection.dto';

export class UpdateCollectionDto {
    // required fields

    @ApiProperty({ required: true })
    @IsNotEmpty()
    id: String;


    // optional fields
    @ApiPropertyOptional()
    title: String;

    @ApiPropertyOptional()
    description: String;

    @ApiPropertyOptional()
    image: String;

    @ApiPropertyOptional()
    banner: String;

    @ApiPropertyOptional()
    logo: String;

    @ApiPropertyOptional()
    @IsOptional()
    social: [{
        key: String,
        value: String,
    }]

    // @ApiPropertyOptional()
    // category_web2_id: String;
}
