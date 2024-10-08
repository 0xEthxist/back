import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type Category_web2Document = Category_web2 & Document;

@Schema()
export class Category_web2 {
    @Prop()
    title: String;
    @Prop({ type: [{}] })
    file_type: [{
        type: String,
    }];
    @Prop()
    icon: String;
    @Prop()
    show: Boolean;
}

export const Category_web2Schema = SchemaFactory.createForClass(Category_web2);