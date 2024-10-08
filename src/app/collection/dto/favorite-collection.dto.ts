import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmpty, IsNotEmpty, MaxLength } from 'class-validator';


export class FavoriteDto {
    // required fields
    @ApiProperty({ required: true })
    collectionId: String;
}
