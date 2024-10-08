import { HttpException, Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import alchemyWeb3 from 'src/providers/alchemy-web3';
import * as jwt from 'jsonwebtoken';
import { InjectModel, MongooseModule } from '@nestjs/mongoose';
import { User_kyc, User_kycDocument, User_kycSchema } from 'src/schemas/user_kyc.schema';
import mongoose, { Model } from 'mongoose';
// import { _Tools } from 'src/helper/tools';

// let userModel = MongooseModule.forFeature([{ name: User_kyc.name, schema: User_kycSchema }]);
@Injectable()
export class GetAddressMiddleware implements NestMiddleware {
  // constructor(@InjectModel(User_kyc.name) private userModel: Model<User_kycDocument>) { }

  async use(req: Request, res: Response, next: NextFunction) {
    let token = req.headers['sign'];

    if (!token)
      token = req.body.sign;

    if (!token)
      token = req.params.sign;

    // decode with private code and jwt
    if (token)
      var sign = jwt.verify(token.toString(), process.env.privateKeySIGN);

    if (sign) {
      let userAddress = alchemyWeb3.recovery(sign)

      if (!userAddress)
        throw new HttpException({
          success: false,
          message: 'sign is invalid!'
        }, 400)
      
      req['user'] = userAddress;
      req['userAddress'] = userAddress;
      

      return next()
    }

    throw new HttpException({
      success: false,
      message: 'required sign!'
    }, 400)
  }
}
