import { PartialType } from '@nestjs/mapped-types';
import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';
import { CreateMintDto } from './create-mint.dto';

export class UpdateMintDto {

    @IsNotEmpty()
    @ApiProperty({ required: true })
    scResponse: any;

    @IsNotEmpty()
    @ApiProperty({ required: true })
    nftId: String;
}
