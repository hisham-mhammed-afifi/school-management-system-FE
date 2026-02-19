import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { IconComponent } from './icon';

@Component({
  selector: 'app-icon-test-host',
  standalone: true,
  imports: [IconComponent],
  template: `<fa-icon [icon]="iconName()" />`,
})
class TestHostComponent {
  iconName = signal('bars');
}

describe('IconComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestHostComponent],
    }).compileComponents();
  });

  it('should create', () => {
    const fixture = TestBed.createComponent(TestHostComponent);
    fixture.detectChanges();
    const icon = fixture.nativeElement.querySelector('fa-icon');
    expect(icon).toBeTruthy();
  });

  it('should render an SVG element for a known icon', () => {
    const fixture = TestBed.createComponent(TestHostComponent);
    fixture.detectChanges();
    const svg = fixture.nativeElement.querySelector('fa-icon svg');
    expect(svg).toBeTruthy();
    expect(svg.getAttribute('data-icon')).toBe('bars');
  });

  it('should render nothing for an unknown icon', () => {
    const fixture = TestBed.createComponent(TestHostComponent);
    fixture.componentInstance.iconName.set('nonexistent-icon');
    fixture.detectChanges();
    const svg = fixture.nativeElement.querySelector('fa-icon svg');
    expect(svg).toBeFalsy();
  });

  it('should update when icon input changes', () => {
    const fixture = TestBed.createComponent(TestHostComponent);
    fixture.detectChanges();

    let svg = fixture.nativeElement.querySelector('fa-icon svg');
    expect(svg.getAttribute('data-icon')).toBe('bars');

    fixture.componentInstance.iconName.set('xmark');
    fixture.detectChanges();

    svg = fixture.nativeElement.querySelector('fa-icon svg');
    expect(svg.getAttribute('data-icon')).toBe('xmark');
  });

  it('should add rtl-flip class for directional icons', () => {
    const fixture = TestBed.createComponent(TestHostComponent);
    fixture.componentInstance.iconName.set('arrow-left');
    fixture.detectChanges();

    const icon = fixture.nativeElement.querySelector('fa-icon') as HTMLElement;
    expect(icon.classList.contains('rtl-flip')).toBe(true);
  });

  it('should not add rtl-flip class for non-directional icons', () => {
    const fixture = TestBed.createComponent(TestHostComponent);
    fixture.detectChanges();

    const icon = fixture.nativeElement.querySelector('fa-icon') as HTMLElement;
    expect(icon.classList.contains('rtl-flip')).toBe(false);
  });
});
