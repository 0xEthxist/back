import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';

export type MarketingDocument = Marketing & Document;

@Schema()
export class Marketing {
  @Prop()
  email: String;
  @Prop()
  time_added: String;

}

export const MarketingSchema = SchemaFactory.createForClass(Marketing);