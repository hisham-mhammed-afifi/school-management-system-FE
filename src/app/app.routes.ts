import { Routes } from '@angular/router';
import { authGuard } from '@core/guards/auth.guard';
import { guestGuard } from '@core/guards/guest.guard';
import { schoolContextGuard } from '@core/guards/school-context.guard';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () => import('./features/auth/login/login').then((m) => m.LoginComponent),
    canActivate: [guestGuard],
  },
  {
    path: 'schools',
    canActivate: [authGuard],
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./features/school-picker/school-picker').then((m) => m.SchoolPickerComponent),
      },
      {
        path: ':schoolId',
        loadComponent: () =>
          import('@shared/components/layout/layout').then((m) => m.LayoutComponent),
        canActivate: [schoolContextGuard],
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
                  import('./features/users/user-detail/user-detail').then(
                    (m) => m.UserDetailComponent,
                  ),
              },
              {
                path: ':id/edit',
                loadComponent: () =>
                  import('./features/users/user-form/user-form').then((m) => m.UserFormComponent),
              },
            ],
          },
          {
            path: 'students',
            children: [
              {
                path: '',
                loadComponent: () =>
                  import('./features/students/students').then((m) => m.StudentsComponent),
              },
              {
                path: 'new',
                loadComponent: () =>
                  import('./features/students/student-form/student-form').then(
                    (m) => m.StudentFormComponent,
                  ),
              },
              {
                path: ':id',
                loadComponent: () =>
                  import('./features/students/student-detail/student-detail').then(
                    (m) => m.StudentDetailComponent,
                  ),
              },
              {
                path: ':id/edit',
                loadComponent: () =>
                  import('./features/students/student-form/student-form').then(
                    (m) => m.StudentFormComponent,
                  ),
              },
            ],
          },
          {
            path: 'teachers',
            children: [
              {
                path: '',
                loadComponent: () =>
                  import('./features/teachers/teachers').then((m) => m.TeachersComponent),
              },
              {
                path: 'new',
                loadComponent: () =>
                  import('./features/teachers/teacher-form/teacher-form').then(
                    (m) => m.TeacherFormComponent,
                  ),
              },
              {
                path: ':id',
                loadComponent: () =>
                  import('./features/teachers/teacher-detail/teacher-detail').then(
                    (m) => m.TeacherDetailComponent,
                  ),
              },
              {
                path: ':id/edit',
                loadComponent: () =>
                  import('./features/teachers/teacher-form/teacher-form').then(
                    (m) => m.TeacherFormComponent,
                  ),
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
                  import('./features/roles/role-detail/role-detail').then(
                    (m) => m.RoleDetailComponent,
                  ),
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
    ],
  },
  { path: '', redirectTo: 'schools', pathMatch: 'full' },
  { path: '**', redirectTo: 'login' },
];
