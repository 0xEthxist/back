import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty } from "class-validator";

export class UpdateNftDto {

    @IsNotEmpty()
    @ApiProperty({ required: true })
    nft_id: string;

    @IsNotEmpty()
    @ApiProperty({ required: true })
    price: Number;
}
