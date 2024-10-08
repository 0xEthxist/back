import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';

export type User_kycDocument = User_kyc & Document;

export enum NotifEvent {
  follow = 'follow',
  like = 'like',
  mint = 'mint',
  list = 'list',
  buy = 'buy',
  bid = 'bid',
  previousBid = 'previousBid',
  auctionSuccess = 'auctionSuccess',
  auctionEnd = 'auctionEnd',
  auctionStart = 'auctionStart',
  createCollection = 'createCollection',
  addFavorite = 'addFavorite',
  withdraw = 'withdraw',
  makeOffer = 'makeOffer',
  previousOffer = 'previousOffer',
  cancelOffer = 'cancelOffer',
  royalty = 'royalty'
}

export type UserPermision = {
  blocked: boolean;
  collection: {
    lazyCollection: number;
    // normal: { type: boolean };
  },
  mint: {
    normal: boolean
  }

}

export type ActiveOffers = {
  nft_id: String,
  price: string
}

export type notifType = {
  address: String;
  event: NotifEvent;
  time: String | number;
  seen: Boolean;
  message: String;
  link?: String;
  linkObject?: linkData
}
export type linkData = {
  tokenId: Number,
  creator: String,
  collectionName: String
}

@Schema()
export class User_kyc {
  @Prop()
  address: string;
  @Prop()
  name: String;
  @Prop()
  bio: String;
  @Prop()
  email: String;
  @Prop()
  username: String;
  @Prop()
  avatar: String;
  @Prop()
  banner: String;
  @Prop()
  active: boolean; // for kyc
  @Prop()
  time_added: String;
  @Prop()
  time_update: String;

  @Prop({ type: [{}] })
  social: [{
    key: String;
    value: String;
  }]

  @Prop({ type: [{ address: String }] })
  followers: [{
    address?: String;
  }];

  @Prop({ type: [{}] })
  following: [{
    address: String;
  }];

  @Prop({ type: [{}] })
  notif_allow: [{
    action: String;
    allow: boolean;
  }];

  @Prop({
    type: [{
      address: String,
      event: String,
      time: String,
      seen: Boolean,
      message: String,
      link: String,
      linkObject: Object
    }]
  })
  notif: notifType[];

  @Prop({
    type: {
      collection: {
        lazyCollection: Number
      }
    }
  })
  permision: UserPermision

  @Prop()
  ens: String;

  @Prop(
    {
      type: [{
        nft_id: String,
        price: String
      }],
    }
  )
  activeOffers: ActiveOffers[]
}

export const User_kycSchema = SchemaFactory.createForClass(User_kyc);