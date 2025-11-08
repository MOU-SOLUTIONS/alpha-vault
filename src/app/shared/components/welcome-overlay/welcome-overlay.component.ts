import { animate,style, transition, trigger } from '@angular/animations';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Component, EventEmitter, HostListener, inject, OnDestroy, OnInit, Output, PLATFORM_ID } from '@angular/core';

@Component({
  selector: 'app-welcome-overlay',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './welcome-overlay.component.html',
  styleUrls: ['./welcome-overlay.component.scss'],
  animations: [
    trigger('overlayAnimation', [
      transition(':enter', [
        style({ opacity: 0 }),
        animate('800ms ease-out', style({ opacity: 1 }))
      ]),
      transition(':leave', [
        animate('500ms ease-in', style({ opacity: 0 }))
      ])
    ]),
    trigger('modalAnimation', [
      transition(':enter', [
        style({ opacity: 0, transform: 'scale(0.95) translateY(20px)' }),
        animate('800ms 200ms cubic-bezier(0.23, 1, 0.32, 1)', 
          style({ opacity: 1, transform: 'scale(1) translateY(0)' }))
      ]),
      transition(':leave', [
        animate('500ms cubic-bezier(0.23, 1, 0.32, 1)', 
          style({ opacity: 0, transform: 'scale(0.95) translateY(20px)' }))
      ])
    ]),
    trigger('contentAnimation', [
      transition(':enter', [
        style({ opacity: 0 }),
        animate('1000ms 600ms ease-out', style({ opacity: 1 }))
      ])
    ]),
    trigger('masterQuoteAnimation', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(15px)' }),
        animate('800ms 800ms cubic-bezier(0.23, 1, 0.32, 1)', 
          style({ opacity: 1, transform: 'translateY(0)' }))
      ])
    ]),
    trigger('secondaryQuoteAnimation', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(15px)' }),
        animate('800ms 1000ms cubic-bezier(0.23, 1, 0.32, 1)', 
          style({ opacity: 1, transform: 'translateY(0)' }))
      ])
    ])
  ]
})
export class WelcomeOverlayComponent implements OnInit, OnDestroy {
  showOverlay = false;
  isClosing = false;
  autoCloseTimer: ReturnType<typeof setTimeout> | null = null;
  
  private readonly platformId = inject(PLATFORM_ID);
  private readonly isBrowser = isPlatformBrowser(this.platformId);
  
  @Output() closeOverlay = new EventEmitter<void>();
  
  constructor() {}
  
  ngOnInit(): void {
    if (!this.isBrowser) return;
    
    // Check if user has visited before
    const hasVisitedBefore = localStorage.getItem('hasVisitedBefore');
    if (!hasVisitedBefore) { // Fixed the logic to only show on first visit
      // Only show on first visit
      this.autoCloseTimer = setTimeout(() => {
        this.showOverlay = true;
        
        // Auto-close after 8 seconds
        this.autoCloseTimer = setTimeout(() => {
          this.onClose();
        }, 8000);
      }, 1000); // Short delay for better UX
    }
  }
  
  ngOnDestroy(): void {
    if (this.autoCloseTimer) {
      clearTimeout(this.autoCloseTimer);
      this.autoCloseTimer = null;
    }
  }
  
  @HostListener('document:keydown.escape')
  onEscapeKey(): void {
    if (this.showOverlay) {
      this.onClose();
    }
  }
  
  onClose(): void {
    if (!this.isBrowser) return;
    
    if (this.autoCloseTimer) {
      clearTimeout(this.autoCloseTimer);
      this.autoCloseTimer = null;
    }
    
    this.isClosing = true;
    this.autoCloseTimer = setTimeout(() => {
      this.showOverlay = false;
      this.isClosing = false;
      localStorage.setItem('hasVisitedBefore', 'true');
      this.closeOverlay.emit();
      this.autoCloseTimer = null;
    }, 500); // Match animation duration
  }
  
  // Prevent clicks on the modal from closing the overlay
  onModalClick(event: Event): void {
    event.stopPropagation();
  }
}