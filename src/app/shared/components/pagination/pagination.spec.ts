import { TestBed, ComponentFixture } from '@angular/core/testing';
import { provideTranslateService } from '@ngx-translate/core';
import { Component, viewChild } from '@angular/core';
import { PaginationComponent } from './pagination';

@Component({
  selector: 'app-test-host',
  imports: [PaginationComponent],
  template: `
    <app-pagination
      [page]="page"
      [limit]="limit"
      [total]="total"
      (pageChange)="onPageChange($event)"
    />
  `,
})
class TestHostComponent {
  page = 1;
  limit = 10;
  total = 50;
  lastPage = 0;
  pagination = viewChild(PaginationComponent);

  onPageChange(page: number): void {
    this.lastPage = page;
  }
}

describe('PaginationComponent', () => {
  let fixture: ComponentFixture<TestHostComponent>;
  let host: TestHostComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestHostComponent],
      providers: [provideTranslateService({ fallbackLang: 'en' })],
    }).compileComponents();

    fixture = TestBed.createComponent(TestHostComponent);
    host = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(host.pagination()).toBeTruthy();
  });

  it('should calculate total pages correctly', () => {
    expect(host.pagination()!.totalPages()).toBe(5);
  });

  it('should emit page change event', () => {
    host.pagination()!.goTo(3);
    expect(host.lastPage).toBe(3);
  });

  it('should not emit for invalid page numbers', () => {
    host.pagination()!.goTo(0);
    expect(host.lastPage).toBe(0);

    host.pagination()!.goTo(6);
    expect(host.lastPage).toBe(0);
  });

  it('should not render when total pages is 1', () => {
    host.total = 5;
    host.page = 1;
    host.limit = 10;
    fixture.changeDetectorRef.markForCheck();
    fixture.detectChanges();

    const nav = (fixture.nativeElement as HTMLElement).querySelector('nav');
    expect(nav).toBeNull();
  });

  it('should render when total pages > 1', () => {
    const nav = (fixture.nativeElement as HTMLElement).querySelector('nav');
    expect(nav).toBeTruthy();
  });
});
