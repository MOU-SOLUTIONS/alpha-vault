import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PLATFORM_ID } from '@angular/core';

import { FeaturesComponent } from './features.component';

describe('FeaturesComponent', () => {
  let component: FeaturesComponent;
  let fixture: ComponentFixture<FeaturesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FeaturesComponent],
      providers: [
        { provide: PLATFORM_ID, useValue: 'browser' }
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FeaturesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Accessibility', () => {
    it('should have proper ARIA attributes', () => {
      const section = fixture.nativeElement.querySelector('section');
      const heading = fixture.nativeElement.querySelector('h2');
      
      expect(section.getAttribute('aria-labelledby')).toBe('features-heading');
      expect(heading.getAttribute('id')).toBe('features-heading');
    });

    it('should have aria-hidden on decorative icons', () => {
      const icons = fixture.nativeElement.querySelectorAll('.feature-icon');
      icons.forEach((icon: HTMLElement) => {
        expect(icon.getAttribute('aria-hidden')).toBe('true');
      });
    });

    it('should have semantic structure with headings', () => {
      const cards = fixture.nativeElement.querySelectorAll('.feature-card');
      cards.forEach((card: HTMLElement) => {
        const heading = card.querySelector('h3');
        expect(heading).toBeTruthy();
        expect(heading?.textContent).toBeTruthy();
      });
    });
  });

  describe('Intersection Observer', () => {
    it('should set up intersection observer after view init', () => {
      spyOn(component as any, 'setupIntersectionObserver');
      component.ngAfterViewInit();
      expect((component as any).setupIntersectionObserver).toHaveBeenCalled();
    });

    it('should clean up intersection observer on destroy', () => {
      component.ngAfterViewInit();
      const observer = (component as any).intersectionObserver;
      
      if (observer) {
        spyOn(observer, 'disconnect');
        component.ngOnDestroy();
        expect(observer.disconnect).toHaveBeenCalled();
      }
    });
  });

  describe('Rendering', () => {
    it('should display all feature cards', () => {
      const cards = fixture.nativeElement.querySelectorAll('.feature-card');
      expect(cards.length).toBe(6);
    });

    it('should display section heading', () => {
      const heading = fixture.nativeElement.querySelector('h2');
      expect(heading.textContent).toContain('Everything You Need to');
    });

    it('should display feature icons', () => {
      const icons = fixture.nativeElement.querySelectorAll('.feature-icon');
      expect(icons.length).toBe(6);
    });
  });

  describe('SSR Compatibility', () => {
    it('should not set up observer on server', () => {
      TestBed.resetTestingModule();
      TestBed.configureTestingModule({
        imports: [FeaturesComponent],
        providers: [
          { provide: PLATFORM_ID, useValue: 'server' }
        ]
      });
      
      const serverFixture = TestBed.createComponent(FeaturesComponent);
      const serverComponent = serverFixture.componentInstance;
      
      spyOn(serverComponent as any, 'setupIntersectionObserver');
      serverComponent.ngAfterViewInit();
      
      expect((serverComponent as any).setupIntersectionObserver).not.toHaveBeenCalled();
    });
  });
});
