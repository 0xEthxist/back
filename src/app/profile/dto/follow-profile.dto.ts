import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class FollowProfileDto {
    @ApiProperty({required:true})
    userAddress: String;
}