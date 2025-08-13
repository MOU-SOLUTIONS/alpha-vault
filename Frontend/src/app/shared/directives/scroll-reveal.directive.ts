// src/app/shared/directives/scroll-reveal.directive.ts
import { Directive, ElementRef, HostListener } from '@angular/core';

@Directive({
  selector: '[appScrollReveal]',
  standalone: true,
})
export class ScrollRevealDirective {
  constructor(private el: ElementRef<HTMLElement>) {
    // set initial state
    this.el.nativeElement.classList.add('reveal-init');
  }

  @HostListener('window:scroll')
  onWindowScroll() {
    const rect = this.el.nativeElement.getBoundingClientRect();
    if (rect.top < window.innerHeight * 0.85) {
      this.el.nativeElement.classList.add('reveal-animate');
    }
  }
}
