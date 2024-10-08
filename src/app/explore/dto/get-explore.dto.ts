import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class getExploreDto {
    // sort
    @ApiPropertyOptional()
    sort: String;

    // filter query
    @ApiPropertyOptional()
    market: string;

    @ApiPropertyOptional()
    priceMin: string;
    @ApiPropertyOptional()
    priceMax: string;

    @ApiPropertyOptional()
    category_web2_ids: string;

    @ApiPropertyOptional()
    status: string;

    @ApiPropertyOptional()
    feature: string;

    @ApiProperty({ required: true })
    limit: number;

    @ApiProperty({ required: true })
    page: number;
}

export enum marketSaleType { primary = 'primary', secondary = 'secondary' }
export const exploreSort = {
    listed: 'listed',
    created: 'created',
    sold: 'sold',
    EndingSoon: 'EndingSoon',
    LowestPrice: 'LowestPrice',
    HighestPrice: 'HighestPrice'
}
export const exploreStatusFilter = {
    buyNow: 'buyNow',
    liveAuction: 'liveAuction',
    offer: 'offer',
    Reserve: 'Reserve',
    UpcomingAuction: 'UpcomingAuction'
}

export const exploreFeatureFilter = {
    lazyMint: 'lazyMint',
    collaborations: 'collaborations'
}

export const exploreMarketFilter = {
    primary: 'primary',
    secondary: 'secondary'
}