import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export class MakeLazyPermisionPost{

    @ApiProperty({required: true})
    address: string;

    @ApiProperty({required: true})
    count: string;
}