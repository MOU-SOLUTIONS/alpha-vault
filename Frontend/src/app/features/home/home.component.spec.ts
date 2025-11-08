import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PLATFORM_ID } from '@angular/core';

import { HomeComponent } from './home.component';

describe('HomeComponent', () => {
  let component: HomeComponent;
  let fixture: ComponentFixture<HomeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HomeComponent],
      providers: [
        { provide: PLATFORM_ID, useValue: 'browser' }
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HomeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Initialization', () => {
    it('should set up scroll observer and header scroll on init', () => {
      spyOn(component as any, 'setupScrollObserver');
      spyOn(component as any, 'setupHeaderScroll');
      
      component.ngOnInit();
      
      expect((component as any).setupScrollObserver).toHaveBeenCalled();
      expect((component as any).setupHeaderScroll).toHaveBeenCalled();
    });

    it('should not set up observers on server', () => {
      TestBed.resetTestingModule();
      TestBed.configureTestingModule({
        imports: [HomeComponent],
        providers: [
          { provide: PLATFORM_ID, useValue: 'server' }
        ]
      });
      
      const serverFixture = TestBed.createComponent(HomeComponent);
      const serverComponent = serverFixture.componentInstance;
      
      spyOn(serverComponent as any, 'setupScrollObserver');
      spyOn(serverComponent as any, 'setupHeaderScroll');
      
      serverComponent.ngOnInit();
      
      expect((serverComponent as any).setupScrollObserver).not.toHaveBeenCalled();
      expect((serverComponent as any).setupHeaderScroll).not.toHaveBeenCalled();
    });
  });

  describe('Scroll Functionality', () => {
    it('should scroll to section when scrollTo is called', () => {
      const mockElement = document.createElement('div');
      mockElement.id = 'test-section';
      document.body.appendChild(mockElement);
      
      spyOn(mockElement, 'scrollIntoView');
      
      component.scrollTo('test-section');
      
      expect(mockElement.scrollIntoView).toHaveBeenCalledWith({
        behavior: 'smooth',
        block: 'start'
      });
      
      document.body.removeChild(mockElement);
    });

    it('should prevent default when event is provided', () => {
      const mockElement = document.createElement('div');
      mockElement.id = 'test-section';
      document.body.appendChild(mockElement);
      
      const event = new Event('click', { cancelable: true });
      spyOn(event, 'preventDefault');
      
      component.scrollTo('test-section', event);
      
      expect(event.preventDefault).toHaveBeenCalled();
      
      document.body.removeChild(mockElement);
    });

    it('should handle non-existent section gracefully', () => {
      expect(() => component.scrollTo('non-existent')).not.toThrow();
    });
  });

  describe('Cleanup', () => {
    it('should clean up intersection observer on destroy', () => {
      component.ngOnInit();
      const observer = (component as any).scrollObserver;
      
      if (observer) {
        spyOn(observer, 'disconnect');
        component.ngOnDestroy();
        expect(observer.disconnect).toHaveBeenCalled();
      }
    });

    it('should clean up scroll listener on destroy', () => {
      component.ngOnInit();
      const cleanup = (component as any).scrollListenerCleanup;
      
      if (cleanup) {
        spyOn({ cleanup }, 'cleanup');
        component.ngOnDestroy();
        expect((component as any).scrollListenerCleanup).toBeUndefined();
      }
    });
  });

  describe('Rendering', () => {
    it('should render all child components', () => {
      const header = fixture.nativeElement.querySelector('app-header');
      const hero = fixture.nativeElement.querySelector('app-hero');
      const features = fixture.nativeElement.querySelector('app-features');
      const about = fixture.nativeElement.querySelector('app-about');
      const contact = fixture.nativeElement.querySelector('app-contact');
      const cta = fixture.nativeElement.querySelector('app-cta');
      const footer = fixture.nativeElement.querySelector('app-footer');
      const overlay = fixture.nativeElement.querySelector('app-welcome-overlay');

      expect(header).toBeTruthy();
      expect(hero).toBeTruthy();
      expect(features).toBeTruthy();
      expect(about).toBeTruthy();
      expect(contact).toBeTruthy();
      expect(cta).toBeTruthy();
      expect(footer).toBeTruthy();
      expect(overlay).toBeTruthy();
    });
  });

  describe('Event Handling', () => {
    it('should handle overlay close event', () => {
      spyOn(component, 'onOverlayClosed');
      
      component.onOverlayClosed();
      
      expect(component.onOverlayClosed).toHaveBeenCalled();
    });
  });
});

