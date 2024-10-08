import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty } from "class-validator";

export class CreateLogDto {

    @IsNotEmpty()
    @ApiProperty({ required: true })
    nft_id: String;

    @IsNotEmpty()
    @ApiProperty({ required: true })
    log: any;

    @IsNotEmpty()
    @ApiProperty({ required: true })
    time: string;
}
