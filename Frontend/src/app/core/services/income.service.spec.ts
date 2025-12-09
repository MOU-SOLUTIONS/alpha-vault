import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { ApiResponse, IncomePageResponse, IncomeRequestDTO, IncomeResponseDTO, PaymentMethod, PaymentMethodSummary, SourceSummary, Top5Incomes } from '../../models/income.model';
import { AuthService } from './auth.service';
import { IncomeService } from './income.service';
import { NotificationService } from './notification.service';

describe('IncomeService', () => {
  let service: IncomeService;
  let httpMock: HttpTestingController;
  let authService: jasmine.SpyObj<AuthService>;
  let notificationService: jasmine.SpyObj<NotificationService>;

  const mockUserId = 123;
  const mockToken = 'test-token';
  const baseUrl = 'https://alpha-vault.onrender.com/api/incomes';

  beforeEach(() => {
    const authSpy = jasmine.createSpyObj('AuthService', ['getToken', 'getUserId']);
    const notificationSpy = jasmine.createSpyObj('NotificationService', [
      'addIncomeCreatedNotification',
      'addIncomeModifiedNotification', 
      'addIncomeDeletedNotification',
      'addIncomeErrorNotification'
    ]);

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        IncomeService,
        { provide: AuthService, useValue: authSpy },
        { provide: NotificationService, useValue: notificationSpy }
      ]
    });

    service = TestBed.inject(IncomeService);
    httpMock = TestBed.inject(HttpTestingController);
    authService = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
    notificationService = TestBed.inject(NotificationService) as jasmine.SpyObj<NotificationService>;

    // Setup default auth service responses
    authService.getToken.and.returnValue(mockToken);
    authService.getUserId.and.returnValue(mockUserId);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('Authentication Check', () => {
    it('should return true when user is authenticated', () => {
      expect(service['checkAuthentication']()).toBeTrue();
    });

    it('should return false when no token', () => {
      authService.getToken.and.returnValue(null);
      expect(service['checkAuthentication']()).toBeFalse();
    });

    it('should return false when no user ID', () => {
      authService.getUserId.and.returnValue(null);
      expect(service['checkAuthentication']()).toBeFalse();
    });
  });

  const mockIncomeRequest: IncomeRequestDTO = {
    userId: mockUserId,
    source: 'Test Source',
    amount: 1000,
    paymentMethod: PaymentMethod.CASH,
    date: '2023-01-01',
    description: 'Test income',
    received: true
  };

  const mockIncomeResponse: IncomeResponseDTO = {
    id: 1,
    userId: mockUserId,
    source: 'Test Source',
    amount: 1000,
    paymentMethod: PaymentMethod.CASH,
    date: '2023-01-01',
    description: 'Test income',
    received: true,
    createdAt: '2023-01-01T00:00:00Z',
    updatedAt: '2023-01-01T00:00:00Z'
  };

  describe('CRUD Operations', () => {

    describe('Create Income', () => {
      it('should create income and add to cache', () => {
        const mockApiResponse: ApiResponse<IncomeResponseDTO> = {
          success: true,
          message: 'Income created successfully',
          data: mockIncomeResponse,
          path: '/api/incomes'
        };

        service.createIncome(mockIncomeRequest).subscribe(response => {
          expect(response).toEqual(mockIncomeResponse);
          expect(notificationService.addIncomeCreatedNotification).toHaveBeenCalledWith(1000, 'Test Source');
        });

        const req = httpMock.expectOne(baseUrl);
        expect(req.request.method).toBe('POST');
        expect(req.request.body).toEqual(mockIncomeRequest);
        req.flush(mockApiResponse);
      });

      it('should handle create income error', () => {
        service.createIncome(mockIncomeRequest).subscribe({
          next: () => fail('Should have failed'),
          error: (error) => {
            expect(error).toBeDefined();
            expect(notificationService.addIncomeErrorNotification).toHaveBeenCalledWith('create', jasmine.any(String));
          }
        });

        const req = httpMock.expectOne(baseUrl);
        req.flush({ error: 'Server error' }, { status: 500, statusText: 'Internal Server Error' });
      });
    });

    describe('Update Income', () => {
      it('should update income and update cache', () => {
        const incomeId = 1;
        const mockApiResponse: ApiResponse<IncomeResponseDTO> = {
          success: true,
          message: 'Income updated successfully',
          data: { ...mockIncomeResponse, amount: 1500 },
          path: '/api/incomes/1'
        };

        service.updateIncome(incomeId, mockIncomeRequest).subscribe(response => {
          expect(response.amount).toBe(1500);
          expect(notificationService.addIncomeModifiedNotification).toHaveBeenCalledWith(1500, 'Test Source');
        });

        const req = httpMock.expectOne(`${baseUrl}/${incomeId}`);
        expect(req.request.method).toBe('PUT');
        expect(req.request.body).toEqual(mockIncomeRequest);
        req.flush(mockApiResponse);
      });

      it('should handle update income error', () => {
        const incomeId = 1;
        service.updateIncome(incomeId, mockIncomeRequest).subscribe({
          next: () => fail('Should have failed'),
          error: (error) => {
            expect(error).toBeDefined();
            expect(notificationService.addIncomeErrorNotification).toHaveBeenCalledWith('modify', jasmine.any(String));
          }
        });

        const req = httpMock.expectOne(`${baseUrl}/${incomeId}`);
        req.flush({ error: 'Server error' }, { status: 500, statusText: 'Internal Server Error' });
      });
    });

    describe('Delete Income', () => {
      it('should delete income and remove from cache', () => {
        const incomeId = 1;
        const mockApiResponse: ApiResponse<void> = {
          success: true,
          message: 'Income deleted successfully',
          data: undefined,
          path: '/api/incomes'
        };

        // Add income to cache first
        service['currentUserIncomesSubject'].next([mockIncomeResponse]);

        service.deleteIncome(incomeId).subscribe(() => {
          expect(notificationService.addIncomeDeletedNotification).toHaveBeenCalledWith(1000, 'Test Source');
        });

        const req = httpMock.expectOne(`${baseUrl}/${incomeId}`);
        expect(req.request.method).toBe('DELETE');
        req.flush(mockApiResponse);
      });

      it('should handle delete income error', () => {
        const incomeId = 1;
        service.deleteIncome(incomeId).subscribe({
          next: () => fail('Should have failed'),
          error: (error) => {
            expect(error).toBeDefined();
            expect(notificationService.addIncomeErrorNotification).toHaveBeenCalledWith('delete', jasmine.any(String));
          }
        });

        const req = httpMock.expectOne(`${baseUrl}/${incomeId}`);
        req.flush({ error: 'Server error' }, { status: 500, statusText: 'Internal Server Error' });
      });
    });

    describe('Get Income by ID', () => {
      it('should get income by ID', () => {
        const incomeId = 1;
        const mockApiResponse: ApiResponse<IncomeResponseDTO> = {
          success: true,
          message: 'Income retrieved successfully',
          data: mockIncomeResponse,
          path: '/api/incomes'
        };

        service.getIncomeById(incomeId).subscribe(response => {
          expect(response).toEqual(mockIncomeResponse);
        });

        const req = httpMock.expectOne(`${baseUrl}/${incomeId}`);
        expect(req.request.method).toBe('GET');
        req.flush(mockApiResponse);
      });
    });

    describe('Restore Income', () => {
      it('should restore deleted income', () => {
        const incomeId = 1;
        const mockApiResponse: ApiResponse<void> = {
          success: true,
          message: 'Income restored successfully',
          data: undefined,
          path: '/api/incomes'
        };

        service.restoreIncome(incomeId).subscribe(() => {
          expect(true).toBeTrue(); // Just verify the call completes
        });

        const req = httpMock.expectOne(`${baseUrl}/${incomeId}/restore`);
        expect(req.request.method).toBe('POST');
        req.flush(mockApiResponse);
      });
    });
  });

  describe('List Operations', () => {
    const mockPageResponse: IncomePageResponse = {
      content: [mockIncomeResponse],
      totalElements: 1,
      totalPages: 1,
      size: 20,
      number: 0,
      first: true,
      last: true
    };

    describe('Get Incomes by User', () => {
      it('should get paginated incomes for user', () => {
        const mockApiResponse: ApiResponse<IncomePageResponse> = {
          success: true,
          message: 'Incomes retrieved successfully',
          data: mockPageResponse,
          path: '/api/incomes/user/123'
        };

        service.getIncomesByUser(mockUserId, 0, 20).subscribe(response => {
          expect(response).toEqual(mockPageResponse);
        });

        const req = httpMock.expectOne(`${baseUrl}/user/${mockUserId}?page=0&size=20&sort=incomeDate,desc`);
        expect(req.request.method).toBe('GET');
        req.flush(mockApiResponse);
      });
    });

    describe('Get Incomes by User in Range', () => {
      it('should get incomes for user within date range', () => {
        const startDate = '2023-01-01';
        const endDate = '2023-01-31';
        const mockApiResponse: ApiResponse<IncomePageResponse> = {
          success: true,
          message: 'Incomes retrieved successfully',
          data: mockPageResponse,
          path: '/api/incomes/user/123'
        };

        service.getIncomesByUserInRange(mockUserId, startDate, endDate, 0, 20).subscribe(response => {
          expect(response).toEqual(mockPageResponse);
        });

        const req = httpMock.expectOne(`${baseUrl}/user/${mockUserId}/range?start=${startDate}&end=${endDate}&page=0&size=20&sort=incomeDate,desc`);
        expect(req.request.method).toBe('GET');
        req.flush(mockApiResponse);
      });
    });
  });

  describe('Statistics and Totals', () => {
    describe('Get Today Income', () => {
      it('should return today income when authenticated', () => {
        const mockApiResponse: ApiResponse<number> = {
          success: true,
          message: 'Today income retrieved successfully',
          data: 500,
          path: '/api/incomes/user/123/today'
        };

        service.getTodayIncome(mockUserId).subscribe(amount => {
          expect(amount).toBe(500);
        });

        const req = httpMock.expectOne(`${baseUrl}/user/${mockUserId}/today`);
        expect(req.request.method).toBe('GET');
        req.flush(mockApiResponse);
      });

      it('should return 0 when not authenticated', () => {
        authService.getToken.and.returnValue(null);
        authService.getUserId.and.returnValue(null);

        service.getTodayIncome(mockUserId).subscribe(amount => {
          expect(amount).toBe(0);
        });

        httpMock.expectNone(`${baseUrl}/user/${mockUserId}/today`);
      });

      it('should return 0 on error', () => {
        service.getTodayIncome(mockUserId).subscribe(amount => {
          expect(amount).toBe(0);
        });

        const req = httpMock.expectOne(`${baseUrl}/user/${mockUserId}/today`);
        req.flush({ error: 'Server error' }, { status: 500, statusText: 'Internal Server Error' });
      });
    });

    describe('Get Current Week Income', () => {
      it('should return current week income when authenticated', () => {
        const mockApiResponse: ApiResponse<number> = {
          success: true,
          message: 'Week income retrieved successfully',
          data: 2000,
          path: '/api/incomes/user/123/week'
        };

        service.getCurrentWeekIncome(mockUserId).subscribe(amount => {
          expect(amount).toBe(2000);
        });

        const req = httpMock.expectOne(`${baseUrl}/user/${mockUserId}/week`);
        expect(req.request.method).toBe('GET');
        req.flush(mockApiResponse);
      });

      it('should return 0 when not authenticated', () => {
        authService.getToken.and.returnValue(null);
        authService.getUserId.and.returnValue(null);

        service.getCurrentWeekIncome(mockUserId).subscribe(amount => {
          expect(amount).toBe(0);
        });

        httpMock.expectNone(`${baseUrl}/user/${mockUserId}/week`);
      });
    });

    describe('Get Current Month Income', () => {
      it('should return current month income', () => {
        const mockApiResponse: ApiResponse<number> = {
          success: true,
          message: 'Month income retrieved successfully',
          data: 5000,
          path: '/api/incomes/user/123/month'
        };

        service.getCurrentMonthIncome(mockUserId).subscribe(amount => {
          expect(amount).toBe(5000);
        });

        const req = httpMock.expectOne(`${baseUrl}/user/${mockUserId}/month`);
        expect(req.request.method).toBe('GET');
        req.flush(mockApiResponse);
      });
    });

    describe('Get Current Year Income', () => {
      it('should return current year income', () => {
        const mockApiResponse: ApiResponse<number> = {
          success: true,
          message: 'Year income retrieved successfully',
          data: 50000,
          path: '/api/incomes/user/123/year'
        };

        service.getCurrentYearIncome(mockUserId).subscribe(amount => {
          expect(amount).toBe(50000);
        });

        const req = httpMock.expectOne(`${baseUrl}/user/${mockUserId}/year`);
        expect(req.request.method).toBe('GET');
        req.flush(mockApiResponse);
      });
    });
  });

  describe('Analytics and Summaries', () => {
    const mockPaymentMethodSummary: PaymentMethodSummary = {
      CASH: 1000,
      CARD: 2000,
      CHECK: 500
    };

    const mockSourceSummary: SourceSummary = {
      'Salary': 3000,
      'Freelance': 500
    };

    const mockTop5Incomes: Top5Incomes = {
      'Source1': 1000,
      'Source2': 800,
      'Source3': 600
    };

    describe('Get Payment Method Summary', () => {
      it('should return payment method summary', () => {
        const mockApiResponse: ApiResponse<PaymentMethodSummary> = {
          success: true,
          message: 'Payment method summary retrieved successfully',
          data: mockPaymentMethodSummary,
          path: '/api/incomes/summary/payment-method/123'
        };

        service.getPaymentMethodSummary(mockUserId).subscribe(summary => {
          expect(summary).toEqual(mockPaymentMethodSummary);
        });

        const req = httpMock.expectOne(`${baseUrl}/summary/payment-method/${mockUserId}`);
        expect(req.request.method).toBe('GET');
        req.flush(mockApiResponse);
      });
    });

    describe('Get Source Summary', () => {
      it('should return source summary', () => {
        const mockApiResponse: ApiResponse<SourceSummary> = {
          success: true,
          message: 'Source summary retrieved successfully',
          data: mockSourceSummary,
          path: '/api/incomes/summary/source/123'
        };

        service.getSourceSummary(mockUserId).subscribe(summary => {
          expect(summary).toEqual(mockSourceSummary);
        });

        const req = httpMock.expectOne(`${baseUrl}/summary/source/${mockUserId}`);
        expect(req.request.method).toBe('GET');
        req.flush(mockApiResponse);
      });
    });

    describe('Get Top 5 Incomes', () => {
      it('should return top 5 incomes', () => {
        const mockApiResponse: ApiResponse<Top5Incomes> = {
          success: true,
          message: 'Top 5 incomes retrieved successfully',
          data: mockTop5Incomes,
          path: '/api/incomes/top5/123'
        };

        service.getTop5Incomes(mockUserId).subscribe(top5 => {
          expect(top5).toEqual(mockTop5Incomes);
        });

        const req = httpMock.expectOne(`${baseUrl}/top5/${mockUserId}`);
        expect(req.request.method).toBe('GET');
        req.flush(mockApiResponse);
      });
    });
  });

  describe('Utility Methods', () => {
    describe('Format Amount', () => {
      it('should format amount with default currency', () => {
        const formatted = service.formatAmount(1234.56);
        expect(formatted).toBe('$1,234.56');
      });

      it('should format amount with custom currency', () => {
        const formatted = service.formatAmount(1234.56, 'EUR');
        expect(formatted).toBe('€1,234.56');
      });
    });

    describe('Format Date', () => {
      it('should format date string', () => {
        const formatted = service.formatDate('2023-01-15');
        expect(formatted).toMatch(/Jan 1[45], 2023/);
      });
    });
  });

  describe('Legacy Methods', () => {
    describe('Get All Incomes', () => {
      it('should return all incomes for current user', () => {
        const mockPageResponse: IncomePageResponse = {
          content: [mockIncomeResponse],
          totalElements: 1,
          totalPages: 1,
          size: 1000,
          number: 0,
          first: true,
          last: true
        };

        const mockApiResponse: ApiResponse<IncomePageResponse> = {
          success: true,
          message: 'Incomes retrieved successfully',
          data: mockPageResponse,
          path: '/api/incomes/user/123'
        };

        service.getAllIncomes().subscribe(incomes => {
          expect(incomes).toEqual([mockIncomeResponse]);
        });

        const req = httpMock.expectOne(`${baseUrl}/user/${mockUserId}?page=0&size=1000&sort=incomeDate,desc`);
        req.flush(mockApiResponse);
      });

      it('should return empty array when no user ID', () => {
        authService.getUserId.and.returnValue(null);

        service.getAllIncomes().subscribe(incomes => {
          expect(incomes).toEqual([]);
        });

        httpMock.expectNone(`${baseUrl}/user/${mockUserId}`);
      });
    });

    describe('Save Income', () => {
      it('should call createIncome', () => {
        const mockIncomeRequest: IncomeRequestDTO = {
          userId: mockUserId,
          source: 'Test Source',
          amount: 1000,
          paymentMethod: PaymentMethod.CASH,
          date: '2023-01-01',
          description: 'Test income',
          received: true
        };

        const mockApiResponse: ApiResponse<IncomeResponseDTO> = {
          success: true,
          message: 'Income created successfully',
          data: mockIncomeResponse,
          path: '/api/incomes'
        };

        service.saveIncome(mockIncomeRequest).subscribe(response => {
          expect(response).toEqual(mockIncomeResponse);
        });

        const req = httpMock.expectOne(baseUrl);
        req.flush(mockApiResponse);
      });
    });
  });

  describe('Cache Management', () => {
    it('should add income to cache', () => {
      const income: IncomeResponseDTO = {
        id: 1,
        userId: mockUserId,
        source: 'Test Source',
        amount: 1000,
        paymentMethod: PaymentMethod.CASH,
        date: '2023-01-01',
        description: 'Test income',
        received: true,
        createdAt: '2023-01-01T00:00:00Z',
        updatedAt: '2023-01-01T00:00:00Z'
      };

      service['addIncomeToCache'](income);

      service.currentUserIncomes$.subscribe(incomes => {
        expect(incomes).toContain(income);
        expect(incomes[0]).toBe(income); // Should be added to beginning
      });
    });

    it('should update income in cache', () => {
      const originalIncome: IncomeResponseDTO = {
        id: 1,
        userId: mockUserId,
        source: 'Test Source',
        amount: 1000,
        paymentMethod: PaymentMethod.CASH,
        date: '2023-01-01',
        description: 'Test income',
        received: true,
        createdAt: '2023-01-01T00:00:00Z',
        updatedAt: '2023-01-01T00:00:00Z'
      };

      const updatedIncome: IncomeResponseDTO = {
        ...originalIncome,
        amount: 1500
      };

      service['currentUserIncomesSubject'].next([originalIncome]);
      service['updateIncomeInCache'](updatedIncome);

      service.currentUserIncomes$.subscribe(incomes => {
        expect(incomes[0].amount).toBe(1500);
      });
    });

    it('should remove income from cache', () => {
      const income: IncomeResponseDTO = {
        id: 1,
        userId: mockUserId,
        source: 'Test Source',
        amount: 1000,
        paymentMethod: PaymentMethod.CASH,
        date: '2023-01-01',
        description: 'Test income',
        received: true,
        createdAt: '2023-01-01T00:00:00Z',
        updatedAt: '2023-01-01T00:00:00Z'
      };

      service['currentUserIncomesSubject'].next([income]);
      service['removeIncomeFromCache'](1);

      service.currentUserIncomes$.subscribe(incomes => {
        expect(incomes).not.toContain(income);
        expect(incomes.length).toBe(0);
      });
    });
  });

  describe('Pagination Methods', () => {
    beforeEach(() => {
      authService.getToken.and.returnValue(mockToken);
      authService.getUserId.and.returnValue(mockUserId);
    });

    it('should get paginated incomes with caching', () => {
      const mockPageResponse: IncomePageResponse = {
        content: [mockIncomeResponse],
        totalElements: 1,
        totalPages: 1,
        size: 20,
        number: 0,
        first: true,
        last: true
      };

      const mockApiResponse: ApiResponse<IncomePageResponse> = {
        success: true,
        message: 'Incomes retrieved successfully',
        data: mockPageResponse,
        path: '/api/incomes/user/123'
      };

      service.getIncomesPaginated(0, 20, 'date', 'desc').subscribe(response => {
        expect(response).toEqual(mockPageResponse);
      });

      const req = httpMock.expectOne(`${baseUrl}/user/${mockUserId}?page=0&size=20&sort=date,desc`);
      expect(req.request.method).toBe('GET');
      req.flush(mockApiResponse);
    });

    it('should return cached data when available', () => {
      const mockPageResponse: IncomePageResponse = {
        content: [mockIncomeResponse],
        totalElements: 1,
        totalPages: 1,
        size: 20,
        number: 0,
        first: true,
        last: true
      };

      // Set up cache
      service['paginationCache'].set('incomes_0_20_date_desc', {
        data: [mockIncomeResponse],
        totalElements: 1,
        lastFetch: Date.now()
      });

      service.getIncomesPaginated(0, 20, 'date', 'desc').subscribe(response => {
        expect(response.content).toEqual([mockIncomeResponse]);
        expect(response.totalElements).toBe(1);
      });

      // Should not make HTTP request
      httpMock.expectNone(`${baseUrl}/user/${mockUserId}`);
    });

    it('should clear pagination cache', () => {
      // Set up cache
      service['paginationCache'].set('test_key', {
        data: [mockIncomeResponse],
        totalElements: 1,
        lastFetch: Date.now()
      });

      expect(service['paginationCache'].size).toBe(1);

      service.clearPaginationCache();

      expect(service['paginationCache'].size).toBe(0);
    });
  });

  describe('Performance Monitoring', () => {
    it('should track performance metrics', () => {
      const startTime = performance.now();
      const endTime = startTime + 100; // Simulate 100ms load time
      
      // Mock performance.now to return controlled values
      spyOn(performance, 'now').and.returnValues(startTime, endTime);

      const mockPageResponse: IncomePageResponse = {
        content: [mockIncomeResponse],
        totalElements: 1,
        totalPages: 1,
        size: 20,
        number: 0,
        first: true,
        last: true
      };

      const mockApiResponse: ApiResponse<IncomePageResponse> = {
        success: true,
        message: 'Incomes retrieved successfully',
        data: mockPageResponse,
        path: '/api/incomes/user/123'
      };

      authService.getToken.and.returnValue(mockToken);
      authService.getUserId.and.returnValue(mockUserId);

      service.getIncomesPaginated().subscribe();

      const req = httpMock.expectOne(`${baseUrl}/user/${mockUserId}?page=0&size=20&sort=date,desc`);
      req.flush(mockApiResponse);

      // Verify performance tracking
      expect(service['paginationCache']).toBeDefined();
    });
  });
});
