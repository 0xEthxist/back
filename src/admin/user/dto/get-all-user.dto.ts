
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { isInt, IsNotEmpty, IsNumber, IsPositive, Max, Min, ValidateIf } from 'class-validator';

export class GetAllUser {

    @ApiPropertyOptional()
    page: number;

    @ApiPropertyOptional()
    limit: number;

    @ApiPropertyOptional()
    all: boolean;

    @ApiPropertyOptional()
    search: string;
}
