import { CanActivate, ExecutionContext, HttpException, Injectable } from '@nestjs/common';
import { Observable } from 'rxjs';

@Injectable()
export class GlobalGuard implements CanActivate {
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {

    const ctx = context.switchToHttp();
    const request = ctx.getRequest();

    let body = request.body;
    let params = request.params;
    let query = request.query;

    throw new HttpException({
      success: false,
      message: 'data illegal'
    }, 400);

  }

  check(data: object) {
    if (!data)
      return true;

    let _this = this;
    Object.keys(data).forEach(function (key) {
      

    });

  }

  htmlEscape(text) {
    return text
      .replace(/&/g, '&amp;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  }
}
