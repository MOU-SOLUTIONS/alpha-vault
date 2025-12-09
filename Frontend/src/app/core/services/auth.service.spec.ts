import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { ApiResponse, ChangePasswordResponseDTO, LoginRequestDTO, PasswordResetResponseDTO, RegisterResponseDTO } from '../../models/auth.model';
import { UserRequestDTO } from '../../models/user.model';
import { AuthService } from './auth.service';

describe('AuthService', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [AuthService]
    });
    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
    
    // Clear localStorage before each test
    localStorage.clear();
  });

  afterEach(() => {
    httpMock.verify();
    localStorage.clear();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('Token Management', () => {
    it('should return null when no token is stored', () => {
      expect(service.getToken()).toBeNull();
    });

    it('should return stored token', () => {
      localStorage.setItem('token', 'test-token');
      expect(service.getToken()).toBe('test-token');
    });

    it('should set auth data correctly', () => {
      const token = 'test-token';
      const userId = 123;
      
      service.setAuthData(token, userId);
      
      expect(localStorage.getItem('token')).toBe(token);
      expect(localStorage.getItem('userId')).toBe(userId.toString());
    });
  });

  describe('User ID Management', () => {
    it('should return null when no user ID is stored', () => {
      expect(service.getUserId()).toBeNull();
    });

    it('should return stored user ID as number', () => {
      localStorage.setItem('userId', '123');
      expect(service.getUserId()).toBe(123);
    });

    it('should handle invalid user ID gracefully', () => {
      localStorage.setItem('userId', 'invalid');
      expect(service.getUserId()).toBeNaN();
    });
  });

  describe('Authentication Status', () => {
    it('should return false when not authenticated', () => {
      expect(service.isAuthenticated()).toBeFalse();
    });

    it('should return true with JWT token and user ID', () => {
      localStorage.setItem('token', 'test-token');
      localStorage.setItem('userId', '123');
      expect(service.isAuthenticated()).toBeTrue();
    });

    it('should return true with session auth and user data', () => {
      localStorage.setItem('authType', 'session');
      localStorage.setItem('currentUser', JSON.stringify({ id: 123, name: 'Test User' }));
      expect(service.isAuthenticated()).toBeTrue();
    });

    it('should return false with only token but no user ID', () => {
      localStorage.setItem('token', 'test-token');
      expect(service.isAuthenticated()).toBeFalse();
    });

    it('should return false with only user ID but no token', () => {
      localStorage.setItem('userId', '123');
      expect(service.isAuthenticated()).toBeFalse();
    });
  });

  describe('User Data Management', () => {
    it('should return null when no current user is stored', () => {
      expect(service.getCurrentUser()).toBeNull();
    });

    it('should return stored current user', () => {
      const user = { id: 123, name: 'Test User' };
      service.setCurrentUser(user);
      expect(service.getCurrentUser()).toEqual(user);
    });

    it('should handle invalid JSON gracefully', () => {
      localStorage.setItem('currentUser', 'invalid-json');
      expect(() => service.getCurrentUser()).toThrow();
    });
  });

  describe('Logout', () => {
    it('should clear all auth data', () => {
      localStorage.setItem('token', 'test-token');
      localStorage.setItem('userId', '123');
      localStorage.setItem('authType', 'jwt');
      localStorage.setItem('currentUser', JSON.stringify({ id: 123 }));
      
      service.logout();
      
      expect(localStorage.getItem('token')).toBeNull();
      expect(localStorage.getItem('userId')).toBeNull();
      expect(localStorage.getItem('authType')).toBeNull();
      // Note: currentUser is not cleared in logout, only token, userId, and authType
    });

    it('should set userId to 0 in subject', () => {
      service.logout();
      service.userId$.subscribe(userId => {
        expect(userId).toBe(0);
      });
    });
  });

  describe('HTTP Operations', () => {
    const baseUrl = 'https://alpha-vault.onrender.com/api/auth';

    describe('Login', () => {
      it('should make POST request to login endpoint', () => {
        const loginData: LoginRequestDTO = {
          email: 'test@example.com',
          password: 'password123'
        };
        const mockResponse: ApiResponse<any> = {
          success: true,
          message: 'Login successful',
          data: { token: 'jwt-token', user: { id: 1 } },
          path: '/api/auth/login'
        };

        service.login(loginData).subscribe(response => {
          expect(response).toEqual(mockResponse);
        });

        const req = httpMock.expectOne(`${baseUrl}/login`);
        expect(req.request.method).toBe('POST');
        expect(req.request.body).toEqual(loginData);
        req.flush(mockResponse);
      });
    });

    describe('Register', () => {
      it('should make POST request to register endpoint', () => {
        const registerData: UserRequestDTO = {
          firstName: 'John',
          lastName: 'Doe',
          email: 'john@example.com',
          password: 'password123'
        };
        const mockResponse: ApiResponse<RegisterResponseDTO> = {
          success: true,
          message: 'Registration successful',
          data: { user: { id: 1, email: 'john@example.com' }, message: 'User registered successfully' },
          path: '/api/auth/register'
        };

        service.register(registerData).subscribe(response => {
          expect(response).toEqual(mockResponse);
        });

        const req = httpMock.expectOne(`${baseUrl}/register`);
        expect(req.request.method).toBe('POST');
        expect(req.request.body).toEqual(registerData);
        req.flush(mockResponse);
      });
    });

    describe('Forgot Password', () => {
      it('should make POST request to forgot-password endpoint', () => {
        const forgotPasswordData = { email: 'test@example.com' };
        const mockResponse: ApiResponse<PasswordResetResponseDTO> = {
          success: true,
          message: 'Password reset email sent',
          data: { message: 'Password reset email sent', email: 'test@example.com' },
          path: '/api/auth/forgot-password'
        };

        service.forgotPassword(forgotPasswordData).subscribe(response => {
          expect(response).toEqual(mockResponse);
        });

        const req = httpMock.expectOne(`${baseUrl}/forgot-password`);
        expect(req.request.method).toBe('POST');
        expect(req.request.body).toEqual(forgotPasswordData);
        req.flush(mockResponse);
      });
    });

    describe('Reset Password', () => {
      it('should make POST request to reset-password endpoint', () => {
        const resetPasswordData = {
          resetToken: 'reset-token',
          newPassword: 'newpassword123'
        };
        const mockResponse: ApiResponse<PasswordResetResponseDTO> = {
          success: true,
          message: 'Password reset successful',
          data: { message: 'Password reset successful', email: 'test@example.com' },
          path: '/api/auth/reset-password'
        };

        service.resetPassword(resetPasswordData).subscribe(response => {
          expect(response).toEqual(mockResponse);
        });

        const req = httpMock.expectOne(`${baseUrl}/reset-password`);
        expect(req.request.method).toBe('POST');
        expect(req.request.body).toEqual(resetPasswordData);
        req.flush(mockResponse);
      });
    });

    describe('Change Password', () => {
      it('should make POST request to change-password endpoint with user ID', () => {
        const userId = 123;
        const changePasswordData = {
          currentPassword: 'oldpassword',
          newPassword: 'newpassword123'
        };
        const mockResponse: ApiResponse<ChangePasswordResponseDTO> = {
          success: true,
          message: 'Password changed successfully',
          data: { message: 'Password changed successfully', success: true },
          path: '/api/auth/change-password/123'
        };

        service.changePassword(userId, changePasswordData).subscribe(response => {
          expect(response).toEqual(mockResponse);
        });

        const req = httpMock.expectOne(`${baseUrl}/change-password/${userId}`);
        expect(req.request.method).toBe('POST');
        expect(req.request.body).toEqual(changePasswordData);
        req.flush(mockResponse);
      });
    });
  });

  describe('Observable Behavior', () => {
    it('should emit user ID changes', () => {
      let emittedUserId: number | null = null;
      service.userId$.subscribe(userId => {
        emittedUserId = userId;
      });

      // Initial value should be null
      expect(emittedUserId).toBeNull();

      // Set auth data should emit new user ID
      service.setAuthData('token', 123);
      expect(emittedUserId as any).toEqual(123);

      // Logout should emit 0
      service.logout();
      expect(emittedUserId as any).toEqual(0);
    });
  });
});
