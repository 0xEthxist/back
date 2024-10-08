import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class GetProfiletDto {
    @ApiPropertyOptional()
    userkey: String;
}
