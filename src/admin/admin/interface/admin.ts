import { AdminDocument } from "src/schemas/admin.schema"

export interface AdminAddedOption {
  newAdmin?: string,
  accessLevel: number,
  scResponse: any
}


export interface AdminRemovedOption extends AdminAddedOption {
  removedAdmin: string
}