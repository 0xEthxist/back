import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class FixNftDto {

    @IsNotEmpty()
    @ApiProperty({ required: true })
    nft_id: String;

    @IsNotEmpty()
    @ApiProperty({ required: true })
    scResponse: any;

    @IsNotEmpty()
    @ApiProperty({ required: true })
    base_value: Number;

}

export class BuyLazyMintDto {

    @IsNotEmpty()
    @ApiProperty({ required: true })
    nft_id: String;

}
