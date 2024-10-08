import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class CancelNftDto {

    @IsNotEmpty()
    @ApiProperty({ required: true })
    nft_id: String;

    @IsNotEmpty()
    @ApiProperty({ required: true })
    scResponse: any;

}