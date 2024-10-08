import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmpty, IsNotEmpty, MaxLength } from 'class-validator';


export class CreateCollectionDto {
    // required fields
    @MaxLength(50)
    @ApiProperty({ required: true })
    @IsNotEmpty()
    name: String;

    // @ApiProperty({ required: true })
    // @IsNotEmpty()
    @ApiPropertyOptional()
    scResponse: any;


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
}
