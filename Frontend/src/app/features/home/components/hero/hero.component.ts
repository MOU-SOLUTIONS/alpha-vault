import { 
  AfterViewInit, 
  ChangeDetectionStrategy,
  Component, 
  ElementRef, 
  inject,
  OnDestroy,
  PLATFORM_ID,
  Renderer2,
  ViewChild 
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Router, RouterLink } from '@angular/router';

/**
 * Hero component for the home page
 * Displays the main hero section with animated device mockup
 * 
 * @component
 * @standalone
 */
@Component({
  selector: 'app-hero',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './hero.component.html',
  styleUrls: ['./hero.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HeroComponent implements AfterViewInit, OnDestroy {
  // Inputs / Outputs
  // None currently
  
  // Public properties
  @ViewChild('heroSection') public heroSection!: ElementRef;
  
  // Private properties
  private readonly renderer = inject(Renderer2);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly isBrowser = isPlatformBrowser(this.platformId);
  private readonly router = inject(Router);
  private clickListeners: Array<() => void> = [];
  private timeouts: Array<number> = [];
  
  /**
   * Lifecycle hook that is called after the view has been initialized
   * Initializes animations and effects
   */
  public ngAfterViewInit(): void {
    if (!this.isBrowser) return;
    this.addRippleEffectToButtons();
    this.initDeviceTurnOnAnimation();
    this.triggerHeroAnimations();
  }

  /**
   * Cleanup event listeners and timeouts on component destruction
   */
  public ngOnDestroy(): void {
    // Remove all event listeners
    this.clickListeners.forEach(removeListener => removeListener());
    this.clickListeners = [];
    
    // Clear all timeouts
    this.timeouts.forEach(timeoutId => clearTimeout(timeoutId));
    this.timeouts = [];
  }

  /**
   * Navigates to the authentication page
   * Used for keyboard navigation support
   */
  public navigateToAuth(): void {
    this.router.navigate(['/auth']);
  }
  
  /**
   * Adds ripple effect to primary buttons
   * Creates and animates a ripple element on click
   */
  private addRippleEffectToButtons(): void {
    if (!this.isBrowser || !this.heroSection?.nativeElement) return;
    
    const buttons = this.heroSection.nativeElement.querySelectorAll('.btn-primary');
    
    buttons.forEach((button: HTMLElement) => {
      const removeListener = this.renderer.listen(button, 'click', (event: MouseEvent) => {
        const ripple = this.renderer.createElement('span');
        this.renderer.addClass(ripple, 'ripple');
        this.renderer.appendChild(button, ripple);
        
        const rect = button.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;
        
        this.renderer.setStyle(ripple, 'left', `${x}px`);
        this.renderer.setStyle(ripple, 'top', `${y}px`);
        
        const timeoutId = window.setTimeout(() => {
          this.renderer.removeChild(button, ripple);
        }, 600);
        this.timeouts.push(timeoutId);
      });
      this.clickListeners.push(removeListener);
    });
  }

  /**
   * Initializes the device turn-on animation sequence
   * Adds classes to trigger power button glow and screen activation
   */
  private initDeviceTurnOnAnimation(): void {
    if (!this.isBrowser || !this.heroSection?.nativeElement) return;
    
    // Wait 1 second before starting the animation
    const timeoutId1 = window.setTimeout(() => {
      const screenOverlay = this.heroSection.nativeElement.querySelector('.screen-overlay');
      const screenContent = this.heroSection.nativeElement.querySelector('.screen-content');
      const powerButton = this.heroSection.nativeElement.querySelector('.device-power-button');
      
      if (screenOverlay && screenContent && powerButton) {
        // Add power button glow effect
        this.renderer.addClass(powerButton, 'power-on');
        
        // After a short delay, start the screen turn-on animation
        const timeoutId2 = window.setTimeout(() => {
          this.renderer.addClass(screenContent, 'active');
          this.renderer.addClass(screenOverlay, 'fade-out');
        }, 500);
        this.timeouts.push(timeoutId2);
      }
    }, 1000);
    this.timeouts.push(timeoutId1);
  }
  
  /**
   * Ensures hero animations are properly triggered
   * Forces reflow and adds animation classes to elements
   */
  private triggerHeroAnimations(): void {
    if (!this.isBrowser || !this.heroSection?.nativeElement) return;
    
    // Force a reflow to ensure animations start properly
    const heroContent = this.heroSection.nativeElement.querySelector('.hero-content');
    const heroVisual = this.heroSection.nativeElement.querySelector('.hero-visual');
    const floatingElements = this.heroSection.nativeElement.querySelectorAll('.floating-element');
    
    if (heroContent) {
      // Force reflow
      void heroContent.offsetWidth;
      
      // Add animation classes if needed
      this.renderer.addClass(heroContent, 'animate');
    }
    
    if (heroVisual) {
      void heroVisual.offsetWidth;
      this.renderer.addClass(heroVisual, 'animate');
    }
    
    floatingElements.forEach((element: HTMLElement) => {
      void element.offsetWidth;
      this.renderer.addClass(element, 'animate');
    });
  }
}
