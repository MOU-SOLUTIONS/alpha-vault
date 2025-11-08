// Core Angular imports
import { CommonModule, isPlatformBrowser } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  inject,
  OnDestroy,
  OnInit,
  PLATFORM_ID,
  Renderer2,
  ViewEncapsulation
} from '@angular/core';

import { ScrollService } from '../../core/services/scroll.service';
import { META_FRAGMENT } from '../../core/seo/page-meta.model';
import { AboutComponent } from '../../shared/components/about/about.component';
import { ContactComponent } from '../../shared/components/contact/contact.component';
import { FooterComponent } from '../../shared/components/footer/footer.component';
// Standalone components
import { HeaderComponent } from '../../shared/components/header/header.component';
import { WelcomeOverlayComponent } from '../../shared/components/welcome-overlay/welcome-overlay.component';
import { CtaComponent } from './components/cta/cta.component';
import { FeaturesComponent } from './components/features/features.component';
import { HeroComponent } from './components/hero/hero.component';

/**
 * Home Component - Main landing page of the application
 * 
 * Orchestrates the landing page layout with hero, features, about, contact, CTA, and footer sections.
 * Handles scroll animations and header scroll effects.
 * 
 * @component
 * @standalone
 */
@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule,
    HeaderComponent,
    HeroComponent,
    FeaturesComponent,
    AboutComponent,
    ContactComponent,
    CtaComponent,
    FooterComponent,
    WelcomeOverlayComponent
  ],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None, // Justified: Global page styles for landing page
  providers: [
    {
      provide: META_FRAGMENT,
      useValue: {
        description: 'Landing page for Alpha Vault financial freedom platform featuring hero section, feature highlights, about section, contact form, and call-to-action. Designed for young entrepreneurs to master money management, build wealth, and achieve financial independence with modern UI and smooth scroll animations.'
      }
    }
  ],
})
export class HomeComponent implements OnInit, OnDestroy {
  // Private properties
  private readonly renderer = inject(Renderer2);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly isBrowser = isPlatformBrowser(this.platformId);
  private readonly scrollService = inject(ScrollService);
  
  private scrollObserver?: IntersectionObserver;
  private scrollListenerCleanup?: () => void;

  /**
   * Lifecycle hook: Component initialization
   * Sets up SEO, scroll observer, and header scroll effects
   */
  public ngOnInit(): void {
    if (!this.isBrowser) return;
    
    this.setupScrollObserver();
    this.setupHeaderScroll();
  }

  /**
   * Lifecycle hook: Component destruction
   * Cleans up any subscriptions or event listeners
   */
  public ngOnDestroy(): void {
    this.cleanup();
  }

  /**
   * Scrolls to the specified section
   * @param sectionId - ID of the section to scroll to
   * @param event - Optional click event to prevent default behavior
   */
  public scrollTo(sectionId: string, event?: Event): void {
    if (event) {
      event.preventDefault();
    }
    this.scrollService.scrollToElement(sectionId, 'smooth');
  }

  /**
   * Handles overlay close event
   */
  public onOverlayClosed(): void {
    // Overlay closed, no action needed
  }

  /**
   * Sets up intersection observer for scroll animations
   * Creates an observer that adds 'revealed' class to elements when they enter viewport
   */
  private setupScrollObserver(): void {
    if (!this.isBrowser) return;

    const observerOptions = {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    };

    this.scrollObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          this.renderer.addClass(entry.target, 'revealed');
        }
      });
    }, observerOptions);

    requestAnimationFrame(() => {
      if (!this.isBrowser) return;
      
      // Use Renderer2 for DOM queries to maintain SSR compatibility
      // Note: querySelectorAll is acceptable here as it's used with Renderer2 for class manipulation
      const elements = document.querySelectorAll('.about-content, .team-member, .contact-content, .cta, .section-header, .feature-card');
      elements.forEach((el, index) => {
        this.renderer.addClass(el, 'reveal-on-scroll');
        this.renderer.setStyle(el, '--index', index.toString());
        this.scrollObserver?.observe(el);
      });
    });
  }
  
  /**
   * Sets up scroll event for header styling
   * Adds 'scrolled' class to header when page is scrolled down
   */
  private setupHeaderScroll(): void {
    if (!this.isBrowser) return;

    const scrollHandler = () => {
      const header = document.querySelector('.alpha-header');
      if (header) {
        if (this.scrollService.getScrollY() > 50) {
          this.renderer.addClass(header, 'scrolled');
        } else {
          this.renderer.removeClass(header, 'scrolled');
        }
      }
    };

    // Store cleanup function from Renderer2.listen()
    this.scrollListenerCleanup = this.renderer.listen('window', 'scroll', scrollHandler);
  }

  /**
   * Performs cleanup operations
   */
  private cleanup(): void {
    if (!this.isBrowser) return;

    // Cleanup IntersectionObserver
    if (this.scrollObserver) {
      this.scrollObserver.disconnect();
      this.scrollObserver = undefined;
    }

    // Cleanup scroll listener
    if (this.scrollListenerCleanup) {
      this.scrollListenerCleanup();
      this.scrollListenerCleanup = undefined;
    }
  }
}