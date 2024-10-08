import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber } from 'class-validator';

export class TransferNftDto {

    @IsNotEmpty()
    @ApiProperty({ required: true })
    nft_id: String;

    @IsNotEmpty()
    @ApiProperty({ required: true })
    transferTo: String;

    @IsNotEmpty()
    @ApiProperty({ required: true })
    scResponse: any;
}
