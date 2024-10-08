import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const RequestObj = context.switchToHttp().getRequest();

    const now = Date.now();
    return next
      .handle()
      .pipe(
        tap(() => {
          const ResponseObj = context.switchToHttp().getResponse();
          const RequestObj = context.switchToHttp().getRequest();
        }),
      );
  }
}