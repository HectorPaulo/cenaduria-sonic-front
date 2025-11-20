import { Injectable } from '@angular/core';
import {
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpRequest,
  HttpResponse,
  HttpErrorResponse,
} from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable()
export class LoggingInterceptor implements HttpInterceptor {
  intercept(
    req: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    const authHeader = req.headers.get('Authorization') || '';
    const hasAuth = !!authHeader;
    const masked = hasAuth ? `${authHeader.slice(0, 20)}...` : 'none';
    try {
      console.log(
        `[LoggingInterceptor] -> ${req.method} ${req.urlWithParams} Authorization present: ${hasAuth}`,
        hasAuth ? masked : undefined
      );
    } catch (e) {
      // defensive: some header values may not be string-sliceable
      console.log(
        `[LoggingInterceptor] -> ${req.method} ${req.urlWithParams} Authorization present: ${hasAuth}`
      );
    }

    return next.handle(req).pipe(
      tap({
        next: (event) => {
          if (event instanceof HttpResponse) {
            console.log(
              `[LoggingInterceptor] <- ${req.method} ${req.urlWithParams} status=${event.status}`,
              event.body
            );
          }
        },
        error: (err) => {
          if (err instanceof HttpErrorResponse) {
            console.error(
              `[LoggingInterceptor] <- ${req.method} ${req.urlWithParams} ERROR status=${err.status}`,
              err.error || err.message
            );
          }
        },
      })
    );
  }
}
