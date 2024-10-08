import { AdminPermision } from "../../../schemas/admin.schema";

export interface payloadAdmin {
    username: string,
    _id: string,
    address: string,
    name: string,
    type: number,
    permision: AdminPermision[]
}