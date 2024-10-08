import { FilterQuery, Model, ProjectionType, SortOrder, UpdateQuery, UpdateWithAggregationPipeline } from "mongoose";

export abstract class IGenericRepository<T, TDoc> {

    abstract getAll(option?: FilterQuery<TDoc>, projection?: ProjectionType<T>, limitOfDocuments?: number, sort?: any): Promise<T[]>;

    abstract get(option?: FilterQuery<TDoc>, projection?: ProjectionType<T>, limitOfDocuments?: number, sort?: any): Promise<TDoc>;

    abstract create(item: T): Promise<T>;

    abstract updateOne(filter?: FilterQuery<T>, update?: UpdateQuery<T> | UpdateWithAggregationPipeline);
    abstract update(filter?: FilterQuery<T>, update?: UpdateQuery<T> | UpdateWithAggregationPipeline);
    abstract findByIdAndUpdate(id: string, update: UpdateQuery<T>);

    abstract count(filters?: FilterQuery<T>): any;

    abstract pagination(documentsToSkip?: number, limitOfDocuments?: number, sort?: string | { [key: string]: SortOrder | { $meta: 'textScore' } } | undefined | null, filters?: FilterQuery<T>, projection?: ProjectionType<T>): Promise<T[]>;
}