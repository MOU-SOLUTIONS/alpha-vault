import { CommonModule } from '@angular/common';
import { AfterViewInit,Component, ElementRef, EventEmitter, Input, OnDestroy, OnInit, Output, Renderer2, ViewChild } from '@angular/core';

@Component({
  selector: 'app-overlay-container',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './overlay-container.component.html',
  styleUrls: ['./overlay-container.component.scss'],
})
export class OverlayContainerComponent implements OnInit, OnDestroy, AfterViewInit {
  @ViewChild('overlayBackdrop', { static: false }) overlayBackdrop!: ElementRef;

  /**
   * Title shown at the top of the overlay header
   */
  @Input() title = 'Overlay';

  /**
   * Optional theme modifier: applies a top border color to match context
   */
  @Input() theme: 'add' | 'modify' | 'delete' = 'add';

  /**
   * Optional width of the modal (default: 600px)
   */
  @Input() width = '600px';

  /**
   * Emits when the overlay is closed
   */
  @Output() cancel = new EventEmitter<void>();

  /**
   * Store the original body overflow style
   */
  private originalBodyOverflow = '';

  /**
   * Store the scroll position
   */
  private scrollPosition = 0;

  constructor(private renderer: Renderer2) {}

  ngOnInit(): void {
    // Calculate current scroll position
    this.scrollPosition = window.pageYOffset || document.documentElement.scrollTop;
    
    // Lock background scroll
    this.originalBodyOverflow = document.body.style.overflow;
    this.renderer.setStyle(document.body, 'overflow', 'hidden');

    // Add ESC key close support
    document.addEventListener('keydown', this.handleEscKey);
  }

  ngAfterViewInit(): void {
    // Set the positioning after the view is initialized
    this.setOverlayPosition();
  }

  ngOnDestroy(): void {
    // Restore original scroll
    this.renderer.setStyle(document.body, 'overflow', this.originalBodyOverflow);

    // Remove ESC key listener
    document.removeEventListener('keydown', this.handleEscKey);
  }

  /**
   * Set the overlay position based on scroll position
   */
  private setOverlayPosition(): void {
    if (this.overlayBackdrop && this.overlayBackdrop.nativeElement) {
      const element = this.overlayBackdrop.nativeElement;
      
      // Set the positioning directly on the element
      this.renderer.setStyle(element, 'top', `${this.scrollPosition}px`);
      this.renderer.setStyle(element, 'height', `calc(100vh - ${this.scrollPosition}px)`);
      
    }
  }

  /**
   * Handle ESC key press to close overlay
   */
  private handleEscKey = (event: KeyboardEvent) => {
    if (event.key === 'Escape') {
      this.cancel.emit();
    }
  }

  /**
   * Close overlay when backdrop is clicked (not modal content)
   */
  onBackdropClick(event: MouseEvent): void {
    if ((event.target as HTMLElement).classList.contains('overlay-backdrop')) {
      this.cancel.emit();
    }
  }
}
