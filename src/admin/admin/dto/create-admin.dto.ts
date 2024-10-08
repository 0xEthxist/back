import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty } from "class-validator";


export class CreateAdminDto {
    
    @IsNotEmpty()
    @ApiProperty({ required: true })
    username: String;

    @IsNotEmpty()
    @ApiProperty({ required: true })
    password: String;
}