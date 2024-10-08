import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';
import { Category_web2 } from './category_web2.schema';
import { Listed } from './listed.schema';

export type NftDocument = Nft & Document;

export enum NftStatus {
  invisible = 'invisible',
  minted = 'minted',
  fix = 'fix',
  auction = 'auction',
  sold = 'sold',
  lazy = 'lazy',
  reserve = 'reserve',
  fixAndReserve = 'fixAndReserve'
}

export enum NftActions {
  fix = 'fix',
  auction = 'auction',
  buy = 'buy',
  mint = 'mint',
  cancel = 'cancel',
  cancelReserve = 'cancelReserve',
  edit = 'edit',
  transfer = 'transfer',
  lazyMint = 'lazyMint',
  reserve = 'reserve'
}

// export enum NftParallelStatus {
//   reserve = 'reserve'
// }

export enum NftTypes {
  ERC721 = 'ERC721',
  ERC1155 = 'ERC1155'
}

export enum NftMintTypes {
  normal = 'normal',
  lazyMint = 'lazyMint'
}

export type NftCollaborator = {
  address: String,
  share: number,
  avatar: string,
  username: string
}

export type NftView = {
  ip: String,
  address?: String,
  count: number
}

/**
//  * @typedef NftOffers type offers on nfts
//  */
export type NftOffers = {
  address: String,
  username?: String,
  price: string,
  status: OfferStatus,
  notifLevel?: NotifLevel,
  create_time: String,
  scResponse?: any
}

export enum NotifLevel {
  d3 = 'd3',
  w1 = 'w1',
  w2 = 'w2',
  w3 = 'w3',
  m1 = 'm1',
  end = 'end'
}

export type nftPath = {
  action: NftActions,
  by: String,
  price: Number,
  time: any,
}

/**
 * @enum [active,accept,susspended, withdrawal]
 */
export enum OfferStatus {
  active = 'active',
  accept = 'accept',
  susspended = 'susspended',
  withrawal = 'withrawal'
}

@Schema()
export class Nft {
  // metadata
  @Prop()
  name: String;

  @Prop()
  description: String;

  @Prop()
  description_ui: String;

  @Prop()
  image: String;


  // cashing 
  @Prop()
  image_original: String;

  // @Prop()
  image_original_file: File;

  @Prop()
  image_cid: String;

  @Prop()
  uri: String;

  @Prop({ type: {} })
  uri_original: Object;

  @Prop()
  uri_cid: String;

  @Prop()
  history: any[];


  // web2
  @Prop({ type: [{}] })
  like: {
    address: String,
    time: String,
  }[];

  @Prop({
    type: [{
      ip: String,
      address: String,
      count: Number,
    }]
  })
  views: NftView[];

  @Prop()
  tags: [];

  @Prop()
  status: NftStatus;

  // @Prop()
  // parallel_status: NftParallelStatus;

  @Prop()
  show: boolean;

  @Prop()
  updated_by: String;


  @Prop()
  owner: String;

  @Prop()
  creator: String;

  @Prop({ default: 0 })
  price: Number;


  // unic
  @Prop()
  category: String;

  @Prop()
  tokenId: Number;

  @Prop()
  category_web2_title: String;

  @Prop()
  category_web2_id: String;

  @Prop({
    type: [{
      action: String,
      by: String,
      price: Number,
      time: String,
    }]
  })
  nft_path: nftPath[]

  // times
  @Prop()
  time_create: String;
  @Prop()
  time_updated: String;
  @Prop()
  time_listed: String;
  @Prop()
  time_sold: String;

  @Prop({ type: {} })
  listed?: Listed;

  @Prop({ default: NftTypes.ERC721 })
  type: NftTypes;

  @Prop({ default: NftMintTypes.normal })
  mintTypes: NftMintTypes;

  @Prop()
  royalty: number;

  @Prop(
    {
      type: [{
        address: String,
        share: Number,
        avatar: String,
        username: String
      }]
    }
  )
  collaborators: NftCollaborator[];

  @Prop(
    {
      type: [{
        address: String,
        username: String,
        price: String,
        status: String,
        notifLevel: String,
        create_time: String,
        scResponse: Object
      }],
    }
  )
  offers: NftOffers[]

}

export const NftSchema = SchemaFactory.createForClass(Nft);
// export const NftTrashSchema = SchemaFactory.createForClass('nft-trash', Nft);