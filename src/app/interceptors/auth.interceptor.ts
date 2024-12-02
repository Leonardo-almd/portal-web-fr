import { HttpInterceptorFn } from '@angular/common/http';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const accessToken = localStorage.getItem('access_token');
    if (accessToken) {
      const authReq = req.clone({
        setHeaders: { Authorization: `Bearer ${accessToken}` }
      });
      return next(authReq);
    } else {
      return next(req);
    }
};

