import { TestBed } from '@angular/core/testing';
import { provideTranslateService, TranslateService } from '@ngx-translate/core';
import { TranslationService } from './translation.service';

describe('TranslationService', () => {
  let service: TranslationService;
  let translateService: TranslateService;

  beforeEach(() => {
    localStorage.clear();
    document.documentElement.lang = '';
    document.documentElement.dir = '';

    TestBed.configureTestingModule({
      providers: [provideTranslateService({ fallbackLang: 'en' })],
    });

    service = TestBed.inject(TranslationService);
    translateService = TestBed.inject(TranslateService);
  });

  afterEach(() => {
    localStorage.clear();
    document.documentElement.lang = '';
    document.documentElement.dir = '';
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('init()', () => {
    it('should default to "en" when no saved preference exists', () => {
      service.init();
      expect(service.currentLang()).toBe('en');
      expect(document.documentElement.lang).toBe('en');
      expect(document.documentElement.dir).toBe('ltr');
    });

    it('should restore saved language from localStorage', () => {
      localStorage.setItem('app_lang', 'ar');
      service.init();
      expect(service.currentLang()).toBe('ar');
      expect(document.documentElement.lang).toBe('ar');
      expect(document.documentElement.dir).toBe('rtl');
    });

    it('should ignore invalid saved language and fall back to default', () => {
      localStorage.setItem('app_lang', 'fr');
      service.init();
      expect(service.currentLang()).toBe('en');
    });

    it('should fall back to browser language when no saved preference', () => {
      vi.spyOn(translateService, 'getBrowserLang').mockReturnValue('ar');
      service.init();
      expect(service.currentLang()).toBe('ar');
      expect(document.documentElement.dir).toBe('rtl');
    });

    it('should fall back to "en" when browser language is unsupported', () => {
      vi.spyOn(translateService, 'getBrowserLang').mockReturnValue('fr');
      service.init();
      expect(service.currentLang()).toBe('en');
    });
  });

  describe('switchLanguage()', () => {
    beforeEach(() => {
      service.init();
    });

    it('should switch to Arabic with RTL direction', () => {
      const useSpy = vi.spyOn(translateService, 'use');
      service.switchLanguage('ar');

      expect(useSpy).toHaveBeenCalledWith('ar');
      expect(service.currentLang()).toBe('ar');
      expect(localStorage.getItem('app_lang')).toBe('ar');
      expect(document.documentElement.dir).toBe('rtl');
      expect(document.documentElement.lang).toBe('ar');
    });

    it('should switch to English with LTR direction', () => {
      service.switchLanguage('ar');
      const useSpy = vi.spyOn(translateService, 'use');
      service.switchLanguage('en');

      expect(useSpy).toHaveBeenCalledWith('en');
      expect(service.currentLang()).toBe('en');
      expect(localStorage.getItem('app_lang')).toBe('en');
      expect(document.documentElement.dir).toBe('ltr');
      expect(document.documentElement.lang).toBe('en');
    });

    it('should persist language to localStorage', () => {
      service.switchLanguage('ar');
      expect(localStorage.getItem('app_lang')).toBe('ar');

      service.switchLanguage('en');
      expect(localStorage.getItem('app_lang')).toBe('en');
    });
  });

  describe('direction', () => {
    it('should return "ltr" for English', () => {
      service.init();
      expect(service.direction()).toBe('ltr');
    });

    it('should return "rtl" for Arabic', () => {
      service.init();
      service.switchLanguage('ar');
      expect(service.direction()).toBe('rtl');
    });

    it('should update reactively when language changes', () => {
      service.init();
      expect(service.direction()).toBe('ltr');
      service.switchLanguage('ar');
      expect(service.direction()).toBe('rtl');
      service.switchLanguage('en');
      expect(service.direction()).toBe('ltr');
    });
  });
});
