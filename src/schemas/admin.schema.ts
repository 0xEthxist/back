import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';

export type AdminDocument = Admin & Document;

export enum AdminType {
  admin1 = 1,
  admin2 = 2,
  admin3 = 3,
  manager = 4,
  viewer = 5
}
export enum AdminLogName {
  adminAdded = 'adminAdded',
  adminRemoved = 'adminRemoved'
}
export type AdminLogs = {
  log: {
    name: AdminLogName | AdminPermisionMethod,
    action: any
  },
  logTime: String
}
export type lastLogin = {
  time: string,
  token: string
}
export type lasUpdateAdmin = {
  by: string,
  time: number
}
export type AdminPermision = {
  _method: AdminPermisionMethod,
  allow: Boolean
}

export enum AdminPermisionMethod {
  getAdmins = 'getAdmins',
  editAdmin = 'editAdmin',
  getCreateAdmin = 'getCreateAdmin',
  postCreateAdmin = 'postCreateAdmin',
  showUsers = 'showUsers',
  makeLazyPermision = 'makeLazyPermision',
  getAllCollection = 'getAllCollection',
  changeHomeCollection = 'changeHomeCollection',
  showItems = 'showItems',
  toggleInInterface = 'toggleInInterface',
}
@Schema()
export class Admin {

  @Prop({ unique: true })
  username: string;
  @Prop()
  password: string;
  @Prop({ unique: true })
  address: string;
  @Prop()
  name: string;

  @Prop({
    type: [{
      _method: String,
      allow: Boolean
    }]
  })
  permision: AdminPermision[];

  @Prop({ type: Number })
  admin_type: AdminType;
  @Prop()
  time_added: number;

  @Prop({
    type: {
      by: String,
      time: Number
    }
  })
  last_update: lasUpdateAdmin

  // for last logining a user to admin panel
  @Prop({
    type: {
      time: String,
      token: String
    }
  })
  last_login: lastLogin;

  @Prop()
  maker: String;

  @Prop({
    type: [{
      log: {
        name: String,
        action: Object
      },
      logTime: String
    },]
  })
  logs: AdminLogs[];
}

export const AdminSchema = SchemaFactory.createForClass(Admin);