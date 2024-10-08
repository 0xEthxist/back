import { ExecutionContext, HttpException, Logger } from "@nestjs/common";
import * as jwt from 'jsonwebtoken';
import alchemyWeb3 from 'src/providers/alchemy-web3';

/**
 * get client's token in argument 
 *  steps:
 *   1. verify with jsonWebToken library 
 *   2. revovery with web3.sj library and get user's public key
 * @param token 
 * @returns 
 */
export const recoverySign = (token: string, role?: string) => {

    if (token)
        try {
            var sign = jwt.verify(token, process.env.privateKeySIGN);
        } catch (error) {
            throw new HttpException({
                success: false,
                message: 'sign is invalid at jwt',
                jwtMessage: error
            }, 401);
        }

    // check exist sign and sign not a address wallet
    if (sign && sign.includes('0x')) {

        // get public key from sign
        let userAddress = alchemyWeb3.recovery(sign, role)

        if (!userAddress)
            throw new HttpException({
                success: false,
                message: 'sign invalid'
            }, 400);

        return userAddress;
    }

    throw new HttpException({
        success: false,
        message: 'sign is required'
    }, 401);


}