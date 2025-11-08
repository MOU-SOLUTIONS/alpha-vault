/*
  Alpha Vault Financial System
  
  @author Mohamed Dhaoui
  @service ScrollService
  @description Service for scroll-related DOM operations with SSR safety
*/

import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import { Inject, Injectable, PLATFORM_ID } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class ScrollService {
  constructor(
    @Inject(DOCUMENT) private readonly document: Document,
    @Inject(PLATFORM_ID) private readonly platformId: object
  ) {}

  /**
   * Scrolls to an element by ID
   * @param elementId - The ID of the element to scroll to
   * @param behavior - Scroll behavior ('smooth' or 'auto')
   */
  scrollToElement(elementId: string, behavior: ScrollBehavior = 'smooth'): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    const element = this.document.getElementById(elementId);
    if (element) {
      element.scrollIntoView({ behavior, block: 'start' });
    }
  }

  /**
   * Gets the current scroll Y position
   */
  getScrollY(): number {
    if (!isPlatformBrowser(this.platformId)) {
      return 0;
    }
    return window.scrollY || window.pageYOffset || 0;
  }

  /**
   * Gets window inner width
   */
  getInnerWidth(): number {
    if (!isPlatformBrowser(this.platformId)) {
      return 1024; // Default desktop width for SSR
    }
    return window.innerWidth;
  }

  /**
   * Gets window inner height
   */
  getInnerHeight(): number {
    if (!isPlatformBrowser(this.platformId)) {
      return 768; // Default height for SSR
    }
    return window.innerHeight;
  }
}

