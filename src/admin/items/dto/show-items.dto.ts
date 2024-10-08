
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { isInt, IsNotEmpty, IsNumber, IsPositive, Max, Min, ValidateIf } from 'class-validator';

export class GetAllItems {

    @ApiPropertyOptional()
    page: number;

    @ApiPropertyOptional()
    limit: number;

    @ApiPropertyOptional()
    search: string;

}
