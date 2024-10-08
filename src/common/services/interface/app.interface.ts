import { INestApplication } from "@nestjs/common";

export interface swaggerCreatorOption {
    app: INestApplication,
    appType: AppTypes,
    title?: string,
    desc?: string,
    version?: string,
    path: string
}

export enum AppTypes {
    user = 'user',
    admin = 'admin'
}