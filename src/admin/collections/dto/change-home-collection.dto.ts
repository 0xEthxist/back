import { ApiProperty } from "@nestjs/swagger";

export class changeHomeCollectionDto {

    @ApiProperty({
        required: true
    })
    homeCollections: homeCollections[];
}

export type homeCollections = {
    id: string,
    priority: number
}