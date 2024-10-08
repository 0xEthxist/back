import { User_kyc } from "src/schemas/user_kyc.schema";


/** 
 * @param {User_kyc} user
 * @return {boolean} if user not permision for user false else true
 */
export const lazyPermision = (user: User_kyc): boolean => {
    if (!user || !user.permision || !user.permision.collection || user.permision.collection.lazyCollection < 1)
        return false;
    return true;
}