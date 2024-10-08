import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, isEmail, IsEmpty, IsNotEmpty, MaxLength } from 'class-validator';


export class SubscribeDto {
  // required fields
  @IsEmail()
  @ApiProperty({ required: true })
  @IsNotEmpty()
  email: String;

}
