import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ThemeToggleComponent } from './theme-toggle';
import { ThemeService } from '@core/services/theme.service';

describe('ThemeToggleComponent', () => {
  let component: ThemeToggleComponent;
  let fixture: ComponentFixture<ThemeToggleComponent>;
  let themeService: ThemeService;
  let originalMatchMedia: typeof window.matchMedia;

  beforeEach(async () => {
    localStorage.clear();
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
      imports: [ThemeToggleComponent],
    }).compileComponents();

    themeService = TestBed.inject(ThemeService);
    fixture = TestBed.createComponent(ThemeToggleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => {
    window.matchMedia = originalMatchMedia;
    localStorage.clear();
    document.documentElement.classList.remove('dark');
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render three options', () => {
    const buttons = fixture.nativeElement.querySelectorAll('button');
    expect(buttons.length).toBe(3);
  });

  it('should have radiogroup role with aria-label', () => {
    const group = fixture.nativeElement.querySelector('[role="radiogroup"]');
    expect(group).toBeTruthy();
    expect(group.getAttribute('aria-label')).toBe('Theme');
  });

  it('should mark buttons with role="radio" and aria-checked', () => {
    const buttons = fixture.nativeElement.querySelectorAll('button[role="radio"]');
    expect(buttons.length).toBe(3);

    // Default is "system", so the second button should be checked
    expect(buttons[1].getAttribute('aria-checked')).toBe('true');
    expect(buttons[0].getAttribute('aria-checked')).toBe('false');
    expect(buttons[2].getAttribute('aria-checked')).toBe('false');
  });

  it('should highlight the active theme', () => {
    fixture.detectChanges();
    const buttons = fixture.nativeElement.querySelectorAll('button[role="radio"]');
    // "system" is active (index 1) - should have bg-accent class
    expect(buttons[1].classList.contains('bg-accent')).toBe(true);
  });

  it('should call setTheme("light") when clicking light option', () => {
    const spy = vi.spyOn(themeService, 'setTheme');
    const buttons = fixture.nativeElement.querySelectorAll('button');
    buttons[0].click();
    expect(spy).toHaveBeenCalledWith('light');
  });

  it('should call setTheme("system") when clicking system option', () => {
    const spy = vi.spyOn(themeService, 'setTheme');
    const buttons = fixture.nativeElement.querySelectorAll('button');
    buttons[1].click();
    expect(spy).toHaveBeenCalledWith('system');
  });

  it('should call setTheme("dark") when clicking dark option', () => {
    const spy = vi.spyOn(themeService, 'setTheme');
    const buttons = fixture.nativeElement.querySelectorAll('button');
    buttons[2].click();
    expect(spy).toHaveBeenCalledWith('dark');
  });
});
