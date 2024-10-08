import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber } from 'class-validator';

export class GetNftDto {

    @IsNotEmpty()
    // @IsNumber()
    @ApiProperty({ required: true })
    tokenId: String;

    @IsNotEmpty()
    @ApiProperty({ required: true })
    creator: String;

    @ApiPropertyOptional()
    collection: String;
}
