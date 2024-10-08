import { CanActivate, ExecutionContext, HttpException, Injectable } from '@nestjs/common';
import { Observable } from 'rxjs';

@Injectable()
export class FileGuard implements CanActivate {
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const ctx = context.switchToHttp();
    const req = ctx.getRequest();

    
    if (req.file)
      return true;

    throw new HttpException({
      success: false,
      message: 'file is required'
    }, 400);

  }
}
