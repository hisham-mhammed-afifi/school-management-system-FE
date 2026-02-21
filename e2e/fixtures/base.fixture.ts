import { test as base } from '@playwright/test';
import { LoginPage } from '../pages/login.page';
import { DashboardPage } from '../pages/dashboard.page';
import { SchoolPickerPage } from '../pages/school-picker.page';
import { StudentsPage } from '../pages/students.page';
import { StudentFormPage } from '../pages/student-form.page';
import { RolesPage } from '../pages/roles.page';
import { UsersPage } from '../pages/users.page';
import { TeachersPage } from '../pages/teachers.page';
import { ExamsPage } from '../pages/exams.page';
import { AuthHelper } from '../helpers/auth.helper';
import { ApiMockHelper } from '../helpers/api-mock.helper';

interface AppFixtures {
  loginPage: LoginPage;
  dashboardPage: DashboardPage;
  schoolPickerPage: SchoolPickerPage;
  studentsPage: StudentsPage;
  studentFormPage: StudentFormPage;
  rolesPage: RolesPage;
  usersPage: UsersPage;
  teachersPage: TeachersPage;
  examsPage: ExamsPage;
  authHelper: AuthHelper;
  apiMock: ApiMockHelper;
}

export const test = base.extend<AppFixtures>({
  loginPage: async ({ page }, use) => {
    await use(new LoginPage(page));
  },
  dashboardPage: async ({ page }, use) => {
    await use(new DashboardPage(page));
  },
  schoolPickerPage: async ({ page }, use) => {
    await use(new SchoolPickerPage(page));
  },
  studentsPage: async ({ page }, use) => {
    await use(new StudentsPage(page));
  },
  studentFormPage: async ({ page }, use) => {
    await use(new StudentFormPage(page));
  },
  rolesPage: async ({ page }, use) => {
    await use(new RolesPage(page));
  },
  usersPage: async ({ page }, use) => {
    await use(new UsersPage(page));
  },
  teachersPage: async ({ page }, use) => {
    await use(new TeachersPage(page));
  },
  examsPage: async ({ page }, use) => {
    await use(new ExamsPage(page));
  },
  authHelper: async ({ page }, use) => {
    await use(new AuthHelper(page));
  },
  apiMock: async ({ page }, use) => {
    const mock = new ApiMockHelper(page);
    await use(mock);
    await mock.clearAll();
  },
});

export { expect } from '@playwright/test';
