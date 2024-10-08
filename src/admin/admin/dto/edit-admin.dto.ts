import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty } from "class-validator";
import { Admin, AdminPermision } from "src/schemas/admin.schema";


export class EditAdminDto {

    @IsNotEmpty()
    @ApiProperty({ required: true })
    username: string;

    @ApiProperty({ required: true })
    password: string;

    @IsNotEmpty()
    @ApiProperty({ required: true })
    name: string;

    @ApiProperty({ required: true })
    address?: string;

    @ApiProperty({ required: true })
    adminId: String;

    @ApiProperty({ required: true })
    permision: AdminPermision[];


}