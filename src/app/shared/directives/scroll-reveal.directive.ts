// src/app/shared/directives/scroll-reveal.directive.ts
import { isPlatformBrowser } from '@angular/common';
import { Directive, ElementRef, HostListener, inject, PLATFORM_ID } from '@angular/core';

@Directive({
  selector: '[appScrollReveal]',
  standalone: true,
})
export class ScrollRevealDirective {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly isBrowser = isPlatformBrowser(this.platformId);

  constructor(private el: ElementRef<HTMLElement>) {
    if (this.isBrowser) {
      // set initial state
      this.el.nativeElement.classList.add('reveal-init');
    }
  }

  @HostListener('window:scroll')
  onWindowScroll(): void {
    if (!this.isBrowser) return;
    
    const rect = this.el.nativeElement.getBoundingClientRect();
    if (rect.top < window.innerHeight * 0.85) {
      this.el.nativeElement.classList.add('reveal-animate');
    }
  }
}
