import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';
import { Category_web2 } from './category_web2.schema';

export type CategoryDocument = Category & Document;

export enum CollectionType {
  normal = 'normal',
  lazy = 'lazy'
}

export type collectionSocial = {
  key: String;
  value: String;
}

export type collectionOwners = {
  address: string,
  itemCount: number,
  tokenIds: number[]
}

@Schema()
export class Category {
  @Prop()
  name: String;

  @Prop()
  symbol: String;

  @Prop()
  title: String;

  @Prop()
  description: String;

  @Prop()
  image: String;

  @Prop()
  owner: String;

  @Prop()
  contract_address: string;

  @Prop()
  abi: String;

  @Prop()
  time_created: String;

  @Prop()
  time_updated: String;

  @Prop()
  logo: String;

  @Prop()
  banner: String;

  @Prop()
  category_web2_id: String;

  @Prop({ type: [{}] })
  favorite_list: {
    address: string;
  }[]

  @Prop({ enum: CollectionType, default: CollectionType.normal })
  type: CollectionType

  @Prop()
  totalSupply: number

  @Prop({ default: 0 })
  itemCounter: number;

  @Prop({ default: 0 })
  burnCounter: number;

  @Prop({
    type: [{}]
  })
  social: collectionSocial[]

  @Prop()
  inHome: boolean;

  @Prop()
  priority: number;

  @Prop()
  floor_price: number;

  @Prop()
  total_sales: number;

  @Prop({
    type: [{
      address: String,
      itemCount: Number,
      tokenIds: [Number]
    }]
  })
  owners: collectionOwners[];

  @Prop({ default: 0 })
  ownerLength: number;
}

export const CategorySchema = SchemaFactory.createForClass(Category);