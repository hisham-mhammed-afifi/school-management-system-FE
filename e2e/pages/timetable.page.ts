import { type Page, type Locator } from '@playwright/test';
import { BasePage } from './base.page';

export class TimetablePage extends BasePage {
  readonly path: string;

  readonly heading: Locator;
  readonly yearSelect: Locator;
  readonly termSelect: Locator;
  readonly periodSetSelect: Locator;
  readonly classTab: Locator;
  readonly teacherTab: Locator;
  readonly roomTab: Locator;
  readonly entitySelect: Locator;
  readonly timetableGrid: Locator;
  readonly errorAlert: Locator;

  constructor(page: Page, schoolId = 'test-school-1') {
    super(page);
    this.path = `/schools/${schoolId}/timetable`;

    this.heading = page.getByRole('heading', { name: /timetable/i });
    this.yearSelect = page.locator('#year-select');
    this.termSelect = page.locator('#term-select');
    this.periodSetSelect = page.locator('#period-set-select');
    this.classTab = page.getByRole('tab', { name: /class/i });
    this.teacherTab = page.getByRole('tab', { name: /teacher/i });
    this.roomTab = page.getByRole('tab', { name: /room/i });
    this.entitySelect = page.locator('#entity-select');
    this.timetableGrid = page.locator('table');
    this.errorAlert = page.getByRole('alert');
  }
}
