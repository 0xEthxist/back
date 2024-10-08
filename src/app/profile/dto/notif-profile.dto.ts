
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { contains, IsEmail, IsNotEmpty, MaxLength, maxLength, useContainer, validate, ValidateBy, ValidateIf } from 'class-validator';

export class NotifProfileDto {

    @ApiPropertyOptional()
    notif_allow: [{
        action: String,
        allow: boolean,
    }];
}
