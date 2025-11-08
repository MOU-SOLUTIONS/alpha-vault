import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { PLATFORM_ID } from '@angular/core';

import { ContactComponent } from './contact.component';

describe('ContactComponent', () => {
  let component: ContactComponent;
  let fixture: ComponentFixture<ContactComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ContactComponent, FormsModule],
      providers: [
        { provide: PLATFORM_ID, useValue: 'browser' }
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ContactComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Form Validation', () => {
    it('should validate form with all fields filled', () => {
      component.formData = {
        name: 'Test User',
        email: 'test@example.com',
        subject: 'Test Subject',
        message: 'Test message'
      };
      
      expect((component as any).validateForm()).toBe(true);
    });

    it('should invalidate form with missing fields', () => {
      component.formData = {
        name: '',
        email: 'test@example.com',
        subject: 'Test Subject',
        message: 'Test message'
      };
      
      expect((component as any).validateForm()).toBe(false);
    });
  });

  describe('Form Submission', () => {
    it('should prevent default and validate on submit', () => {
      const event = new Event('submit');
      spyOn(event, 'preventDefault');
      spyOn(component as any, 'validateForm').and.returnValue(false);
      
      component.onSubmit(event);
      
      expect(event.preventDefault).toHaveBeenCalled();
      expect(component.submitError).toBe('Please fill out all required fields');
    });

    it('should submit form when valid', (done) => {
      component.formData = {
        name: 'Test User',
        email: 'test@example.com',
        subject: 'Test Subject',
        message: 'Test message'
      };
      
      const event = new Event('submit');
      component.onSubmit(event);
      
      expect(component.isSubmitting).toBe(true);
      
      setTimeout(() => {
        expect(component.isSubmitting).toBe(false);
        expect(component.isSubmitted).toBe(true);
        done();
      }, 1600);
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA attributes on form inputs', () => {
      const nameInput = fixture.nativeElement.querySelector('#name');
      const emailInput = fixture.nativeElement.querySelector('#email');
      
      expect(nameInput.getAttribute('aria-required')).toBe('true');
      expect(emailInput.getAttribute('aria-required')).toBe('true');
    });

    it('should have aria-label on submit button', () => {
      const button = fixture.nativeElement.querySelector('button[type="submit"]');
      expect(button.getAttribute('aria-label')).toBe('Send message');
    });

    it('should have aria-hidden on decorative icons', () => {
      const icons = fixture.nativeElement.querySelectorAll('i[aria-hidden="true"]');
      expect(icons.length).toBeGreaterThan(0);
    });

    it('should have aria-live on success and error messages', () => {
      component.isSubmitted = true;
      fixture.detectChanges();
      
      const successMessage = fixture.nativeElement.querySelector('.form-success');
      expect(successMessage.getAttribute('aria-live')).toBe('polite');
      expect(successMessage.getAttribute('role')).toBe('alert');
    });
  });

  describe('Rendering', () => {
    it('should render contact section', () => {
      const section = fixture.nativeElement.querySelector('section.contact');
      expect(section).toBeTruthy();
      expect(section.getAttribute('id')).toBe('contact');
    });

    it('should render contact form', () => {
      const form = fixture.nativeElement.querySelector('form');
      expect(form).toBeTruthy();
    });

    it('should render contact information', () => {
      const infoItems = fixture.nativeElement.querySelectorAll('.info-item');
      expect(infoItems.length).toBe(3);
    });

    it('should render social links', () => {
      const socialIcons = fixture.nativeElement.querySelectorAll('.social-icon');
      expect(socialIcons.length).toBe(4);
    });
  });

  describe('Cleanup', () => {
    it('should clear timeout on destroy', () => {
      component.formData = {
        name: 'Test',
        email: 'test@test.com',
        subject: 'Test',
        message: 'Test'
      };
      
      component.onSubmit(new Event('submit'));
      const timeoutId = (component as any).timeoutId;
      
      spyOn(window, 'clearTimeout');
      component.ngOnDestroy();
      
      expect(window.clearTimeout).toHaveBeenCalledWith(timeoutId);
    });
  });

  describe('Email Link', () => {
    it('should have correct email address', () => {
      const emailLink = fixture.nativeElement.querySelector('a[href^="mailto:"]');
      expect(emailLink.getAttribute('href')).toBe('mailto:support@alphavault.com');
      expect(emailLink.textContent).toBe('support@alphavault.com');
    });
  });
});

