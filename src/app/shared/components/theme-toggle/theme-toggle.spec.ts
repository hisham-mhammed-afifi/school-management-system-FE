import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ThemeToggleComponent } from './theme-toggle';
import { ThemeService } from '@core/services/theme.service';

describe('ThemeToggleComponent', () => {
  let component: ThemeToggleComponent;
  let fixture: ComponentFixture<ThemeToggleComponent>;
  let themeService: ThemeService;

  beforeEach(async () => {
    localStorage.clear();
    document.documentElement.classList.remove('dark');

    await TestBed.configureTestingModule({
      imports: [ThemeToggleComponent],
    }).compileComponents();

    themeService = TestBed.inject(ThemeService);
    fixture = TestBed.createComponent(ThemeToggleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => {
    localStorage.clear();
    document.documentElement.classList.remove('dark');
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render a single toggle button', () => {
    const buttons = fixture.nativeElement.querySelectorAll('button');
    expect(buttons.length).toBe(1);
  });

  it('should have switch role with aria-label', () => {
    const button = fixture.nativeElement.querySelector('button[role="switch"]');
    expect(button).toBeTruthy();
    expect(button.getAttribute('aria-label')).toBe('Dark mode');
  });

  it('should show light_mode icon when theme is light', () => {
    const icon = fixture.nativeElement.querySelector('.material-icons');
    expect(icon.textContent.trim()).toBe('light_mode');
  });

  it('should show dark_mode icon when theme is dark', () => {
    themeService.setTheme('dark');
    fixture.detectChanges();
    const icon = fixture.nativeElement.querySelector('.material-icons');
    expect(icon.textContent.trim()).toBe('dark_mode');
  });

  it('should have aria-checked="false" when theme is light', () => {
    const button = fixture.nativeElement.querySelector('button');
    expect(button.getAttribute('aria-checked')).toBe('false');
  });

  it('should have aria-checked="true" when theme is dark', () => {
    themeService.setTheme('dark');
    fixture.detectChanges();
    const button = fixture.nativeElement.querySelector('button');
    expect(button.getAttribute('aria-checked')).toBe('true');
  });

  it('should call toggle() when clicked', () => {
    const spy = vi.spyOn(themeService, 'toggle');
    const button = fixture.nativeElement.querySelector('button');
    button.click();
    expect(spy).toHaveBeenCalled();
  });
});
