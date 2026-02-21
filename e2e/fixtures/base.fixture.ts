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
import { ClassSectionsPage } from '../pages/class-sections.page';
import { SubjectsPage } from '../pages/subjects.page';
import { GradingScalesPage } from '../pages/grading-scales.page';
import { FeeStructuresPage } from '../pages/fee-structures.page';
import { FeeInvoicesPage } from '../pages/fee-invoices.page';
import { AttendancePage } from '../pages/attendance.page';
import { TimetablePage } from '../pages/timetable.page';
import { ReportCardsPage } from '../pages/report-cards.page';
import { ParentPortalPage } from '../pages/parent-portal.page';
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
  classSectionsPage: ClassSectionsPage;
  subjectsPage: SubjectsPage;
  gradingScalesPage: GradingScalesPage;
  feeStructuresPage: FeeStructuresPage;
  feeInvoicesPage: FeeInvoicesPage;
  attendancePage: AttendancePage;
  timetablePage: TimetablePage;
  reportCardsPage: ReportCardsPage;
  parentPortalPage: ParentPortalPage;
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
  classSectionsPage: async ({ page }, use) => {
    await use(new ClassSectionsPage(page));
  },
  subjectsPage: async ({ page }, use) => {
    await use(new SubjectsPage(page));
  },
  gradingScalesPage: async ({ page }, use) => {
    await use(new GradingScalesPage(page));
  },
  feeStructuresPage: async ({ page }, use) => {
    await use(new FeeStructuresPage(page));
  },
  feeInvoicesPage: async ({ page }, use) => {
    await use(new FeeInvoicesPage(page));
  },
  attendancePage: async ({ page }, use) => {
    await use(new AttendancePage(page));
  },
  timetablePage: async ({ page }, use) => {
    await use(new TimetablePage(page));
  },
  reportCardsPage: async ({ page }, use) => {
    await use(new ReportCardsPage(page));
  },
  parentPortalPage: async ({ page }, use) => {
    await use(new ParentPortalPage(page));
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
