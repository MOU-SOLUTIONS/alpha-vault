// Core Angular imports
import { 
  Component, 
  ElementRef, 
  ViewChild, 
  OnInit, 
  OnDestroy, 
  Inject, 
  PLATFORM_ID, 
  ViewEncapsulation 
} from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';

// Standalone components
import { HeaderComponent } from '../../shared/components/header/header.component';
import { HeroComponent } from './components/hero/hero.component';
import { FeaturesComponent } from './components/features/features.component';
import { AboutComponent } from '../../shared/components/about/about.component';
import { ContactComponent } from '../../shared/components/contact/contact.component';
import { CtaComponent } from './components/cta/cta.component';
import { FooterComponent } from '../../shared/components/footer/footer.component';
import { WelcomeOverlayComponent } from '../../shared/components/welcome-overlay/welcome-overlay.component';

/**
 * Interface for form data structure
 */
interface FormData {
  name: string;
  email: string;
  interest: string;
  message: string;
}

/**
 * Home Component - Main landing page of the application
 */
@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
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
  encapsulation: ViewEncapsulation.None
})
export class HomeComponent implements OnInit, OnDestroy {
  // ViewChild references
  @ViewChild('aboutSection', { static: false }) private readonly aboutSection!: ElementRef;
  @ViewChild('contactSection', { static: false }) private readonly contactSection!: ElementRef;

  // Public properties
  public formData: FormData = {
    name: '',
    email: '',
    interest: '',
    message: ''
  };

  /**
   * Component constructor
   * @param platformId - Platform ID for SSR detection
   * @param meta - Meta service for SEO tags
   * @param title - Title service for page title
   */
  constructor(
    @Inject(PLATFORM_ID) private readonly platformId: Object,
    private readonly meta: Meta,
    private readonly title: Title
  ) {}

  /**
   * Lifecycle hook: Component initialization
   * Sets up SEO, scroll observer, and header scroll effects
   */
  public ngOnInit(): void {
    this.setupSEO();
    this.setupScrollObserver();
    this.setupHeaderScroll();
  }

  /**
   * Lifecycle hook: Component destruction
   * Cleans up any subscriptions or event listeners
   */
  public ngOnDestroy(): void {
    // Clean up any subscriptions or event listeners here if needed
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
    
    const element = document.getElementById(sectionId);
    
    if (element) {
      element.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
    }
  }

  /**
   * Handles form submission for feedback
   * @param event - Form submission event
   */
  public onSubmitFeedback(event: Event): void {
    event.preventDefault();
    
    if (this.isFormValid()) {
      const sanitizedData = this.sanitizeFormData(this.formData);
      
      // Here you would typically send the data to your backend
      this.showNotification('Thank you for your message! We will get back to you soon.');
      this.resetForm();
    } else {
      this.showNotification('Please fill out all required fields correctly.');
    }
  }

  /**
   * Handles overlay close event
   */
  public onOverlayClosed(): void {
    console.log('Welcome overlay closed');
  }

  /**
   * Sets up SEO meta tags and title
   */
  private setupSEO(): void {
    this.title.setTitle('Alpha Vault - Financial Freedom for the Next Generation');
    
    this.meta.addTags([
      { name: 'description', content: 'Alpha Vault - The ultimate financial freedom platform for young entrepreneurs. Master your money, build wealth, and achieve financial independence.' },
      { name: 'keywords', content: 'financial management, budgeting, investing, savings, debt management, young entrepreneurs, financial freedom' },
      { property: 'og:title', content: 'Alpha Vault - Your Path to Financial Dominance' },
      { property: 'og:description', content: 'Transform your financial future with Alpha Vault\'s powerful money management tools.' },
      { property: 'og:type', content: 'website' }
    ]);
  }

  /**
   * Sets up intersection observer for scroll animations
   * Creates an observer that adds 'revealed' class to elements when they enter viewport
   */
  private setupScrollObserver(): void {
    if (typeof window !== 'undefined') {
      const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
      };

      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('revealed');
          }
        });
      }, observerOptions);

      // Observe all elements with reveal-on-scroll class
      setTimeout(() => {
        document.querySelectorAll('.about-content, .team-member, .contact-content, .cta, .section-header, .feature-card')
          .forEach((el, index) => {
            el.classList.add('reveal-on-scroll');
            // Add index as a CSS variable for staggered animations
            (el as HTMLElement).style.setProperty('--index', index.toString());
            observer.observe(el);
          });
      }, 100);
    }
  }
  
  /**
   * Sets up scroll event for header styling
   * Adds 'scrolled' class to header when page is scrolled down
   */
  private setupHeaderScroll(): void {
    if (typeof window !== 'undefined') {
      window.addEventListener('scroll', () => {
        const header = document.querySelector('.alpha-header');
        if (header) {
          if (window.scrollY > 50) {
            header.classList.add('scrolled');
          } else {
            header.classList.remove('scrolled');
          }
        }
      });
    }
  }

  /**
   * Validates form data
   * @returns boolean indicating if form is valid
   */
  private isFormValid(): boolean {
    return !!this.formData.name && 
           this.isValidEmail(this.formData.email) && 
           !!this.formData.interest && 
           !!this.formData.message;
  }

  /**
   * Validates email format
   * @param email - Email to validate
   * @returns boolean indicating if email is valid
   */
  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Sanitizes form data
   * @param data - Form data to sanitize
   * @returns Sanitized form data
   */
  private sanitizeFormData(data: FormData): FormData {
    return {
      name: this.sanitizeString(data.name),
      email: this.sanitizeString(data.email),
      interest: this.sanitizeString(data.interest),
      message: this.sanitizeString(data.message)
    };
  }

  /**
   * Sanitizes a string by trimming whitespace
   * @param str - String to sanitize
   * @returns Sanitized string
   */
  private sanitizeString(str: string): string {
    return str.trim();
  }

  /**
   * Resets form data
   */
  private resetForm(): void {
    this.formData = {
      name: '',
      email: '',
      interest: '',
      message: ''
    };
  }

  /**
   * Shows a notification to the user
   * @param message - Message to display
   */
  private showNotification(message: string): void {
    // In a real application, you would use a proper notification system
    alert(message);
  }
}