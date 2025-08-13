import { Component, ElementRef, ViewChild, AfterViewInit, Renderer2 } from '@angular/core';
import { ScrollRevealDirective } from '../../../../shared/directives/scroll-reveal.directive';

/**
 * Features component displays the application's key features in a grid layout
 * with animation effects when scrolling into view.
 */
@Component({
  selector: 'app-features',
  standalone: true,
  imports: [ScrollRevealDirective],
  templateUrl: './features.component.html',
  styleUrls: ['./features.component.scss']
})
export class FeaturesComponent implements AfterViewInit {
  // ================= INPUTS / OUTPUTS =================
  // None

  // ================= PUBLIC PROPERTIES =================
  // None

  // ================= VIEWCHILD REFERENCES =================
  @ViewChild('featuresSection') public featuresSection!: ElementRef;
  
  // ================= CONSTRUCTOR =================
  constructor(private readonly renderer: Renderer2) {}
  
  // ================= LIFECYCLE HOOKS =================
  /**
   * After view initialization, set up the intersection observer
   * to animate feature cards when they come into view
   */
  public ngAfterViewInit(): void {
    this.setupIntersectionObserver();
  }
  
  // ================= PUBLIC METHODS =================
  // None

  // ================= PRIVATE METHODS =================
  /**
   * Sets up an intersection observer to animate feature cards when they come into view
   * by changing their opacity and transform properties
   */
  private setupIntersectionObserver(): void {
    const observerOptions = {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          this.renderer.setStyle(entry.target, 'opacity', '1');
          this.renderer.setStyle(entry.target, 'transform', 'translateY(0)');
        }
      });
    }, observerOptions);

    // Observe feature cards
    const featureCards = this.featuresSection.nativeElement.querySelectorAll('.feature-card');
    featureCards.forEach((card: HTMLElement) => {
      this.renderer.setStyle(card, 'opacity', '0');
      this.renderer.setStyle(card, 'transform', 'translateY(30px)');
      this.renderer.setStyle(card, 'transition', 'all 0.6s ease');
      observer.observe(card);
    });
  }
}
