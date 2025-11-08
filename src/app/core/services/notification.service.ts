/*
  Alpha Vault Financial System
  
  @author Mohamed Dhaoui
  @service NotificationService
  @description Global notification service for managing application-wide notifications
*/

import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  category?: 'income' | 'expense' | 'debt' | 'saving' | 'budget' | 'general';
  action?: string;
  data?: any;
}

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private notificationsSubject = new BehaviorSubject<Notification[]>([]);
  private unreadCountSubject = new BehaviorSubject<number>(0);
  
  public notifications$ = this.notificationsSubject.asObservable();
  public unreadCount$ = this.unreadCountSubject.asObservable();

  constructor() {
    // Don't load notifications from localStorage - notifications should only show after actions
  }

  /**
   * Add a new notification
   */
  addNotification(notification: Omit<Notification, 'id' | 'timestamp' | 'read'>): string {
    const newNotification: Notification = {
      ...notification,
      id: this.generateId(),
      timestamp: new Date(),
      read: false
    };

    const currentNotifications = this.notificationsSubject.value;
    const updatedNotifications = [newNotification, ...currentNotifications].slice(0, 50); // Keep only last 50 notifications
    
    this.notificationsSubject.next(updatedNotifications);
    this.updateUnreadCount();
    // Don't save to localStorage - notifications should only be temporary
    
    return newNotification.id;
  }

  /**
   * Mark notification as read
   */
  markAsRead(notificationId: string): void {
    const currentNotifications = this.notificationsSubject.value;
    const updatedNotifications = currentNotifications.map(notification =>
      notification.id === notificationId ? { ...notification, read: true } : notification
    );
    
    this.notificationsSubject.next(updatedNotifications);
    this.updateUnreadCount();
    // Don't save to localStorage - notifications should only be temporary
  }

  /**
   * Mark all notifications as read
   */
  markAllAsRead(): void {
    const currentNotifications = this.notificationsSubject.value;
    const updatedNotifications = currentNotifications.map(notification => ({
      ...notification,
      read: true
    }));
    
    this.notificationsSubject.next(updatedNotifications);
    this.updateUnreadCount();
    // Don't save to localStorage - notifications should only be temporary
  }

  /**
   * Remove a notification
   */
  removeNotification(notificationId: string): void {
    const currentNotifications = this.notificationsSubject.value;
    const updatedNotifications = currentNotifications.filter(notification => notification.id !== notificationId);
    
    this.notificationsSubject.next(updatedNotifications);
    this.updateUnreadCount();
    // Don't save to localStorage - notifications should only be temporary
  }

  /**
   * Clear all notifications
   */
  clearAllNotifications(): void {
    this.notificationsSubject.next([]);
    this.updateUnreadCount();
    // Don't save to localStorage - notifications should only be temporary
  }

  /**
   * Get notifications by category
   */
  getNotificationsByCategory(category: string): Observable<Notification[]> {
    return new BehaviorSubject(
      this.notificationsSubject.value.filter(notification => notification.category === category)
    ).asObservable();
  }

  /**
   * Income-specific notification methods
   */
  addIncomeCreatedNotification(amount: number, source: string): string {
    const notificationId = this.addNotification({
      type: 'success',
      title: 'Income Added',
      message: `Successfully added $${amount.toFixed(2)} from ${source}`,
      category: 'income',
      action: 'income_created',
      data: { amount, source }
    });
    
    // Auto-dismiss after 5 seconds
    setTimeout(() => {
      this.removeNotification(notificationId);
    }, 5000);
    
    return notificationId;
  }

  addIncomeModifiedNotification(amount: number, source: string): string {
    const notificationId = this.addNotification({
      type: 'info',
      title: 'Income Modified',
      message: `Successfully updated income to $${amount.toFixed(2)} from ${source}`,
      category: 'income',
      action: 'income_modified',
      data: { amount, source }
    });
    
    // Auto-dismiss after 5 seconds
    setTimeout(() => {
      this.removeNotification(notificationId);
    }, 5000);
    
    return notificationId;
  }

  addIncomeDeletedNotification(amount: number, source: string): string {
    const notificationId = this.addNotification({
      type: 'warning',
      title: 'Income Deleted',
      message: `Successfully deleted $${amount.toFixed(2)} from ${source}`,
      category: 'income',
      action: 'income_deleted',
      data: { amount, source }
    });
    
    // Auto-dismiss after 5 seconds
    setTimeout(() => {
      this.removeNotification(notificationId);
    }, 5000);
    
    return notificationId;
  }

  addIncomeErrorNotification(action: string, error: string): string {
    return this.addNotification({
      type: 'error',
      title: 'Income Error',
      message: `Failed to ${action} income: ${error}`,
      category: 'income',
      action: `income_${action}_error`
    });
  }

  // ===== EXPENSE NOTIFICATIONS =====
  addExpenseCreatedNotification(amount: number, category: string): string {
    const notificationId = this.addNotification({
      type: 'success',
      title: 'Expense Created',
      message: `Successfully added $${amount.toFixed(2)} for ${category}`,
      category: 'expense',
      action: 'expense_created',
      data: { amount, category }
    });
    
    // Auto-dismiss after 5 seconds
    setTimeout(() => {
      this.removeNotification(notificationId);
    }, 5000);
    
    return notificationId;
  }

  addExpenseModifiedNotification(amount: number, category: string): string {
    const notificationId = this.addNotification({
      type: 'success',
      title: 'Expense Modified',
      message: `Successfully updated expense to $${amount.toFixed(2)} for ${category}`,
      category: 'expense',
      action: 'expense_modified',
      data: { amount, category }
    });
    
    // Auto-dismiss after 5 seconds
    setTimeout(() => {
      this.removeNotification(notificationId);
    }, 5000);
    
    return notificationId;
  }

  addExpenseDeletedNotification(): string {
    const notificationId = this.addNotification({
      type: 'warning',
      title: 'Expense Deleted',
      message: 'Successfully deleted expense record',
      category: 'expense',
      action: 'expense_deleted'
    });
    
    // Auto-dismiss after 5 seconds
    setTimeout(() => {
      this.removeNotification(notificationId);
    }, 5000);
    
    return notificationId;
  }

  addExpenseErrorNotification(action: string, error: string): string {
    return this.addNotification({
      type: 'error',
      title: 'Expense Error',
      message: `Failed to ${action} expense: ${error}`,
      category: 'expense',
      action: `expense_${action}_error`
    });
  }

  // ===== BUDGET NOTIFICATIONS =====
  addBudgetCreatedNotification(amount: number, category: string): string {
    const notificationId = this.addNotification({
      type: 'success',
      title: 'Budget Created',
      message: `Budget allocation of $${amount.toFixed(2)} for ${category} has been created successfully.`,
      category: 'budget',
      action: 'budget_created'
    });
    return notificationId;
  }

  addBudgetModifiedNotification(amount: number, category: string): string {
    const notificationId = this.addNotification({
      type: 'success',
      title: 'Budget Modified',
      message: `Budget allocation for ${category} has been updated to $${amount.toFixed(2)}.`,
      category: 'budget',
      action: 'budget_modified'
    });
    return notificationId;
  }

  addBudgetDeletedNotification(category: string): string {
    const notificationId = this.addNotification({
      type: 'success',
      title: 'Budget Deleted',
      message: `Budget allocation for ${category} has been deleted successfully.`,
      category: 'budget',
      action: 'budget_deleted'
    });
    return notificationId;
  }

  addBudgetErrorNotification(action: string, error: string): string {
    return this.addNotification({
      type: 'error',
      title: 'Budget Error',
      message: `Failed to ${action} budget: ${error}`,
      category: 'budget',
      action: `budget_${action}_error`
    });
  }

  // ===== SAVING GOAL NOTIFICATIONS =====
  addSavingCreatedNotification(goalName: string, targetAmount: number): string {
    const notificationId = this.addNotification({
      type: 'success',
      title: 'Saving Goal Created',
      message: `Successfully created saving goal "${goalName}" with target of $${targetAmount.toFixed(2)}`,
      category: 'saving',
      action: 'saving_created',
      data: { goalName, targetAmount }
    });
    
    setTimeout(() => {
      this.removeNotification(notificationId);
    }, 5000);
    
    return notificationId;
  }

  addSavingModifiedNotification(goalName: string, targetAmount: number): string {
    const notificationId = this.addNotification({
      type: 'success',
      title: 'Saving Goal Updated',
      message: `Successfully updated saving goal "${goalName}" with new target of $${targetAmount.toFixed(2)}`,
      category: 'saving',
      action: 'saving_modified',
      data: { goalName, targetAmount }
    });
    
    setTimeout(() => {
      this.removeNotification(notificationId);
    }, 5000);
    
    return notificationId;
  }

  addSavingDeletedNotification(goalName: string): string {
    const notificationId = this.addNotification({
      type: 'warning',
      title: 'Saving Goal Deleted',
      message: `Successfully deleted saving goal "${goalName}"`,
      category: 'saving',
      action: 'saving_deleted',
      data: { goalName }
    });
    
    setTimeout(() => {
      this.removeNotification(notificationId);
    }, 5000);
    
    return notificationId;
  }

  addSavingMoneyAddedNotification(goalName: string, amount: number): string {
    const notificationId = this.addNotification({
      type: 'success',
      title: 'Money Added to Goal',
      message: `Successfully added $${amount.toFixed(2)} to "${goalName}"`,
      category: 'saving',
      action: 'saving_money_added',
      data: { goalName, amount }
    });
    
    setTimeout(() => {
      this.removeNotification(notificationId);
    }, 5000);
    
    return notificationId;
  }

  addSavingErrorNotification(action: string, error: string): string {
    return this.addNotification({
      type: 'error',
      title: 'Saving Goal Error',
      message: `Failed to ${action} saving goal: ${error}`,
      category: 'saving',
      action: `saving_${action}_error`
    });
  }

  // ===== INVESTMENT NOTIFICATIONS =====
  addInvestmentCreatedNotification(name: string, amountInvested: number): string {
    const notificationId = this.addNotification({
      type: 'success',
      title: 'Investment Created',
      message: `Successfully created investment: ${name} with $${amountInvested.toFixed(2)}`,
      category: 'general',
      action: 'investment_created',
      data: { name, amountInvested }
    });
    
    // Auto-dismiss after 5 seconds
    setTimeout(() => {
      this.removeNotification(notificationId);
    }, 5000);
    
    return notificationId;
  }

  addInvestmentModifiedNotification(name: string, amountInvested: number): string {
    const notificationId = this.addNotification({
      type: 'success',
      title: 'Investment Modified',
      message: `Successfully updated investment: ${name} to $${amountInvested.toFixed(2)}`,
      category: 'general',
      action: 'investment_modified',
      data: { name, amountInvested }
    });
    
    // Auto-dismiss after 5 seconds
    setTimeout(() => {
      this.removeNotification(notificationId);
    }, 5000);
    
    return notificationId;
  }

  addInvestmentDeletedNotification(name: string): string {
    const notificationId = this.addNotification({
      type: 'success',
      title: 'Investment Deleted',
      message: `Successfully deleted investment: ${name}`,
      category: 'general',
      action: 'investment_deleted',
      data: { name }
    });
    
    // Auto-dismiss after 5 seconds
    setTimeout(() => {
      this.removeNotification(notificationId);
    }, 5000);
    
    return notificationId;
  }

  addInvestmentErrorNotification(action: string, error: string): string {
    return this.addNotification({
      type: 'error',
      title: 'Investment Error',
      message: `Failed to ${action} investment: ${error}`,
      category: 'general',
      action: `investment_${action}_error`
    });
  }

  // ===== DEBT NOTIFICATIONS =====
  addDebtCreatedNotification(creditorName: string, amount: number): string {
    const notificationId = this.addNotification({
      type: 'success',
      title: 'Debt Added',
      message: `Successfully added $${amount.toFixed(2)} debt from ${creditorName}`,
      category: 'debt',
      action: 'debt_created',
      data: { creditorName, amount }
    });
    
    // Auto-dismiss after 5 seconds
    setTimeout(() => {
      this.removeNotification(notificationId);
    }, 5000);
    
    return notificationId;
  }

  addDebtModifiedNotification(creditorName: string, amount: number): string {
    const notificationId = this.addNotification({
      type: 'info',
      title: 'Debt Modified',
      message: `Successfully updated debt to $${amount.toFixed(2)} from ${creditorName}`,
      category: 'debt',
      action: 'debt_modified',
      data: { creditorName, amount }
    });
    
    // Auto-dismiss after 5 seconds
    setTimeout(() => {
      this.removeNotification(notificationId);
    }, 5000);
    
    return notificationId;
  }

  addDebtDeletedNotification(creditorName: string, amount: number): string {
    const notificationId = this.addNotification({
      type: 'warning',
      title: 'Debt Deleted',
      message: `Successfully deleted $${amount.toFixed(2)} debt from ${creditorName}`,
      category: 'debt',
      action: 'debt_deleted',
      data: { creditorName, amount }
    });
    
    // Auto-dismiss after 5 seconds
    setTimeout(() => {
      this.removeNotification(notificationId);
    }, 5000);
    
    return notificationId;
  }

  addDebtErrorNotification(action: string, error: string): string {
    return this.addNotification({
      type: 'error',
      title: 'Debt Error',
      message: `Failed to ${action} debt: ${error}`,
      category: 'debt',
      action: `debt_${action}_error`
    });
  }

  /**
   * Private helper methods
   */
  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  private updateUnreadCount(): void {
    const unreadCount = this.notificationsSubject.value.filter(n => !n.read).length;
    this.unreadCountSubject.next(unreadCount);
  }

}
