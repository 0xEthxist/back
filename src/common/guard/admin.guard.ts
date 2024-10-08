import { CanActivate, ExecutionContext, HttpException, Injectable } from '@nestjs/common';
import { Observable } from 'rxjs';
import { recoverySign } from 'src/helper/recovery-sign';

@Injectable()
export class AdminGuard implements CanActivate {
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const ctx = context.switchToHttp();
    const token = ctx.getRequest().headers['sign'];
    const req = ctx.getRequest();

    // get publipkey user from clinet's token
    let userAddress: string = recoverySign(token, 'admin');

    if (userAddress.toLowerCase() == req.user.address.toLowerCase())
      return true;

    throw new HttpException({
      success: false,
      message: 'sign not validation for admin'
    }, 401);

  }
}
