import { inject } from '@angular/core';
import { Router, CanActivateFn, RouterStateSnapshot, ActivatedRouteSnapshot } from '@angular/router';
import { AuthService } from '@core/services/auth.service';
import { of, combineLatest } from 'rxjs';
import { map, filter, take, catchError } from 'rxjs/operators';

export const authGuard: CanActivateFn = (
  _route: ActivatedRouteSnapshot,
  state: RouterStateSnapshot
) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  return combineLatest([
    authService.authStateInitialized$,
    authService.user$
  ]).pipe(
    filter(([initialized]) => initialized),
    take(1),
    map(([, user]) => user),
    catchError(() => {
      router.navigate(['/auth'], { queryParams: { returnUrl: state.url } });
      return of(false);
    }),
    map((user) => {
      if (user) {
        return true;
      } else {
        router.navigate(['/auth'], { queryParams: { returnUrl: state.url } });
        return false;
      }
    })
  );
};

export const noAuthGuard: CanActivateFn = (
  _route: ActivatedRouteSnapshot,
  _state: RouterStateSnapshot
) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  return combineLatest([
    authService.authStateInitialized$,
    authService.user$
  ]).pipe(
    filter(([initialized]) => initialized),
    take(1),
    map(([, user]) => user),
    catchError(() => {
      return of(true);
    }),
    map((user) => {
      if (!user) {
        return true;
      } else {
        router.navigate(['/tabs/tab1']);
        return false;
      }
    })
  );
};

