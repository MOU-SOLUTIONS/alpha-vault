/*
  Alpha Vault Financial System
  
  @author Mohamed Dhaoui
  @component NotificationComponent
  @description Global notification component for displaying toast notifications
*/

import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, Input, OnDestroy, OnInit } from '@angular/core';
import { Subject } from 'rxjs';

import { Notification, NotificationService } from '../../../core/services/notification.service';

@Component({
  selector: 'app-notification',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './notification.component.html',
  styleUrls: ['./notification.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class NotificationComponent implements OnInit, OnDestroy {
  @Input() notification!: Notification;
  @Input() autoClose = true;
  @Input() duration = 5000; // 5 seconds

  private destroy$ = new Subject<void>();

  constructor(private notificationService: NotificationService) {}

  ngOnInit(): void {
    if (this.autoClose) {
      setTimeout(() => {
        this.close();
      }, this.duration);
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  close(): void {
    this.notificationService.removeNotification(this.notification.id);
  }

  markAsRead(): void {
    this.notificationService.markAsRead(this.notification.id);
  }

  getIconClass(): string {
    switch (this.notification.type) {
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

  getCategoryIcon(): string {
    switch (this.notification.category) {
      case 'income':
        return 'fas fa-arrow-up';
      case 'expense':
        return 'fas fa-arrow-down';
      case 'debt':
        return 'fas fa-credit-card';
      case 'saving':
        return 'fas fa-piggy-bank';
      case 'budget':
        return 'fas fa-chart-pie';
      default:
        return 'fas fa-bell';
    }
  }

  formatTimestamp(): string {
    const now = new Date();
    const diff = now.getTime() - this.notification.timestamp.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return this.notification.timestamp.toLocaleDateString();
  }
}
