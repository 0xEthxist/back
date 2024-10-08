
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmpty, IsNotEmpty, MaxLength } from 'class-validator';


export class GetCollectionDto {
    // required fields
    @MaxLength(50)
    @ApiProperty({ required: true })
    @IsNotEmpty()
    name: String;

    @ApiPropertyOptional()
    sort: collectionSort;

    @ApiPropertyOptional()
    filter: collectionFilter;
}

export enum collectionSort {
    listed = 'listed',
    created = 'created',
    sold = 'sold',
    lowToHigh = 'lowToHigh',
    highToLow = 'highToLow',
    viewed = 'viewed',
    favorited = 'favorited'
}

export enum collectionFilter {
    buyNow = 'buyNow',
    liveAuction = 'liveAuction',
    offer = 'offer',
    reserve = 'reserve'
}