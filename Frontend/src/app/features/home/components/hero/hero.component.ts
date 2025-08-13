import { Component, ElementRef, ViewChild, AfterViewInit, Renderer2 } from '@angular/core';
import { RouterLink } from '@angular/router';

/**
 * Hero component for the home page
 * Displays the main hero section with animated device mockup
 */
@Component({
  selector: 'app-hero',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './hero.component.html',
  styleUrls: ['./hero.component.scss']
})
export class HeroComponent implements AfterViewInit {
  // Inputs / Outputs
  // None currently
  
  // Public properties
  @ViewChild('heroSection') public heroSection!: ElementRef;
  
  /**
   * Creates an instance of HeroComponent
   * @param renderer Angular Renderer2 for DOM manipulation
   */
  constructor(private readonly renderer: Renderer2) {}
  
  /**
   * Lifecycle hook that is called after the view has been initialized
   * Initializes animations and effects
   */
  public ngAfterViewInit(): void {
    this.addRippleEffectToButtons();
    this.initDeviceTurnOnAnimation();
    this.triggerHeroAnimations();
  }
  
  /**
   * Handles demo video playback
   * Currently shows an alert as placeholder functionality
   */
  public playDemo(): void {
    // Implement demo video playback functionality
    alert('Demo video will play here');
  }
  
  /**
   * Adds ripple effect to primary and secondary buttons
   * Creates and animates a ripple element on click
   */
  private addRippleEffectToButtons(): void {
    const buttons = this.heroSection.nativeElement.querySelectorAll('.btn-primary, .btn-secondary');
    
    buttons.forEach((button: HTMLElement) => {
      this.renderer.listen(button, 'click', (event: MouseEvent) => {
        const ripple = this.renderer.createElement('span');
        this.renderer.addClass(ripple, 'ripple');
        this.renderer.appendChild(button, ripple);
        
        const rect = button.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;
        
        this.renderer.setStyle(ripple, 'left', `${x}px`);
        this.renderer.setStyle(ripple, 'top', `${y}px`);
        
        setTimeout(() => {
          this.renderer.removeChild(button, ripple);
        }, 600);
      });
    });
  }

  /**
   * Initializes the device turn-on animation sequence
   * Adds classes to trigger power button glow and screen activation
   */
  private initDeviceTurnOnAnimation(): void {
    // Wait 1 second before starting the animation
    setTimeout(() => {
      const screenOverlay = this.heroSection.nativeElement.querySelector('.screen-overlay');
      const screenContent = this.heroSection.nativeElement.querySelector('.screen-content');
      const powerButton = this.heroSection.nativeElement.querySelector('.device-power-button');
      
      if (screenOverlay && screenContent && powerButton) {
        // Add power button glow effect
        this.renderer.addClass(powerButton, 'power-on');
        
        // After a short delay, start the screen turn-on animation
        setTimeout(() => {
          this.renderer.addClass(screenContent, 'active');
          this.renderer.addClass(screenOverlay, 'fade-out');
        }, 500);
      }
    }, 1000);
  }
  
  /**
   * Ensures hero animations are properly triggered
   * Forces reflow and adds animation classes to elements
   */
  private triggerHeroAnimations(): void {
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
