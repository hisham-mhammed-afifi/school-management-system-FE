import { type Page, type Locator, expect } from '@playwright/test';
import { BasePage } from './base.page';

export class DashboardPage extends BasePage {
  readonly path: string;

  readonly heading: Locator;
  readonly sidebar: Locator;
  readonly logoutButton: Locator;

  // Overview stat cards
  readonly studentsCard: Locator;
  readonly teachersCard: Locator;
  readonly classesCard: Locator;
  readonly attendanceCard: Locator;

  // Fees summary
  readonly feesSummary: Locator;

  // Tables
  readonly attendanceTable: Locator;
  readonly activityFeed: Locator;

  // Super admin
  readonly platformOverview: Locator;

  constructor(page: Page, schoolId = ':schoolId') {
    super(page);
    this.path = `/schools/${schoolId}/dashboard`;

    this.heading = page.getByRole('heading', { name: 'Dashboard' });
    this.sidebar = page.getByRole('navigation', { name: 'Main navigation' });
    this.logoutButton = page.getByRole('button', { name: 'Logout' });

    this.studentsCard = page.getByText('Students').first();
    this.teachersCard = page.getByText('Teachers').first();
    this.classesCard = page.getByText('Classes').first();
    this.attendanceCard = page.getByText('Attendance Today').first();

    this.feesSummary = page.getByText('Fees Summary');
    this.attendanceTable = page.getByText('Attendance by Class');
    this.activityFeed = page.getByText('Recent Activity');

    this.platformOverview = page.getByText('Platform Overview');
  }

  async expectSchoolDashboard(): Promise<void> {
    await expect(this.heading).toBeVisible();
    await expect(this.sidebar).toBeVisible();
  }

  async expectPlatformDashboard(): Promise<void> {
    await expect(this.platformOverview).toBeVisible();
  }

  async expectSidebarVisible(): Promise<void> {
    await expect(this.sidebar).toBeVisible();
  }

  async navigateToSection(name: string): Promise<void> {
    await this.sidebar.getByRole('link', { name }).click();
  }

  async logout(): Promise<void> {
    await this.logoutButton.click();
  }
}
