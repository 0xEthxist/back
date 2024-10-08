import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';


export class ExploreCollectionDto {

    @ApiProperty({ required: true })
    limit: number;

    @ApiProperty({ required: true })
    page: number;

    @ApiPropertyOptional()
    sort: String;

    @ApiPropertyOptional()
    collectionType: string;

    @ApiPropertyOptional()
    minNumberOfArtworks: number;
    @ApiPropertyOptional()
    maxNumberOfArtworks: number;

    @ApiPropertyOptional()
    minTotalSales: string;
    @ApiPropertyOptional()
    maxTotalSales: string;

    @ApiPropertyOptional()
    minFloorPrice: string;
    @ApiPropertyOptional()
    maxFloorPrice: string;

    @ApiPropertyOptional()
    category_web2_ids: string;
}

export const exploreCollectionSort = {
    owners: 'owners',
    floorPriceHighest: 'floorPriceHighest',
    floorPriceLowest: 'floorPriceLowest',
    newest: 'newest',
    oldest: 'oldest'
}

export const exploreCollectionType = {
    standard: 'standard',
    lazyMint: 'lazyMint',
}
