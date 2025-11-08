/*
  Alpha Vault Financial System
  
  @author Mohamed Dhaoui
  @component ToastNotificationComponent
  @description Small toast notification that appears briefly at the bottom of the notification icon
*/

import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, OnDestroy, OnInit } from '@angular/core';
import { Subject, takeUntil } from 'rxjs';

import { Notification, NotificationService } from '../../../core/services/notification.service';

/**
 * ToastNotificationComponent - Displays toast notifications
 * Uses OnPush change detection with manual markForCheck for optimal performance
 */
@Component({
  selector: 'app-toast-notification',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './toast-notification.component.html',
  styleUrls: ['./toast-notification.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ToastNotificationComponent implements OnInit, OnDestroy {
  @Input() duration = 10000; // 10 seconds

  visibleToasts: Notification[] = [];
  private destroy$ = new Subject<void>();

  constructor(
    private notificationService: NotificationService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    // Subscribe to notifications and show only the latest ones as toasts
    this.notificationService.notifications$
      .pipe(takeUntil(this.destroy$))
      .subscribe(notifications => {
        // Only show the most recent notification as a toast
        if (notifications.length > 0) {
          const latestNotification = notifications[0];
          this.showToast(latestNotification);
          this.cdr.markForCheck(); // Force change detection
        }
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private showToast(notification: Notification): void {
    // Add to visible toasts
    this.visibleToasts.unshift(notification);
    this.cdr.markForCheck(); // Force change detection after adding toast
    
    // Auto-remove after duration
    setTimeout(() => {
      this.removeToast(notification.id);
    }, this.duration);
  }

  removeToast(notificationId: string): void {
    this.visibleToasts = this.visibleToasts.filter(toast => toast.id !== notificationId);
    this.cdr.markForCheck(); // Force change detection
  }

  getToastClass(notification: Notification): string {
    return `toast-${notification.type}`;
  }

  getIconClass(notification: Notification): string {
    switch (notification.type) {
      case 'success':
        return 'fas fa-check-circle';
      case 'error':
        return 'fas fa-exclamation-circle';
      case 'warning':
        return 'fas fa-exclamation-triangle';
      case 'info':
        return 'fas fa-info-circle';
      default:
        return 'fas fa-bell';
    }
  }

  trackByNotificationId(index: number, notification: Notification): string {
    return notification.id;
  }
}
