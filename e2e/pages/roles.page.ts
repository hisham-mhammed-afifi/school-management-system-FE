import { type Page, type Locator, expect } from '@playwright/test';
import { BasePage } from './base.page';

export class RolesPage extends BasePage {
  readonly path: string;

  readonly heading: Locator;
  readonly addButton: Locator;
  readonly searchInput: Locator;
  readonly roleCards: Locator;
  readonly noResults: Locator;
  readonly errorAlert: Locator;

  // Delete confirmation modal
  readonly deleteModal: Locator;
  readonly deleteConfirmButton: Locator;
  readonly deleteCancelButton: Locator;

  constructor(page: Page, schoolId = 'test-school-1') {
    super(page);
    this.path = `/schools/${schoolId}/roles`;

    this.heading = page.getByRole('heading', { name: /roles/i });
    this.addButton = page.getByRole('link', { name: /add/i });
    this.searchInput = page.locator('#role-search');
    this.roleCards = page.locator('.grid > div');
    this.noResults = page.getByText(/no results/i);
    this.errorAlert = page.getByRole('alert');

    this.deleteModal = page.getByRole('alertdialog');
    this.deleteConfirmButton = this.deleteModal.getByRole('button', { name: /delete/i });
    this.deleteCancelButton = this.deleteModal.getByRole('button', { name: /cancel/i });
  }

  getDeleteButton(roleName: string): Locator {
    const card = this.page.locator('.grid > div').filter({ hasText: roleName });
    return card.getByRole('button', { name: /delete/i });
  }

  async expectRoleCount(count: number): Promise<void> {
    await expect(this.roleCards).toHaveCount(count);
  }
}
