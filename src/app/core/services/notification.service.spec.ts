import { TestBed } from '@angular/core/testing';

import { NotificationService } from './notification.service';

describe('NotificationService', () => {
  let service: NotificationService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [NotificationService]
    });
    service = TestBed.inject(NotificationService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('Initialization', () => {
    it('should start with empty notifications', () => {
      service.notifications$.subscribe(notifications => {
        expect(notifications).toEqual([]);
      });
    });

    it('should start with zero unread count', () => {
      service.unreadCount$.subscribe(count => {
        expect(count).toBe(0);
      });
    });
  });

  describe('Add Notification', () => {
    it('should add a new notification', () => {
      const notificationData = {
        type: 'success' as const,
        title: 'Test Notification',
        message: 'This is a test notification',
        category: 'general' as const
      };

      const notificationId = service.addNotification(notificationData);

      expect(notificationId).toBeTruthy();
      expect(typeof notificationId).toBe('string');

      service.notifications$.subscribe(notifications => {
        expect(notifications.length).toBe(1);
        expect(notifications[0].id).toBe(notificationId);
        expect(notifications[0].title).toBe('Test Notification');
        expect(notifications[0].message).toBe('This is a test notification');
        expect(notifications[0].type).toBe('success');
        expect(notifications[0].category).toBe('general');
        expect(notifications[0].read).toBeFalse();
        expect(notifications[0].timestamp).toBeInstanceOf(Date);
      });
    });

    it('should add notification with all properties', () => {
      const notificationData = {
        type: 'error' as const,
        title: 'Error Notification',
        message: 'Something went wrong',
        category: 'income' as const,
        action: 'income_error',
        data: { errorCode: 500 }
      };

      const notificationId = service.addNotification(notificationData);

      service.notifications$.subscribe(notifications => {
        const notification = notifications[0];
        expect(notification.id).toBe(notificationId);
        expect(notification.type).toBe('error');
        expect(notification.title).toBe('Error Notification');
        expect(notification.message).toBe('Something went wrong');
        expect(notification.category).toBe('income');
        expect(notification.action).toBe('income_error');
        expect(notification.data).toEqual({ errorCode: 500 });
        expect(notification.read).toBeFalse();
      });
    });

    it('should limit notifications to 50', () => {
      // Add 55 notifications
      for (let i = 0; i < 55; i++) {
        service.addNotification({
          type: 'info',
          title: `Notification ${i}`,
          message: `Message ${i}`
        });
      }

      service.notifications$.subscribe(notifications => {
        expect(notifications.length).toBe(50);
        // Should keep the most recent 50
        expect(notifications[0].title).toBe('Notification 54');
        expect(notifications[49].title).toBe('Notification 5');
      });
    });

    it('should update unread count when adding notification', () => {
      service.addNotification({
        type: 'info',
        title: 'Test',
        message: 'Test message'
      });

      service.unreadCount$.subscribe(count => {
        expect(count).toBe(1);
      });
    });
  });

  describe('Mark as Read', () => {
    it('should mark specific notification as read', () => {
      const notificationId = service.addNotification({
        type: 'info',
        title: 'Test',
        message: 'Test message'
      });

      service.markAsRead(notificationId);

      service.notifications$.subscribe(notifications => {
        expect(notifications[0].read).toBeTrue();
      });

      service.unreadCount$.subscribe(count => {
        expect(count).toBe(0);
      });
    });

    it('should not affect other notifications when marking one as read', () => {
      const id1 = service.addNotification({
        type: 'info',
        title: 'Notification 1',
        message: 'Message 1'
      });

      const id2 = service.addNotification({
        type: 'warning',
        title: 'Notification 2',
        message: 'Message 2'
      });

      service.markAsRead(id1);

      service.notifications$.subscribe(notifications => {
        expect(notifications[0].id).toBe(id2);
        expect(notifications[0].read).toBeFalse();
        expect(notifications[1].id).toBe(id1);
        expect(notifications[1].read).toBeTrue();
      });

      service.unreadCount$.subscribe(count => {
        expect(count).toBe(1);
      });
    });
  });

  describe('Mark All as Read', () => {
    it('should mark all notifications as read', () => {
      service.addNotification({
        type: 'info',
        title: 'Notification 1',
        message: 'Message 1'
      });

      service.addNotification({
        type: 'warning',
        title: 'Notification 2',
        message: 'Message 2'
      });

      service.markAllAsRead();

      service.notifications$.subscribe(notifications => {
        expect(notifications.every(n => n.read)).toBeTrue();
      });

      service.unreadCount$.subscribe(count => {
        expect(count).toBe(0);
      });
    });
  });

  describe('Remove Notification', () => {
    it('should remove specific notification', () => {
      const id1 = service.addNotification({
        type: 'info',
        title: 'Notification 1',
        message: 'Message 1'
      });

      const id2 = service.addNotification({
        type: 'warning',
        title: 'Notification 2',
        message: 'Message 2'
      });

      service.removeNotification(id1);

      service.notifications$.subscribe(notifications => {
        expect(notifications.length).toBe(1);
        expect(notifications[0].id).toBe(id2);
      });

      service.unreadCount$.subscribe(count => {
        expect(count).toBe(1);
      });
    });

    it('should handle removing non-existent notification gracefully', () => {
      service.addNotification({
        type: 'info',
        title: 'Test',
        message: 'Test message'
      });

      service.removeNotification('non-existent-id');

      service.notifications$.subscribe(notifications => {
        expect(notifications.length).toBe(1);
      });
    });
  });

  describe('Clear All Notifications', () => {
    it('should clear all notifications', () => {
      service.addNotification({
        type: 'info',
        title: 'Notification 1',
        message: 'Message 1'
      });

      service.addNotification({
        type: 'warning',
        title: 'Notification 2',
        message: 'Message 2'
      });

      service.clearAllNotifications();

      service.notifications$.subscribe(notifications => {
        expect(notifications).toEqual([]);
      });

      service.unreadCount$.subscribe(count => {
        expect(count).toBe(0);
      });
    });
  });

  describe('Get Notifications by Category', () => {
    it('should return notifications filtered by category', () => {
      service.addNotification({
        type: 'info',
        title: 'General Notification',
        message: 'General message',
        category: 'general'
      });

      service.addNotification({
        type: 'success',
        title: 'Income Notification',
        message: 'Income message',
        category: 'income'
      });

      service.addNotification({
        type: 'warning',
        title: 'Expense Notification',
        message: 'Expense message',
        category: 'expense'
      });

      service.getNotificationsByCategory('income').subscribe(notifications => {
        expect(notifications.length).toBe(1);
        expect(notifications[0].category).toBe('income');
        expect(notifications[0].title).toBe('Income Notification');
      });
    });

    it('should return empty array for non-existent category', () => {
      service.addNotification({
        type: 'info',
        title: 'Test',
        message: 'Test message',
        category: 'general'
      });

      service.getNotificationsByCategory('non-existent').subscribe(notifications => {
        expect(notifications).toEqual([]);
      });
    });
  });

  describe('Income-specific Notifications', () => {
    beforeEach(() => {
      jasmine.clock().install();
    });

    afterEach(() => {
      jasmine.clock().uninstall();
    });

    describe('Add Income Created Notification', () => {
      it('should add income created notification', () => {
        const notificationId = service.addIncomeCreatedNotification(1000, 'Salary');

        expect(notificationId).toBeTruthy();

        service.notifications$.subscribe(notifications => {
          const notification = notifications[0];
          expect(notification.type).toBe('success');
          expect(notification.title).toBe('Income Added');
          expect(notification.message).toBe('Successfully added $1000.00 from Salary');
          expect(notification.category).toBe('income');
          expect(notification.action).toBe('income_created');
          expect(notification.data).toEqual({ amount: 1000, source: 'Salary' });
        });
      });

      it('should create notification with correct properties', () => {
        const notificationId = service.addIncomeCreatedNotification(1000, 'Salary');

        expect(notificationId).toBeTruthy();

        service.notifications$.subscribe(notifications => {
          const notification = notifications[0];
          expect(notification.type).toBe('success');
          expect(notification.title).toBe('Income Added');
          expect(notification.message).toBe('Successfully added $1000.00 from Salary');
          expect(notification.category).toBe('income');
          expect(notification.action).toBe('income_created');
          expect(notification.data).toEqual({ amount: 1000, source: 'Salary' });
        });
      });
    });

    describe('Add Income Modified Notification', () => {
      it('should add income modified notification', () => {
        const notificationId = service.addIncomeModifiedNotification(1500, 'Freelance');

        expect(notificationId).toBeTruthy();

        service.notifications$.subscribe(notifications => {
          const notification = notifications[0];
          expect(notification.type).toBe('info');
          expect(notification.title).toBe('Income Modified');
          expect(notification.message).toBe('Successfully updated income to $1500.00 from Freelance');
          expect(notification.category).toBe('income');
          expect(notification.action).toBe('income_modified');
          expect(notification.data).toEqual({ amount: 1500, source: 'Freelance' });
        });
      });

      it('should create notification with correct properties', () => {
        const notificationId = service.addIncomeModifiedNotification(1500, 'Freelance');

        expect(notificationId).toBeTruthy();

        service.notifications$.subscribe(notifications => {
          const notification = notifications[0];
          expect(notification.type).toBe('info');
          expect(notification.title).toBe('Income Modified');
          expect(notification.message).toBe('Successfully updated income to $1500.00 from Freelance');
          expect(notification.category).toBe('income');
          expect(notification.action).toBe('income_modified');
          expect(notification.data).toEqual({ amount: 1500, source: 'Freelance' });
        });
      });
    });

    describe('Add Income Deleted Notification', () => {
      it('should add income deleted notification', () => {
        const notificationId = service.addIncomeDeletedNotification(2000, 'Bonus');

        expect(notificationId).toBeTruthy();

        service.notifications$.subscribe(notifications => {
          const notification = notifications[0];
          expect(notification.type).toBe('warning');
          expect(notification.title).toBe('Income Deleted');
          expect(notification.message).toBe('Successfully deleted $2000.00 from Bonus');
          expect(notification.category).toBe('income');
          expect(notification.action).toBe('income_deleted');
          expect(notification.data).toEqual({ amount: 2000, source: 'Bonus' });
        });
      });

      it('should create notification with correct properties', () => {
        const notificationId = service.addIncomeDeletedNotification(2000, 'Bonus');

        expect(notificationId).toBeTruthy();

        service.notifications$.subscribe(notifications => {
          const notification = notifications[0];
          expect(notification.type).toBe('warning');
          expect(notification.title).toBe('Income Deleted');
          expect(notification.message).toBe('Successfully deleted $2000.00 from Bonus');
          expect(notification.category).toBe('income');
          expect(notification.action).toBe('income_deleted');
          expect(notification.data).toEqual({ amount: 2000, source: 'Bonus' });
        });
      });
    });

    describe('Add Income Error Notification', () => {
      it('should add income error notification', () => {
        const notificationId = service.addIncomeErrorNotification('create', 'Server error');

        expect(notificationId).toBeTruthy();

        service.notifications$.subscribe(notifications => {
          const notification = notifications[0];
          expect(notification.type).toBe('error');
          expect(notification.title).toBe('Income Error');
          expect(notification.message).toBe('Failed to create income: Server error');
          expect(notification.category).toBe('income');
          expect(notification.action).toBe('income_create_error');
        });
      });

      it('should create error notification with correct properties', () => {
        const notificationId = service.addIncomeErrorNotification('create', 'Server error');

        expect(notificationId).toBeTruthy();

        service.notifications$.subscribe(notifications => {
          const notification = notifications[0];
          expect(notification.type).toBe('error');
          expect(notification.title).toBe('Income Error');
          expect(notification.message).toBe('Failed to create income: Server error');
          expect(notification.category).toBe('income');
          expect(notification.action).toBe('income_create_error');
        });
      });
    });
  });

  describe('Unread Count Management', () => {
    it('should update unread count correctly with multiple notifications', (done) => {
      let notificationId1: string;
      let notificationId2: string;
      
      // Add first notification
      notificationId1 = service.addNotification({
        type: 'info',
        title: 'Notification 1',
        message: 'Message 1'
      });

      // Add second notification
      notificationId2 = service.addNotification({
        type: 'warning',
        title: 'Notification 2',
        message: 'Message 2'
      });

      // Check initial count
      service.unreadCount$.subscribe(count => {
        if (count === 2) {
          // Mark first as read
          service.markAsRead(notificationId1);
          
          // Check count after marking one as read
          service.unreadCount$.subscribe(count2 => {
            if (count2 === 1) {
              // Mark all as read
              service.markAllAsRead();
              
              // Check final count
              service.unreadCount$.subscribe(count3 => {
                if (count3 === 0) {
                  done();
                }
              });
            }
          });
        }
      });
    });

    it('should handle unread count when removing notifications', (done) => {
      const id1 = service.addNotification({
        type: 'info',
        title: 'Notification 1',
        message: 'Message 1'
      });

      const id2 = service.addNotification({
        type: 'warning',
        title: 'Notification 2',
        message: 'Message 2'
      });

      // Check initial count
      service.unreadCount$.subscribe(count => {
        if (count === 2) {
          service.removeNotification(id1);
          
          // Check count after removing one
          service.unreadCount$.subscribe(count2 => {
            if (count2 === 1) {
              service.removeNotification(id2);
              
              // Check final count
              service.unreadCount$.subscribe(count3 => {
                if (count3 === 0) {
                  done();
                }
              });
            }
          });
        }
      });
    });
  });

  describe('ID Generation', () => {
    it('should generate unique IDs', () => {
      const id1 = service.addNotification({
        type: 'info',
        title: 'Test 1',
        message: 'Message 1'
      });

      const id2 = service.addNotification({
        type: 'info',
        title: 'Test 2',
        message: 'Message 2'
      });

      expect(id1).not.toBe(id2);
      expect(typeof id1).toBe('string');
      expect(typeof id2).toBe('string');
    });
  });
});
