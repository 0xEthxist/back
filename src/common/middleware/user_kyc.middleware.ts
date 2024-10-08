import { HttpException, Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import alchemyWeb3 from 'src/providers/alchemy-web3';

@Injectable()
export class UserKycMiddleware implements NestMiddleware {
  // constructor(private readonly userService: UserService) {}

  async use(req: Request, res: Response, next: NextFunction) {

    let body = req.body;

    if (body && body.sign) {
      // get addresss from sign
      let userAddress = alchemyWeb3.recovery(body.sign)
      // check address is kyc
      // let us : UserService = new UserService(User_kyc);
      // let user = await us.findOne({ address: userAddress });

      return next();
    }
    throw new HttpException({
      success: false,
      message: 'user not kyc'
    }, 401)
  }

}

