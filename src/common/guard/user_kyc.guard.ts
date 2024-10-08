import { CanActivate, ExecutionContext, HttpException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import alchemyWeb3 from 'src/providers/alchemy-web3';
import { User_kyc, User_kycDocument } from 'src/schemas/user_kyc.schema';
import * as jwt from 'jsonwebtoken';
import { recoverySign } from 'src/helper/recovery-sign';

@Injectable()
export class UserKycGuard implements CanActivate {
  constructor(@InjectModel(User_kyc.name) private userModel: Model<User_kycDocument>) { }

  async canActivate(
    context: ExecutionContext,
  ) {
    try {
      const ctx = context.switchToHttp();
      const token = ctx.getRequest().headers['sign'];
      const req = ctx.getRequest();

      // get publipkey user from clinet's token
      let userAddress = recoverySign(token);

      // if (token)
      //   var sign = jwt.verify(token, process.env.privateKeySIGN);

      // if (sign && sign.includes('0x')) {

      //   // get addresss from sign
      //   let userAddress = alchemyWeb3.recovery(sign)
      //   if (!userAddress)
      //     throw new HttpException({
      //       success: false,
      //       message: 'sign invalid'
      //     }, 400);

      // check address is kyc
      let user = await this.userModel.findOne({ address: userAddress, active: true })

      if (!user)
        throw new HttpException({
          success: false,
          message: 'user not kyc'
        }, 401);

      req.user = user;
      return true;
      // }
      // throw new HttpException({
      //   success: false,
      //   message: 'sign is required'
      // }, 401);

    } catch (error) {
      throw new HttpException({
        success: false,
        message: error
      }, 401)

    }
  }
}