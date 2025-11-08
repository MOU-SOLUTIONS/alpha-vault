import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';

import { CtaComponent } from './cta.component';

describe('CtaComponent', () => {
  let component: CtaComponent;
  let fixture: ComponentFixture<CtaComponent>;
  let router: Router;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CtaComponent],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: {
            params: of({}),
            queryParams: of({}),
            snapshot: { params: {}, queryParams: {} }
          }
        }
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CtaComponent);
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
      const heading = fixture.nativeElement.querySelector('h2');
      const button = fixture.nativeElement.querySelector('button');

      expect(section.getAttribute('aria-labelledby')).toBe('cta-heading');
      expect(heading.getAttribute('id')).toBe('cta-heading');
      expect(button.getAttribute('aria-label')).toBe('Sign up for Alpha Vault');
    });

    it('should have accessible button with icon', () => {
      const icon = fixture.nativeElement.querySelector('i.fa-crown');
      expect(icon.getAttribute('aria-hidden')).toBe('true');
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
    it('should display the heading with gradient text', () => {
      const heading = fixture.nativeElement.querySelector('h2');
      expect(heading.textContent).toContain('Ready to Unlock Your');
      expect(heading.querySelector('.gradient-text')).toBeTruthy();
    });

    it('should display the call-to-action text', () => {
      const paragraph = fixture.nativeElement.querySelector('p');
      expect(paragraph.textContent).toContain('Join thousands of teens');
    });

    it('should display the button with correct text', () => {
      const button = fixture.nativeElement.querySelector('button');
      expect(button.textContent.trim()).toContain('Claim Your Power');
      expect(button.classList.contains('btn-primary')).toBe(true);
      expect(button.classList.contains('large')).toBe(true);
    });
  });
});
