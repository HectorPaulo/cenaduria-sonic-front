import { Injectable } from '@angular/core';
import {
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpRequest,
} from '@angular/common/http';
import { Observable, throwError, switchMap, catchError } from 'rxjs';
import { AuthService } from '../services/auth.service';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  constructor(private auth: AuthService) {}

  intercept(
    req: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    const token =
      (this.auth as any)?.getCurrentToken?.() ??
      localStorage.getItem('access_token');

    let outgoing = req;
    if (token) {
      outgoing = req.clone({
        setHeaders: { Authorization: `Bearer ${token}` },
      });
    }

    return next.handle(outgoing).pipe(
      catchError((err: any) => {
        if (err && err.status === 401) {
          return this.auth.refreshToken().pipe(
            switchMap((ok) => {
              if (ok) {
                const newToken = this.auth.getCurrentToken();
                const retryReq = req.clone({
                  setHeaders: { Authorization: `Bearer ${newToken}` },
                });
                return next.handle(retryReq);
              }
              return throwError(() => err);
            })
          );
        }
        return throwError(() => err);
      })
    );
  }
}
