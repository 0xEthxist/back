import { FilterQuery, UpdateQuery } from "mongoose";
import { Category } from "src/schemas/category.schema";

export interface updateCollectionInput {
    filter: FilterQuery<Category>
}