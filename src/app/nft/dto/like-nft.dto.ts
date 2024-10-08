import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class LikeNftDto {

    @IsNotEmpty()
    @ApiProperty({ required: true })
    nft_id: String;

}
