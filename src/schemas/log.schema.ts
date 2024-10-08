import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { User_kycDocument } from './user_kyc.schema';

export type LogDocument = Log & Document;


@Schema()
export class Log {

    @Prop()
    address: string;

    @Prop({ type: {} })
    log: object;

    @Prop()
    nft_id: string;

    @Prop()
    time: string;

}

export const LogSchema = SchemaFactory.createForClass(Log);