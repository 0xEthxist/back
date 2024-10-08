import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty } from "class-validator";

export class CreateAuthDto {}


export class AdminLoginDto {

    @IsNotEmpty()
    @ApiProperty({ required: true })
    username: String;

    @IsNotEmpty()
    @ApiProperty({ required: true })
    password: String;
}