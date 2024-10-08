
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmpty, IsNotEmpty, MaxLength } from 'class-validator';


export class CreateLazyDto {
    // required fields
    @ApiProperty({ required: true })
    name: string;
    @ApiProperty({ required: true })
    symbol: string;
    @ApiProperty({ required: true })
    catWeb2_id: string;
}
