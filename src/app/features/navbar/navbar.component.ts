/*
  Alpha Vault Financial System
  
  @author Mohamed Dhaoui
  @component NavbarComponent
  @description Top navigation bar with user menu, notifications, and language selection
*/

import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, HostListener, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, Subject } from 'rxjs';

import { AuthService } from '../../core/services/auth.service';
import { LoggingService } from '../../core/services/logging.service';
import { UserResponseDTO } from '../../models/user.model';
import { NotificationContainerComponent } from '../../shared/components/notification-container/notification-container.component';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, NotificationContainerComponent],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class NavbarComponent implements OnInit, OnDestroy {

  currentUser: UserResponseDTO | null = null;

  showUserMenu = false;
  isLoadingUser = false;

  hasUserError = false;
  userErrorMessage = '';

  private destroy$ = new Subject<void>();

  private userMenuState$ = new BehaviorSubject<boolean>(false);
  readonly showUserMenu$ = this.userMenuState$.asObservable();

  @ViewChild('userMenu', { static: false }) userMenu!: ElementRef;

  constructor(
    private authService: AuthService,
    private loggingService: LoggingService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.initializeComponent();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.cleanup();
  }

  toggleUserMenu(): void {
    if (this.isDestroyed()) return;

    const newState = !this.showUserMenu;
    this.showUserMenu = newState;
    this.userMenuState$.next(newState);
    
    this.announceToScreenReader(newState ? 'User menu opened' : 'User menu closed');
    
    if (newState) {
      this.focusUserMenu();
    }
    
    this.cdr.markForCheck();
  }

  closeUserMenu(): void {
    if (this.isDestroyed() || !this.showUserMenu) return;

    this.showUserMenu = false;
    this.userMenuState$.next(false);
    this.announceToScreenReader('User menu closed');
    this.cdr.markForCheck();
  }

  logout(): void {
    if (this.isDestroyed()) return;

    try {
      this.authService.logout();
      this.closeUserMenu();
      this.announceToScreenReader('Logging out');
      this.router.navigate(['/auth']);
    } catch (error) {
      this.loggingService.error('Logout failed:', error);
      this.announceToScreenReader('Logout failed, please try again');
    }
  }

  goToHome(): void {
    if (this.isDestroyed()) return;

    this.announceToScreenReader('Navigating to home');
    this.router.navigate(['/home']);
  }

  selectLanguage(language: string): void {
    if (this.isDestroyed()) return;

    this.announceToScreenReader(`Language changed to ${language}`);
    this.cdr.markForCheck();
  }

  openNotifications(): void {
    if (this.isDestroyed()) return;

    this.announceToScreenReader('Opening notifications');
    this.cdr.markForCheck();
  }

  openMessages(): void {
    if (this.isDestroyed()) return;

    this.announceToScreenReader('Opening messages');
    this.cdr.markForCheck();
  }

  openProfile(): void {
    if (this.isDestroyed()) return;

    this.closeUserMenu();
    this.announceToScreenReader('Opening user profile');
    this.router.navigate(['/main/body/profile']);
  }

  openSettings(): void {
    if (this.isDestroyed()) return;

    this.announceToScreenReader('Opening user settings');
    this.router.navigate(['/settings']);
  }

  retryUserDataLoad(): void {
    if (this.isDestroyed()) return;

    this.setupUserData();
  }


  onUserMenuKeydown(event: KeyboardEvent): void {
    if (this.isDestroyed()) return;

    switch (event.key) {
      case 'Escape':
        event.preventDefault();
        this.closeUserMenu();
        break;
      case 'Enter':
      case ' ':
        event.preventDefault();
        this.toggleUserMenu();
        break;
      case 'ArrowDown':
        if (this.showUserMenu) {
          event.preventDefault();
          this.focusFirstMenuItem();
        }
        break;
    }
  }

  onDropdownItemKeydown(event: KeyboardEvent, action: 'logout' | 'profile'): void {
    if (this.isDestroyed()) return;

    switch (event.key) {
      case 'Enter':
      case ' ':
        event.preventDefault();
        if (action === 'logout') {
          this.logout();
        }
        break;
      case 'Escape':
        event.preventDefault();
        this.closeUserMenu();
        break;
    }
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event): void {
    if (this.isDestroyed() || !this.showUserMenu) return;

    const target = event.target as HTMLElement;
    if (!target.closest('.head-user-avatar-container')) {
      this.closeUserMenu();
    }
  }

  private initializeComponent(): void {
    if (this.isDestroyed()) return;

    this.setupUserData();
    this.setupAccessibility();
    this.setupKeyboardNavigation();
  }

  private setupUserData(): void {
    if (this.isDestroyed()) return;

    this.isLoadingUser = true;
    this.hasUserError = false;
    this.userErrorMessage = '';

    try {
      const user = this.authService.getCurrentUser();
      if (user) {
        this.currentUser = user;
        this.announceToScreenReader('User data loaded successfully');
      } else {
        this.handleUserDataError('No user data available');
      }
    } catch (error) {
      this.handleUserDataError('Failed to load user data');
      this.loggingService.error('User data loading error:', error);
    } finally {
      this.isLoadingUser = false;
      this.cdr.markForCheck();
    }
  }

  private setupAccessibility(): void {
    if (this.isDestroyed()) return;

    this.announceToScreenReader('Navigation bar loaded');
  }

  private setupKeyboardNavigation(): void {
    if (this.isDestroyed()) return;

  }

  private handleUserDataError(message: string): void {
    if (this.isDestroyed()) return;

    this.hasUserError = true;
    this.userErrorMessage = message;
    this.currentUser = null;
    this.announceToScreenReader(message);
  }

  private focusUserMenu(): void {
    if (this.isDestroyed() || !this.userMenu) return;

    setTimeout(() => {
      if (!this.isDestroyed() && this.userMenu) {
        const firstFocusableElement = this.userMenu.nativeElement.querySelector('button, [tabindex="0"]');
        if (firstFocusableElement) {
          firstFocusableElement.focus();
        }
      }
    }, 100);
  }

  private focusFirstMenuItem(): void {
    if (this.isDestroyed() || !this.userMenu) return;

    const firstMenuItem = this.userMenu.nativeElement.querySelector('.dropdown-item');
    if (firstMenuItem) {
      firstMenuItem.focus();
    }
  }

  private announceToScreenReader(message: string): void {
    if (this.isDestroyed()) return;

    const announcement = document.createElement('div');
    announcement.setAttribute('aria-live', 'polite');
    announcement.setAttribute('aria-atomic', 'true');
    announcement.className = 'sr-only';
    announcement.textContent = message;

    document.body.appendChild(announcement);

    setTimeout(() => {
      if (document.body.contains(announcement)) {
        document.body.removeChild(announcement);
      }
    }, 1000);
  }

  private isDestroyed(): boolean {
    return this.destroy$.closed;
  }

  private cleanup(): void {
    if (this.showUserMenu) {
      this.showUserMenu = false;
      this.userMenuState$.next(false);
    }

  }
}
