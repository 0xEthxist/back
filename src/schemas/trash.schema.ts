import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type TrashDocument = Trash & Document;
export type TrashLog = {
    nature: TrashLogNature,
    details: any
}
export enum TrashLogNature {
    nft = 'nft',
    admin = 'admin'
}

@Schema()
export class Trash {
    @Prop({
        type: {
            nature: String,
            details: Object
        }
    })
    log: TrashLog
}

export const TrashSchema = SchemaFactory.createForClass(Trash);