import { TestBed, ComponentFixture } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter, Router } from '@angular/router';
import { provideTranslateService } from '@ngx-translate/core';
import { GradingScaleFormComponent } from './grading-scale-form';

describe('GradingScaleFormComponent', () => {
  let fixture: ComponentFixture<GradingScaleFormComponent>;
  let component: GradingScaleFormComponent;
  let httpTesting: HttpTestingController;
  let router: Router;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GradingScaleFormComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([{ path: 'schools/:schoolId', children: [{ path: '**', children: [] }] }]),
        provideTranslateService({ fallbackLang: 'en' }),
      ],
    }).compileComponents();

    httpTesting = TestBed.inject(HttpTestingController);
    router = TestBed.inject(Router);
    await router.navigateByUrl('/schools/test-school/grading-scales/new');
    fixture = TestBed.createComponent(GradingScaleFormComponent);
    component = fixture.componentInstance;
  });

  afterEach(() => {
    httpTesting.verify();
  });

  it('should create in add mode', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
    expect(component.isEdit()).toBe(false);
    expect(component.levels.length).toBe(1);
  });

  it('should add and remove levels', () => {
    fixture.detectChanges();

    component.addLevel();
    expect(component.levels.length).toBe(2);

    component.removeLevel(0);
    expect(component.levels.length).toBe(1);
  });

  it('should not submit invalid form', () => {
    fixture.detectChanges();

    component.onSubmit();

    expect(component.saving()).toBe(false);
    httpTesting.expectNone('/api/v1/grading-scales');
  });

  it('should submit valid form for creation', () => {
    fixture.detectChanges();
    const navigateSpy = vi.spyOn(router, 'navigate').mockReturnValue(Promise.resolve(true));

    component.form.patchValue({ name: 'Test Scale' });
    component.levels.at(0).patchValue({ letter: 'A', minScore: 90, maxScore: 100 });

    component.onSubmit();

    const req = httpTesting.expectOne('/api/v1/grading-scales');
    expect(req.request.method).toBe('POST');
    expect(req.request.body.name).toBe('Test Scale');
    expect(req.request.body.levels[0].letter).toBe('A');
    req.flush({ success: true, data: { id: 'gs-new' } });

    expect(navigateSpy).toHaveBeenCalledWith([
      '/schools',
      'test-school',
      'grading-scales',
      'gs-new',
    ]);
  });
});
