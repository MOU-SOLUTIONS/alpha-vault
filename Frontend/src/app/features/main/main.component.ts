/*
  Alpha Vault Financial System
  
  @author Mohamed Dhaoui
  @component MainComponent
  @description Primary layout wrapper for authenticated application area with responsive design
*/

import { CommonModule, isPlatformBrowser } from '@angular/common';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  DestroyRef,
  HostListener,
  inject,
  OnDestroy,
  OnInit,
  PLATFORM_ID,
  Renderer2,
} from '@angular/core';

import { BodyComponent } from '../body/body.component';
import { NavbarComponent } from '../navbar/navbar.component';
import { SidbarComponent } from '../sidbar/sidbar.component';

@Component({
  selector: 'app-main',
  standalone: true,
  imports: [
    CommonModule,
    NavbarComponent,
    SidbarComponent,
    BodyComponent,
  ],
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MainComponent implements OnInit, OnDestroy {

  /* ================================================================
     PUBLIC PROPERTIES
     ================================================================ */

  /** Controls the sidebar open/closed state on mobile */
  sidebarOpen = false;

  /** Tracks if the component is currently initializing */
  isInitializing = true;

  /** Tracks if we're on mobile viewport */
  isMobile = false;

  /** Manages loading states for child components */
  componentsLoaded = {
    navbar: false,
    sidebar: false,
    body: false
  };

  /* ================================================================
     PRIVATE PROPERTIES
     ================================================================ */

  private readonly destroyRef = inject(DestroyRef);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly renderer = inject(Renderer2);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly isBrowser = isPlatformBrowser(this.platformId);
  private resizeListener?: () => void;

  /* ================================================================
     LIFECYCLE HOOKS
     ================================================================ */

  ngOnInit(): void {
    if (!this.isBrowser) return;
    this.checkMobileViewport();
    this.initializeComponent();
    
    // Listen for window resize to update mobile state
    if (this.isBrowser) {
      this.resizeListener = () => this.checkMobileViewport();
      window.addEventListener('resize', this.resizeListener);
    }
  }

  ngOnDestroy(): void {
    this.cleanup();
  }

  /* ================================================================
     PUBLIC METHODS - SIDEBAR MANAGEMENT
     ================================================================ */

  /**
   * Toggles the sidebar open/closed state on mobile devices
   */
  toggleSidebar(): void {
    this.sidebarOpen = !this.sidebarOpen;
    this.updateBodyScroll();
    this.announceSidebarState();
    this.cdr.markForCheck();
  }

  /**
   * Closes the sidebar (useful for programmatic control)
   */
  closeSidebar(): void {
    if (!this.sidebarOpen) return;
    
    this.sidebarOpen = false;
    this.updateBodyScroll();
    this.announceSidebarState();
    this.cdr.markForCheck();
  }

  /* ================================================================
     PUBLIC METHODS - COMPONENT STATE MANAGEMENT
     ================================================================ */

  /**
   * Marks a child component as loaded
   */
  onComponentLoaded(componentName: keyof typeof this.componentsLoaded): void {
    this.componentsLoaded[componentName] = true;
    this.checkAllComponentsLoaded();
    this.cdr.markForCheck();
  }

  /**
   * Checks if all child components are loaded
   */
  private checkAllComponentsLoaded(): void {
    const allLoaded = Object.values(this.componentsLoaded).every(loaded => loaded);
    if (allLoaded) {
      this.isInitializing = false;
      this.cdr.markForCheck();
    }
  }

  /* ================================================================
     PRIVATE METHODS - INITIALIZATION
     ================================================================ */

  /**
   * Checks if we're on a mobile viewport (width < 992px, matching Bootstrap lg breakpoint)
   */
  private checkMobileViewport(): void {
    if (!this.isBrowser) {
      this.isMobile = false;
      return;
    }
    this.isMobile = window.innerWidth < 992;
    // On desktop, sidebar should always be open
    if (!this.isMobile) {
      this.sidebarOpen = true;
    }
    this.cdr.markForCheck();
  }

  /**
   * Initializes the main component
   */
  private initializeComponent(): void {
    // Set up initial state
    this.setupAccessibility();
    this.setupKeyboardNavigation();
    
    requestAnimationFrame(() => {
      if (!this.isBrowser) return;
      this.componentsLoaded.navbar = true;
      this.componentsLoaded.sidebar = true;
      this.componentsLoaded.body = true;
      this.checkAllComponentsLoaded();
    });
  }

  /**
   * Sets up accessibility features
   */
  private setupAccessibility(): void {
    // Announce component initialization to screen readers
    this.announceToScreenReader('Main application area loaded');
  }

  /**
   * Sets up keyboard navigation
   */
  private setupKeyboardNavigation(): void {
    // Additional keyboard navigation setup if needed
  }

  /* ================================================================
     PRIVATE METHODS - SIDEBAR FUNCTIONALITY
     ================================================================ */

  /**
   * Updates body scroll behavior based on sidebar state
   */
  private updateBodyScroll(): void {
    if (!this.isBrowser) return;
    
    const body = document.body;
    if (this.sidebarOpen) {
      this.renderer.setStyle(body, 'overflow', 'hidden');
    } else {
      this.renderer.removeStyle(body, 'overflow');
    }
  }

  /**
   * Announces sidebar state changes to screen readers
   */
  private announceSidebarState(): void {
    if (!this.isBrowser) return;
    
    const message = this.sidebarOpen ? 'Sidebar opened' : 'Sidebar closed';
    this.announceToScreenReader(message);
  }

  /* ================================================================
     PRIVATE METHODS - ACCESSIBILITY
     ================================================================ */

  /**
   * Announces messages to screen readers
   */
  private announceToScreenReader(message: string): void {
    if (!this.isBrowser) return;
    
    // Create temporary announcement element using Renderer2
    const announcement = this.renderer.createElement('div');
    this.renderer.setAttribute(announcement, 'aria-live', 'polite');
    this.renderer.setAttribute(announcement, 'aria-atomic', 'true');
    this.renderer.addClass(announcement, 'sr-only');
    this.renderer.setProperty(announcement, 'textContent', message);
    
    this.renderer.appendChild(document.body, announcement);
    
    // Remove after announcement using requestAnimationFrame
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        if (this.renderer.parentNode(announcement)) {
          this.renderer.removeChild(document.body, announcement);
        }
      });
    });
  }

  /* ================================================================
     PRIVATE METHODS - CLEANUP
     ================================================================ */

  /**
   * Performs cleanup operations
   */
  private cleanup(): void {
    if (!this.isBrowser) return;
    
    // Remove resize listener
    if (this.resizeListener) {
      window.removeEventListener('resize', this.resizeListener);
      this.resizeListener = undefined;
    }
    
    // Restore body scroll using Renderer2
    this.renderer.removeStyle(document.body, 'overflow');
    
    // Close sidebar if open
    if (this.sidebarOpen) {
      this.sidebarOpen = false;
      this.cdr.markForCheck();
    }
  }

  /* ================================================================
     HOST LISTENERS
     ================================================================ */

  /**
   * Handles escape key to close sidebar
   */
  @HostListener('document:keydown.escape')
  onEscapeKey(): void {
    if (!this.isBrowser) return;
    if (this.sidebarOpen) {
      this.closeSidebar();
    }
  }

  /**
   * Handles window resize events
   */
  @HostListener('window:resize')
  onWindowResize(): void {
    if (!this.isBrowser) return;
    
    // Close sidebar on large screens (desktop behavior)
    if (window.innerWidth > 1024 && this.sidebarOpen) {
      this.closeSidebar();
    }
  }
}
