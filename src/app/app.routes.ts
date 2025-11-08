import { Routes } from '@angular/router';
import { authGuard, noAuthGuard } from '@core/guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    loadChildren: () => import('./pages/tabs/tabs.routes').then((m) => m.routes),
    canActivate: [authGuard],
  },
  {
    path: 'auth',
    loadComponent: () => import('./pages/auth/auth.page').then((m) => m.AuthPage),
    canActivate: [noAuthGuard],
  },
  {
    path: '**',
    redirectTo: '/tabs/tab1',
  },
];
