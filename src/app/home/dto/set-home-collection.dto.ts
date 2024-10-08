import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsNotEmpty } from "class-validator";


export class SetHomeCollection{
    @ApiPropertyOptional()
    @IsNotEmpty()
    name: String;

    @ApiPropertyOptional()
    @IsNotEmpty()
    pass: String;

    @ApiPropertyOptional()
    @IsNotEmpty()
    collectionId: String;
}