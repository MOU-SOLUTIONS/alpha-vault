import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { ApiResponse } from '../../models/auth.model';
import { User,UserRequestDTO, UserResponseDTO } from '../../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private baseUrl = '/api/users';

  constructor(private http: HttpClient) {}

  // ============================================================
  // == Create
  // ============================================================

  /** Register a new user */
  register(dto: UserRequestDTO): Observable<ApiResponse<UserResponseDTO>> {
    return this.http.post<ApiResponse<UserResponseDTO>>(this.baseUrl, dto);
  }

  // ============================================================
  // == Read
  // ============================================================

  /** Get user by ID */
  getUserById(id: number): Observable<ApiResponse<UserResponseDTO>> {
    return this.http.get<ApiResponse<UserResponseDTO>>(`${this.baseUrl}/${id}`);
  }

  /** Get user by email */
  getUserByEmail(email: string): Observable<ApiResponse<UserResponseDTO>> {
    const params = new HttpParams().set('email', email);
    return this.http.get<ApiResponse<UserResponseDTO>>(`${this.baseUrl}/by-email`, { params });
  }

  /** Get paginated list of users */
  getUsers(page = 0, size = 10): Observable<ApiResponse<{
    content: UserResponseDTO[];
    totalElements: number;
    totalPages: number;
    size: number;
    number: number;
  }>> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());
    
    return this.http.get<ApiResponse<any>>(this.baseUrl, { params });
  }

  // ============================================================
  // == Update
  // ============================================================

  /** Update user profile */
  updateProfile(id: number, dto: UserRequestDTO): Observable<ApiResponse<UserResponseDTO>> {
    return this.http.put<ApiResponse<UserResponseDTO>>(`${this.baseUrl}/${id}`, dto);
  }

  /** Update profile image URL */
  updateProfileImage(id: number, imageUrl: string): Observable<ApiResponse<void>> {
    const params = new HttpParams().set('url', imageUrl);
    return this.http.patch<ApiResponse<void>>(`${this.baseUrl}/${id}/profile-image`, null, { params });
  }

  /** Upload profile image file */
  uploadProfileImage(userId: number, file: File): Observable<ApiResponse<string>> {
    const formData = new FormData();
    formData.append('file', file);
    
    return this.http.post<ApiResponse<string>>(
      `${this.baseUrl}/${userId}/upload-profile-image`,
      formData
    ).pipe(
      map(response => {
        if (response.success && response.data) {
          // Return full URL: base URL + response.data path
          const baseUrl = window.location.origin;
          return {
            ...response,
            data: `${baseUrl}${response.data}`
          };
        }
        return response;
      })
    );
  }

  /** Accept terms and conditions */
  acceptTerms(id: number): Observable<ApiResponse<void>> {
    return this.http.post<ApiResponse<void>>(`${this.baseUrl}/${id}/accept-terms`, {});
  }

  /** Toggle two-factor authentication */
  toggleTwoFactor(id: number, enabled: boolean): Observable<ApiResponse<void>> {
    const params = new HttpParams().set('enabled', enabled.toString());
    return this.http.patch<ApiResponse<void>>(`${this.baseUrl}/${id}/2fa`, null, { params });
  }

  /** Set account type */
  setAccountType(id: number, accountType: string): Observable<ApiResponse<void>> {
    const params = new HttpParams().set('type', accountType);
    return this.http.patch<ApiResponse<void>>(`${this.baseUrl}/${id}/account-type`, null, { params });
  }

  /** Set account active status */
  setActive(id: number, active: boolean): Observable<ApiResponse<void>> {
    const params = new HttpParams().set('value', active.toString());
    return this.http.patch<ApiResponse<void>>(`${this.baseUrl}/${id}/active`, null, { params });
  }

  // ============================================================
  // == Delete
  // ============================================================

  /** Delete user */
  deleteUser(id: number): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.baseUrl}/${id}`);
  }

  // ============================================================
  // == Utility Methods
  // ============================================================

  /** Get current user from local storage or API */
  getCurrentUser(): User | null {
    const userStr = localStorage.getItem('currentUser');
    return userStr ? JSON.parse(userStr) : null;
  }

  /** Store current user in local storage */
  setCurrentUser(user: User): void {
    localStorage.setItem('currentUser', JSON.stringify(user));
  }

  /** Clear current user from local storage */
  clearCurrentUser(): void {
    localStorage.removeItem('currentUser');
  }

  /** Check if user is authenticated */
  isAuthenticated(): boolean {
    return this.getCurrentUser() !== null && localStorage.getItem('token') !== null;
  }

  /** Get user ID from local storage */
  getCurrentUserId(): number | null {
    const user = this.getCurrentUser();
    return user ? user.id : null;
  }
}
