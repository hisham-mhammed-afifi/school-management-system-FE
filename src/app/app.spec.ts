import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideTranslateService } from '@ngx-translate/core';
import { App } from '@app/app';
import { TranslationService } from '@core/services/translation.service';

describe('App', () => {
  let originalMatchMedia: typeof window.matchMedia;

  beforeEach(async () => {
    localStorage.clear();
    document.documentElement.lang = '';
    document.documentElement.dir = '';
    document.documentElement.classList.remove('dark');

    originalMatchMedia = window.matchMedia;
    window.matchMedia = vi.fn().mockReturnValue({
      matches: false,
      media: '(prefers-color-scheme: dark)',
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    });

    await TestBed.configureTestingModule({
      imports: [App],
      providers: [provideRouter([]), provideTranslateService({ fallbackLang: 'en' })],
    }).compileComponents();
  });

  afterEach(() => {
    window.matchMedia = originalMatchMedia;
    localStorage.clear();
    document.documentElement.lang = '';
    document.documentElement.dir = '';
    document.documentElement.classList.remove('dark');
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  it('should render skip-to-main-content link', () => {
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();
    const skipLink = (fixture.nativeElement as HTMLElement).querySelector('.skip-link');
    expect(skipLink).toBeTruthy();
    expect(skipLink?.getAttribute('href')).toBe('#main-content');
  });

  it('should initialize translation service', () => {
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();
    expect(document.documentElement.lang).toBe('en');
    expect(document.documentElement.dir).toBe('ltr');
  });

  it('should bind dir attribute on root wrapper via CDK Dir directive', async () => {
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();
    await fixture.whenStable();

    const wrapper = (fixture.nativeElement as HTMLElement).querySelector('div');
    expect(wrapper?.getAttribute('dir')).toBe('ltr');
  });

  it('should update dir attribute when language switches to Arabic', async () => {
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();

    const translationService = TestBed.inject(TranslationService);
    translationService.switchLanguage('ar');
    fixture.detectChanges();
    await fixture.whenStable();

    const wrapper = (fixture.nativeElement as HTMLElement).querySelector('div');
    expect(wrapper?.getAttribute('dir')).toBe('rtl');
  });

  it('should render router-outlet', () => {
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelector('router-outlet')).toBeTruthy();
  });
});
