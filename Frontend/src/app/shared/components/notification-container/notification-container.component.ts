/*
  Alpha Vault Financial System
  
  @author Mohamed Dhaoui
  @component NotificationContainerComponent
  @description Container component for managing and displaying all notifications
*/

import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { Subject, takeUntil } from 'rxjs';

import { Notification, NotificationService } from '../../../core/services/notification.service';
import { NotificationComponent } from '../notification/notification.component';
import { ToastNotificationComponent } from '../toast-notification/toast-notification.component';

/**
 * NotificationContainerComponent - Container for managing notifications
 * Uses OnPush change detection with manual markForCheck for optimal performance
 */
@Component({
  selector: 'app-notification-container',
  standalone: true,
  imports: [CommonModule, NotificationComponent, ToastNotificationComponent],
  templateUrl: './notification-container.component.html',
  styleUrls: ['./notification-container.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class NotificationContainerComponent implements OnInit, OnDestroy {
  notifications: Notification[] = [];
  unreadCount = 0;
  isVisible = false;

  private destroy$ = new Subject<void>();

  constructor(
    private notificationService: NotificationService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    // Subscribe to notifications
    this.notificationService.notifications$
      .pipe(takeUntil(this.destroy$))
      .subscribe(notifications => {
        this.notifications = notifications;
        this.cdr.markForCheck(); // Force change detection
      });

    // Subscribe to unread count
    this.notificationService.unreadCount$
      .pipe(takeUntil(this.destroy$))
      .subscribe(count => {
        this.unreadCount = count;
        this.cdr.markForCheck(); // Force change detection
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  toggleVisibility(): void {
    this.isVisible = !this.isVisible;
  }

  markAllAsRead(): void {
    this.notificationService.markAllAsRead();
  }

  clearAll(): void {
    this.notificationService.clearAllNotifications();
  }

  trackByNotificationId(index: number, notification: Notification): string {
    return notification.id;
  }
}
