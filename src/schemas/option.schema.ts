import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type OptionDocument = Option & Document;

@Schema()
export class Option {

    @Prop({ type: {} })
    royalty: {
        max: number;
    };

    @Prop({ type: {} })
    commission: {
        lazy: {
            percent: number;
            address: string;
        }
    };


}

export const OptionSchema = SchemaFactory.createForClass(Option);