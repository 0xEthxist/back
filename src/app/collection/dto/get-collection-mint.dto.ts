import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmpty, IsNotEmpty, MaxLength } from 'class-validator';


export class GetCollectionMintDto {
    // required fields
    @MaxLength(50)
    @ApiProperty({ required: true })
    @IsNotEmpty()
    category_web2_id: String;
}