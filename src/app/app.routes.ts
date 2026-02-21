import { Routes } from '@angular/router';
import { authGuard } from '@core/guards/auth.guard';
import { guestGuard } from '@core/guards/guest.guard';
import { schoolContextGuard } from '@core/guards/school-context.guard';
import { permissionGuard } from '@core/guards/permission.guard';

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
            canActivate: [permissionGuard('dashboard.read')],
            loadComponent: () =>
              import('./features/dashboard/dashboard').then((m) => m.DashboardComponent),
          },
          {
            path: 'users',
            canActivate: [permissionGuard('users.list')],
            children: [
              {
                path: '',
                loadComponent: () => import('./features/users/users').then((m) => m.UsersComponent),
              },
              {
                path: 'new',
                canActivate: [permissionGuard('users.create')],
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
                canActivate: [permissionGuard('users.update')],
                loadComponent: () =>
                  import('./features/users/user-form/user-form').then((m) => m.UserFormComponent),
              },
            ],
          },
          {
            path: 'students',
            canActivate: [permissionGuard('students.list')],
            children: [
              {
                path: '',
                loadComponent: () =>
                  import('./features/students/students').then((m) => m.StudentsComponent),
              },
              {
                path: 'new',
                canActivate: [permissionGuard('students.create')],
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
                canActivate: [permissionGuard('students.update')],
                loadComponent: () =>
                  import('./features/students/student-form/student-form').then(
                    (m) => m.StudentFormComponent,
                  ),
              },
            ],
          },
          {
            path: 'teachers',
            canActivate: [permissionGuard('teachers.list')],
            children: [
              {
                path: '',
                loadComponent: () =>
                  import('./features/teachers/teachers').then((m) => m.TeachersComponent),
              },
              {
                path: 'new',
                canActivate: [permissionGuard('teachers.create')],
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
                canActivate: [permissionGuard('teachers.update')],
                loadComponent: () =>
                  import('./features/teachers/teacher-form/teacher-form').then(
                    (m) => m.TeacherFormComponent,
                  ),
              },
            ],
          },
          {
            path: 'class-sections',
            canActivate: [permissionGuard('class-sections.list')],
            children: [
              {
                path: '',
                loadComponent: () =>
                  import('./features/class-sections/class-sections').then(
                    (m) => m.ClassSectionsComponent,
                  ),
              },
              {
                path: 'new',
                canActivate: [permissionGuard('class-sections.create')],
                loadComponent: () =>
                  import('./features/class-sections/class-section-form/class-section-form').then(
                    (m) => m.ClassSectionFormComponent,
                  ),
              },
              {
                path: ':id',
                loadComponent: () =>
                  import('./features/class-sections/class-section-detail/class-section-detail').then(
                    (m) => m.ClassSectionDetailComponent,
                  ),
              },
              {
                path: ':id/edit',
                canActivate: [permissionGuard('class-sections.update')],
                loadComponent: () =>
                  import('./features/class-sections/class-section-form/class-section-form').then(
                    (m) => m.ClassSectionFormComponent,
                  ),
              },
            ],
          },
          {
            path: 'subjects',
            canActivate: [permissionGuard('subjects.list')],
            children: [
              {
                path: '',
                loadComponent: () =>
                  import('./features/subjects/subjects').then((m) => m.SubjectsComponent),
              },
              {
                path: 'new',
                canActivate: [permissionGuard('subjects.create')],
                loadComponent: () =>
                  import('./features/subjects/subject-form/subject-form').then(
                    (m) => m.SubjectFormComponent,
                  ),
              },
              {
                path: ':id',
                loadComponent: () =>
                  import('./features/subjects/subject-detail/subject-detail').then(
                    (m) => m.SubjectDetailComponent,
                  ),
              },
              {
                path: ':id/edit',
                canActivate: [permissionGuard('subjects.update')],
                loadComponent: () =>
                  import('./features/subjects/subject-form/subject-form').then(
                    (m) => m.SubjectFormComponent,
                  ),
              },
            ],
          },
          {
            path: 'timetable',
            canActivate: [permissionGuard('lessons.list')],
            loadComponent: () =>
              import('./features/timetable/timetable').then((m) => m.TimetableComponent),
          },
          {
            path: 'attendance',
            canActivate: [permissionGuard('student-attendance.list')],
            loadComponent: () =>
              import('./features/attendance/attendance').then((m) => m.AttendanceComponent),
          },
          {
            path: 'grading-scales',
            canActivate: [permissionGuard('grading-scales.list')],
            children: [
              {
                path: '',
                loadComponent: () =>
                  import('./features/grading-scales/grading-scales').then(
                    (m) => m.GradingScalesComponent,
                  ),
              },
              {
                path: 'new',
                canActivate: [permissionGuard('grading-scales.create')],
                loadComponent: () =>
                  import('./features/grading-scales/grading-scale-form/grading-scale-form').then(
                    (m) => m.GradingScaleFormComponent,
                  ),
              },
              {
                path: ':id',
                loadComponent: () =>
                  import('./features/grading-scales/grading-scale-detail/grading-scale-detail').then(
                    (m) => m.GradingScaleDetailComponent,
                  ),
              },
              {
                path: ':id/edit',
                canActivate: [permissionGuard('grading-scales.update')],
                loadComponent: () =>
                  import('./features/grading-scales/grading-scale-form/grading-scale-form').then(
                    (m) => m.GradingScaleFormComponent,
                  ),
              },
            ],
          },
          {
            path: 'exams',
            canActivate: [permissionGuard('exams.list')],
            children: [
              {
                path: '',
                loadComponent: () => import('./features/exams/exams').then((m) => m.ExamsComponent),
              },
              {
                path: 'new',
                canActivate: [permissionGuard('exams.create')],
                loadComponent: () =>
                  import('./features/exams/exam-form/exam-form').then((m) => m.ExamFormComponent),
              },
              {
                path: ':id',
                loadComponent: () =>
                  import('./features/exams/exam-detail/exam-detail').then(
                    (m) => m.ExamDetailComponent,
                  ),
              },
              {
                path: ':id/edit',
                canActivate: [permissionGuard('exams.update')],
                loadComponent: () =>
                  import('./features/exams/exam-form/exam-form').then((m) => m.ExamFormComponent),
              },
            ],
          },
          {
            path: 'grade-entry',
            canActivate: [permissionGuard('student-grades.list')],
            loadComponent: () =>
              import('./features/grade-entry/grade-entry').then((m) => m.GradeEntryComponent),
          },
          {
            path: 'report-cards',
            canActivate: [permissionGuard('report-cards.list')],
            children: [
              {
                path: '',
                loadComponent: () =>
                  import('./features/report-cards/report-cards').then(
                    (m) => m.ReportCardsComponent,
                  ),
              },
              {
                path: ':id',
                loadComponent: () =>
                  import('./features/report-cards/report-card-detail/report-card-detail').then(
                    (m) => m.ReportCardDetailComponent,
                  ),
              },
            ],
          },
          {
            path: 'fee-structures',
            canActivate: [permissionGuard('fee-structures.list')],
            children: [
              {
                path: '',
                loadComponent: () =>
                  import('./features/fee-structures/fee-structures').then(
                    (m) => m.FeeStructuresComponent,
                  ),
              },
              {
                path: 'new',
                canActivate: [permissionGuard('fee-structures.create')],
                loadComponent: () =>
                  import('./features/fee-structures/fee-structure-form/fee-structure-form').then(
                    (m) => m.FeeStructureFormComponent,
                  ),
              },
              {
                path: ':id',
                loadComponent: () =>
                  import('./features/fee-structures/fee-structure-detail/fee-structure-detail').then(
                    (m) => m.FeeStructureDetailComponent,
                  ),
              },
              {
                path: ':id/edit',
                canActivate: [permissionGuard('fee-structures.update')],
                loadComponent: () =>
                  import('./features/fee-structures/fee-structure-form/fee-structure-form').then(
                    (m) => m.FeeStructureFormComponent,
                  ),
              },
            ],
          },
          {
            path: 'fee-invoices',
            canActivate: [permissionGuard('fee-invoices.list')],
            children: [
              {
                path: '',
                loadComponent: () =>
                  import('./features/fee-invoices/fee-invoices').then(
                    (m) => m.FeeInvoicesComponent,
                  ),
              },
              {
                path: 'new',
                canActivate: [permissionGuard('fee-invoices.create')],
                loadComponent: () =>
                  import('./features/fee-invoices/fee-invoice-form/fee-invoice-form').then(
                    (m) => m.FeeInvoiceFormComponent,
                  ),
              },
              {
                path: ':id',
                loadComponent: () =>
                  import('./features/fee-invoices/fee-invoice-detail/fee-invoice-detail').then(
                    (m) => m.FeeInvoiceDetailComponent,
                  ),
              },
            ],
          },
          {
            path: 'notifications',
            children: [
              {
                path: '',
                loadComponent: () =>
                  import('./features/notifications/notifications').then(
                    (m) => m.NotificationsComponent,
                  ),
              },
              {
                path: 'send',
                canActivate: [permissionGuard('notifications.create')],
                loadComponent: () =>
                  import('./features/notifications/send-notification/send-notification').then(
                    (m) => m.SendNotificationComponent,
                  ),
              },
            ],
          },
          {
            path: 'parent-portal',
            children: [
              {
                path: '',
                loadComponent: () =>
                  import('./features/parent-portal/parent-portal').then(
                    (m) => m.ParentPortalComponent,
                  ),
              },
              {
                path: ':studentId/grades',
                loadComponent: () =>
                  import('./features/parent-portal/child-grades/child-grades').then(
                    (m) => m.ChildGradesComponent,
                  ),
              },
              {
                path: ':studentId/attendance',
                loadComponent: () =>
                  import('./features/parent-portal/child-attendance/child-attendance').then(
                    (m) => m.ChildAttendanceComponent,
                  ),
              },
              {
                path: ':studentId/report-cards',
                loadComponent: () =>
                  import('./features/parent-portal/child-report-cards/child-report-cards').then(
                    (m) => m.ChildReportCardsComponent,
                  ),
              },
              {
                path: ':studentId/invoices',
                loadComponent: () =>
                  import('./features/parent-portal/child-invoices/child-invoices').then(
                    (m) => m.ChildInvoicesComponent,
                  ),
              },
            ],
          },
          {
            path: 'roles',
            canActivate: [permissionGuard('roles.list')],
            children: [
              {
                path: '',
                loadComponent: () => import('./features/roles/roles').then((m) => m.RolesComponent),
              },
              {
                path: 'new',
                canActivate: [permissionGuard('roles.create')],
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
                canActivate: [permissionGuard('roles.update')],
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
