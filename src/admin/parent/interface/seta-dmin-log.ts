import { AdminPermisionMethod } from "src/schemas/admin.schema";

export interface setAdminLogInput {
    name: AdminPermisionMethod,
    action?: any,
    adminId: string,
}