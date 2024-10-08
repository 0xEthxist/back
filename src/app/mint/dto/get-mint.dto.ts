import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class GetMintDto {
    @IsNotEmpty()
    @ApiProperty({ required: true })
    sign: String;
}
