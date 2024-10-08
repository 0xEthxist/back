import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import alchemyWeb3 from 'src/providers/alchemy-web3';
import * as jwt from 'jsonwebtoken';

@Injectable()
export class GetAddressOptionalMiddleware implements NestMiddleware {

  use(req: Request, res: Response, next: NextFunction) {
    var token = req.headers['sign'];

    if (!token)
      token = req.body.sign;

    if (!token)
      token = req.params.sign;

    if (token)
      var sign = jwt.verify(token.toString() , process.env.privateKeySIGN);

    if (sign) {
      let userAddress = alchemyWeb3.recovery(sign)
      if (!userAddress)
        return next()

      req['userAddress'] = userAddress;
      
      return next()
    }
    next();
  }
}
