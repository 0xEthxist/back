import { FilterQuery, Model, ProjectionType, QueryOptions, SortOrder } from "mongoose";
import { Nft } from "src/schemas/nft.schema";
import { NftAuctionsFilter } from "./nft.interface";

export interface methodsQuery<T = Nft> {
    limit?: number,
    show?,
    collection?,
    sort?: string | { [key: string]: SortOrder | { $meta: 'textScore' } } | undefined | null,
    isAuction?: boolean,
    UpcomingAuction?: boolean,
    pagination?: paginationParams<T>
}


export interface paginationParams<T> {
    page: number,
    limit: number,
    filter?: FilterQuery<T>,
    projection?: ProjectionType<T> | null | undefined,
    options?: QueryOptions<T> | null | undefined,
    sort?: string | { [key: string]: SortOrder | { $meta: 'textScore' } } | undefined | null,
    queryModel?: Model<T>
}
export type paginationResult<T> = paginationResultInterface<T>

export interface paginationResultInterface<T> {
    results: T[],
    pagesNumber: number,
    count: number,
    lastPage: boolean

}