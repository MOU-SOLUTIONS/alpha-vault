import { Component, EventEmitter,Output } from '@angular/core';
import { Router,RouterModule } from '@angular/router';

/**
 * HeaderComponent provides the main navigation for the application.
 */
@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterModule],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent {
  // ================= OUTPUTS =================
  @Output() public scrollToSection = new EventEmitter<{sectionId: string, event?: Event}>();
  
  // ================= PUBLIC PROPERTIES =================
  public isMobileMenuOpen = false;
  
  // ================= CONSTRUCTOR =================
  constructor(private readonly router: Router) {}
  
  // ================= PUBLIC METHODS =================
  /**
   * Toggles the mobile menu visibility
   */
  public toggleMobileMenu(): void {
    this.isMobileMenuOpen = !this.isMobileMenuOpen;
  }
  
  /**
   * Handles scrolling to sections within the application
   */
  public onScrollTo(sectionId: string, event?: Event): void {
    // Only emit scroll event if we're on the home page
    if (this.router.url === '/' || this.router.url === '/home') {
      this.scrollToSection.emit({sectionId, event});
    } else {
      // If not on home page, navigate to home and then scroll
      this.router.navigate(['/home']).then(() => {
        setTimeout(() => {
          const element = document.getElementById(sectionId);
          if (element) {
            element.scrollIntoView({
              behavior: 'smooth',
              block: 'start'
            });
          }
        }, 300); // Small delay to ensure page loads
      });
    }
    
    // Close mobile menu if open
    if (this.isMobileMenuOpen) {
      this.toggleMobileMenu();
    }
  }
}