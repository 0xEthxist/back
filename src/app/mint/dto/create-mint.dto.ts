import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, MaxLength } from 'class-validator';
import { NftCollaborator } from 'src/schemas/nft.schema';

export class CreateMintDto {
    @IsNotEmpty()
    @MaxLength(50)
    @ApiProperty({ required: true })
    name: String;

    @ApiProperty({ required: true })
    @MaxLength(1500, {message:'max length description is 1500'})
    description: String;

    @ApiPropertyOptional()
    description_ui: String;

    @ApiProperty({ required: true })
    royalty: number;

    @ApiProperty({ required: true })
    _collaborators: string;

    // @IsNotEmpty()
    @ApiProperty()
    file: Express.Multer.File;

    // @ApiProperty()
    // @IsNotEmpty()
    // owner: String;

    @ApiPropertyOptional({isArray:true})
    tags?: [];
    // tags?: {
    //     tag: String
    // };

    @ApiProperty({required:true})
    category_web2_id: String;

    @ApiPropertyOptional()
    category_id?: String;
}

export class CreateLazyMintDto {
    @IsNotEmpty()
    @MaxLength(50)
    @ApiProperty({ required: true })
    name: String;

    @ApiProperty({ required: true })
    @MaxLength(1500)
    description: String;

    @ApiPropertyOptional()
    description_ui: String;

    @ApiProperty({ required: true })
    royalty: number;

    @ApiProperty({ required: true })
    price: string;

    @ApiProperty({ required: true })
    _collaborators: string;

    // @IsNotEmpty()
    @ApiProperty()
    file: Express.Multer.File;

    @ApiPropertyOptional({isArray:true})
    tags?: [];

    @ApiProperty({required:true})
    category_web2_id: String;

    @ApiPropertyOptional()
    category_id?: String;
}
