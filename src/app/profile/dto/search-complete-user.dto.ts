
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class SearchCompleteUserDto {
    @ApiProperty({ required: true })
    userKey: string;

}
