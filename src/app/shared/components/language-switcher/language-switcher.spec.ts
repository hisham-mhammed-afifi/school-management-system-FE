import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideTranslateService } from '@ngx-translate/core';
import { LanguageSwitcherComponent } from './language-switcher';
import { TranslationService } from '@core/services/translation.service';

describe('LanguageSwitcherComponent', () => {
  let component: LanguageSwitcherComponent;
  let fixture: ComponentFixture<LanguageSwitcherComponent>;
  let translationService: TranslationService;

  beforeEach(async () => {
    localStorage.clear();
    document.documentElement.lang = '';
    document.documentElement.dir = '';

    await TestBed.configureTestingModule({
      imports: [LanguageSwitcherComponent],
      providers: [provideTranslateService({ fallbackLang: 'en' })],
    }).compileComponents();

    translationService = TestBed.inject(TranslationService);
    translationService.init();

    fixture = TestBed.createComponent(LanguageSwitcherComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => {
    localStorage.clear();
    document.documentElement.lang = '';
    document.documentElement.dir = '';
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should show "AR" when current language is English', () => {
    const button = fixture.nativeElement.querySelector('button') as HTMLButtonElement;
    expect(button.textContent?.trim()).toBe('AR');
  });

  it('should have aria-label "Switch to Arabic" when language is English', () => {
    const button = fixture.nativeElement.querySelector('button') as HTMLButtonElement;
    expect(button.getAttribute('aria-label')).toBe('Switch to Arabic');
  });

  it('should have aria-label "Switch to English" when language is Arabic', () => {
    translationService.switchLanguage('ar');
    fixture.detectChanges();

    const button = fixture.nativeElement.querySelector('button') as HTMLButtonElement;
    expect(button.getAttribute('aria-label')).toBe('Switch to English');
  });

  it('should show "EN" when current language is Arabic', () => {
    translationService.switchLanguage('ar');
    fixture.detectChanges();

    const button = fixture.nativeElement.querySelector('button') as HTMLButtonElement;
    expect(button.textContent?.trim()).toBe('EN');
  });

  it('should toggle from English to Arabic on click', () => {
    const switchSpy = vi.spyOn(translationService, 'switchLanguage');
    const button = fixture.nativeElement.querySelector('button') as HTMLButtonElement;
    button.click();

    expect(switchSpy).toHaveBeenCalledWith('ar');
  });

  it('should toggle from Arabic to English on click', () => {
    translationService.switchLanguage('ar');
    fixture.detectChanges();

    const switchSpy = vi.spyOn(translationService, 'switchLanguage');
    const button = fixture.nativeElement.querySelector('button') as HTMLButtonElement;
    button.click();

    expect(switchSpy).toHaveBeenCalledWith('en');
  });
});
