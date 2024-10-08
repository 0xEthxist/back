import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class ManualProfiletDto {
    @ApiPropertyOptional()
    @IsNotEmpty()
    name: String;

    @ApiPropertyOptional()
    @IsNotEmpty()
    pass: String;

    @ApiPropertyOptional()
    @IsNotEmpty()
    address: String;
}
