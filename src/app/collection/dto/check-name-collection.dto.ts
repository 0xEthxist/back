import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { contains, IsEmail, IsNotEmpty, MaxLength} from 'class-validator';


export class CheckNameCollectionDto {
    @MaxLength(50)
    @IsNotEmpty()
    @ApiProperty({required: true})
    name: String
}
