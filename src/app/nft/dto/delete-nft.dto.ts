import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty } from "class-validator";

export class DeleteNftDto {

    @IsNotEmpty()
    @ApiProperty({ required: true })
    nft_id: string;

}
