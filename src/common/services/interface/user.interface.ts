import { FilterQuery } from "mongoose";
import { linkData, NotifEvent, User_kyc, User_kycDocument } from "src/schemas/user_kyc.schema";

export interface GetUserOption extends FilterQuery<User_kyc> {
    address?: any,
    _id?: String,
    username?,
    $or?,
}

export interface notificationOption {
    address?: any,
    event?: NotifEvent,
    message?: String,
    targetUser?: User_kycDocument,
    targetUserAddress?: any,
    link ?: String,
    linkObject?: linkData
}