import { FilterQuery, Model, ProjectionType, QueryWithHelpers, UpdateQuery } from 'mongoose';
import { IGenericRepository } from './abstract-repository';

export class MongoGenericRepository<T, TDoc> implements IGenericRepository<T, TDoc> {
    private _repository: Model<T>;
    private _populateOnFind: string[];

    constructor(repository: Model<T>, populateOnFind: string[] = []) {
        this._repository = repository;
        this._populateOnFind = populateOnFind;
    }

    getAll(option?: Object, projection?: ProjectionType<T>, limitOfDocuments?: number, sort?: any): Promise<T[]> {
        let findQuery = this._repository.find(option, projection).populate(this._populateOnFind);
        if (limitOfDocuments) {
            findQuery.limit(limitOfDocuments);
        }

        if (sort) {
            findQuery.sort(sort);
        }

        return findQuery.exec();
    }

    get(option: Object, projection?: ProjectionType<T>, limitOfDocuments?: number, sort?: any): Promise<any> {
        let findQuery = this._repository.findOne(option, projection);
        // if (limitOfDocuments) {
        //     findQuery.limit(limitOfDocuments);
        // }

        // if (sort) {
        //     findQuery.sort(sort);
        // }

        return findQuery.exec();

    }

    create(item: T): Promise<T> {
        return this._repository.create(item);
    }

    findByIdAndUpdate(id: string, item: UpdateQuery<T>) {
        return this._repository.findByIdAndUpdate(id, item);
    }

    updateOne(filter: FilterQuery<T>, item: UpdateQuery<T>) {
        return this._repository.updateOne(filter, item);
    }

    update(filter: FilterQuery<T>, item: UpdateQuery<T>) {
        return this._repository.updateMany(filter, item);
    }

    count(filters: FilterQuery<T> = {}) {
        return this._repository.count(filters);
    }

    pagination(documentsToSkip = 0, limitOfDocuments, sort, filters: FilterQuery<T> = {}, projection?: ProjectionType<T> | null | undefined): Promise<T[]> {
        let findQuery = this._repository
            .find(filters, projection)
            // .sort(sort)
            .skip(documentsToSkip);

        if (limitOfDocuments) {
            findQuery.limit(limitOfDocuments);
        }

        if (sort) {
            findQuery.sort(sort);
        }

        return findQuery.exec();
    }


}