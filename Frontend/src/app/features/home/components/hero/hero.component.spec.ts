import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { PLATFORM_ID } from '@angular/core';

import { HeroComponent } from './hero.component';

describe('HeroComponent', () => {
  let component: HeroComponent;
  let fixture: ComponentFixture<HeroComponent>;
  let router: Router;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HeroComponent],
      providers: [
        { provide: PLATFORM_ID, useValue: 'browser' }
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HeroComponent);
    component = fixture.componentInstance;
    router = TestBed.inject(Router);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Accessibility', () => {
    it('should have proper ARIA attributes', () => {
      const section = fixture.nativeElement.querySelector('section');
      const button = fixture.nativeElement.querySelector('button');
      const stats = fixture.nativeElement.querySelector('.hero-stats');

      expect(section.getAttribute('aria-label')).toBe('Hero section');
      expect(button.getAttribute('aria-label')).toBe('Start your journey with Alpha Vault');
      expect(stats.getAttribute('aria-label')).toBe('Alpha Vault statistics');
    });

    it('should have aria-hidden on decorative icons', () => {
      const icons = fixture.nativeElement.querySelectorAll('i[aria-hidden="true"]');
      expect(icons.length).toBeGreaterThan(0);
      icons.forEach((icon: HTMLElement) => {
        expect(icon.getAttribute('aria-hidden')).toBe('true');
      });
    });
  });

  describe('Keyboard Navigation', () => {
    it('should navigate on Enter key press', () => {
      const button = fixture.nativeElement.querySelector('button');
      const navigateSpy = spyOn(component, 'navigateToAuth');
      
      const enterEvent = new KeyboardEvent('keydown', { key: 'Enter' });
      button.dispatchEvent(enterEvent);
      
      expect(navigateSpy).toHaveBeenCalled();
    });

    it('should navigate on Space key press and prevent default', () => {
      const button = fixture.nativeElement.querySelector('button');
      const navigateSpy = spyOn(component, 'navigateToAuth');
      
      const spaceEvent = new KeyboardEvent('keydown', { key: ' ', cancelable: true });
      button.dispatchEvent(spaceEvent);
      
      expect(navigateSpy).toHaveBeenCalled();
      expect(spaceEvent.defaultPrevented).toBe(true);
    });
  });

  describe('Navigation', () => {
    it('should navigate to auth route when navigateToAuth is called', () => {
      const routerSpy = spyOn(router, 'navigate');
      
      component.navigateToAuth();
      
      expect(routerSpy).toHaveBeenCalledWith(['/auth']);
    });
  });

  describe('Rendering', () => {
    it('should display the hero title', () => {
      const title = fixture.nativeElement.querySelector('.hero-title');
      expect(title.textContent).toContain('Your Financial');
      expect(title.textContent).toContain('Freedom');
    });

    it('should display the hero subtitle', () => {
      const subtitle = fixture.nativeElement.querySelector('.hero-subtitle');
      expect(subtitle.textContent).toContain('Take control of your money');
    });

    it('should display statistics', () => {
      const stats = fixture.nativeElement.querySelectorAll('.stat');
      expect(stats.length).toBe(3);
    });

    it('should display the call-to-action button', () => {
      const button = fixture.nativeElement.querySelector('button');
      expect(button.textContent.trim()).toContain('Start Your Journey');
      expect(button.classList.contains('btn-primary')).toBe(true);
    });
  });

  describe('Cleanup', () => {
    it('should clean up event listeners on destroy', () => {
      component.ngAfterViewInit();
      const listeners = (component as any).clickListeners;
      
      if (listeners.length > 0) {
        listeners.forEach((removeListener: () => void) => {
          spyOn({ removeListener }, 'removeListener');
        });
        
        component.ngOnDestroy();
        
        expect((component as any).clickListeners.length).toBe(0);
      }
    });

    it('should clear timeouts on destroy', () => {
      component.ngAfterViewInit();
      const timeouts = (component as any).timeouts;
      
      if (timeouts.length > 0) {
        spyOn(window, 'clearTimeout');
        component.ngOnDestroy();
        expect(window.clearTimeout).toHaveBeenCalledTimes(timeouts.length);
      }
    });
  });

  describe('SSR Compatibility', () => {
    it('should not set up animations on server', () => {
      TestBed.resetTestingModule();
      TestBed.configureTestingModule({
        imports: [HeroComponent],
        providers: [
          { provide: PLATFORM_ID, useValue: 'server' }
        ]
      });
      
      const serverFixture = TestBed.createComponent(HeroComponent);
      const serverComponent = serverFixture.componentInstance;
      
      spyOn(serverComponent as any, 'addRippleEffectToButtons');
      spyOn(serverComponent as any, 'initDeviceTurnOnAnimation');
      spyOn(serverComponent as any, 'triggerHeroAnimations');
      
      serverComponent.ngAfterViewInit();
      
      expect((serverComponent as any).addRippleEffectToButtons).not.toHaveBeenCalled();
      expect((serverComponent as any).initDeviceTurnOnAnimation).not.toHaveBeenCalled();
      expect((serverComponent as any).triggerHeroAnimations).not.toHaveBeenCalled();
    });
  });
});

