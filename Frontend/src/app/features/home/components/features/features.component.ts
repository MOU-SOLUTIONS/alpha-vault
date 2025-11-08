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

import { ScrollRevealDirective } from '../../../../shared/directives/scroll-reveal.directive';

/**
 * Features component displays the application's key features in a grid layout
 * with animation effects when scrolling into view.
 * 
 * @component
 * @standalone
 */
@Component({
  selector: 'app-features',
  standalone: true,
  imports: [ScrollRevealDirective],
  templateUrl: './features.component.html',
  styleUrls: ['./features.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FeaturesComponent implements AfterViewInit, OnDestroy {
  // ================= INPUTS / OUTPUTS =================
  // None

  // ================= PUBLIC PROPERTIES =================
  // None

  // ================= VIEWCHILD REFERENCES =================
  @ViewChild('featuresSection') public featuresSection!: ElementRef;
  
  // ================= PRIVATE PROPERTIES =================
  private readonly renderer = inject(Renderer2);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly isBrowser = isPlatformBrowser(this.platformId);
  private intersectionObserver?: IntersectionObserver;
  
  // ================= LIFECYCLE HOOKS =================
  /**
   * After view initialization, set up the intersection observer
   * to animate feature cards when they come into view
   */
  public ngAfterViewInit(): void {
    if (!this.isBrowser) return;
    this.setupIntersectionObserver();
  }

  /**
   * Cleanup intersection observer on component destruction
   */
  public ngOnDestroy(): void {
    if (this.intersectionObserver) {
      this.intersectionObserver.disconnect();
    }
  }
  
  // ================= PRIVATE METHODS =================
  /**
   * Sets up an intersection observer to animate feature cards when they come into view
   * by changing their opacity and transform properties
   */
  private setupIntersectionObserver(): void {
    if (!this.isBrowser || !this.featuresSection?.nativeElement) return;

    const observerOptions = {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    };

    this.intersectionObserver = new IntersectionObserver((entries) => {
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
      this.intersectionObserver?.observe(card);
    });
  }
}
