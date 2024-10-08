import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';
import { Nft } from './nft.schema';
import { User_kycDocument } from './user_kyc.schema';

export type ListedDocument = Listed & Document;

export enum ListedStatus {
    not_sold = 'not_sold',
    active = 'active',
    selled = 'selled',
}

export enum Listedtype {
    fix = 'fix',
    auction = 'auction',
    reserve = 'reserve'
}

@Schema()
export class Listed {
    // metadata
    @Prop()
    nft_id: String;

    @Prop()
    tokenId: Number;

    @Prop()
    time_listed: String;
    @Prop()
    time_start: String;
    @Prop()
    time_end: String;
    @Prop()
    duration: String;
    @Prop()
    time_update: string;

    @Prop()
    type: Listedtype;
    @Prop()
    historyType: Listedtype;

    @Prop()
    suggestions: [{
        address: String,
        bid: Number,
        time: String,
        scResponse?: any,
        biderData?: User_kycDocument,
        link?: string
    }];

    @Prop()
    status: ListedStatus;

    @Prop()
    bought_by: String;

    @Prop()
    fix_price: Number;

    @Prop()
    base_value: Number;

}

export const ListedSchema = SchemaFactory.createForClass(Listed);