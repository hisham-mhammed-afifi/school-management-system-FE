import { Routes } from '@angular/router';
import { authGuard } from '@core/guards/auth.guard';
import { guestGuard } from '@core/guards/guest.guard';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () => import('./features/auth/login/login').then((m) => m.LoginComponent),
    canActivate: [guestGuard],
  },
  {
    path: '',
    loadComponent: () => import('@shared/components/layout/layout').then((m) => m.LayoutComponent),
    canActivate: [authGuard],
    children: [
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./features/dashboard/dashboard').then((m) => m.DashboardComponent),
      },
      {
        path: 'users',
        children: [
          {
            path: '',
            loadComponent: () => import('./features/users/users').then((m) => m.UsersComponent),
          },
          {
            path: 'new',
            loadComponent: () =>
              import('./features/users/user-form/user-form').then((m) => m.UserFormComponent),
          },
          {
            path: ':id',
            loadComponent: () =>
              import('./features/users/user-detail/user-detail').then((m) => m.UserDetailComponent),
          },
          {
            path: ':id/edit',
            loadComponent: () =>
              import('./features/users/user-form/user-form').then((m) => m.UserFormComponent),
          },
        ],
      },
      {
        path: 'roles',
        children: [
          {
            path: '',
            loadComponent: () => import('./features/roles/roles').then((m) => m.RolesComponent),
          },
          {
            path: 'new',
            loadComponent: () =>
              import('./features/roles/role-form/role-form').then((m) => m.RoleFormComponent),
          },
          {
            path: ':id',
            loadComponent: () =>
              import('./features/roles/role-detail/role-detail').then((m) => m.RoleDetailComponent),
          },
          {
            path: ':id/edit',
            loadComponent: () =>
              import('./features/roles/role-form/role-form').then((m) => m.RoleFormComponent),
          },
        ],
      },
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
    ],
  },
  { path: '**', redirectTo: 'login' },
];
