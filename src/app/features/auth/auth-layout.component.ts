/*
  Alpha Vault Financial System
  
  @author Mohamed Dhaoui
  @component AuthLayoutComponent
  @description Main layout component for authentication pages with responsive design
*/

import { CommonModule, NgOptimizedImage } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute,Router, RouterModule } from '@angular/router';

import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-auth-layout',
  standalone: true,
  imports: [CommonModule, RouterModule, NgOptimizedImage],
  templateUrl: './auth-layout.component.html',
  styleUrls: ['./auth-layout.component.scss']
})
export class AuthLayoutComponent implements OnInit {
  
  /* ================================================================
     CONSTRUCTOR
     ================================================================ */
  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private authService: AuthService
  ) {}

  /* ================================================================
     LIFECYCLE HOOKS
     ================================================================ */
  ngOnInit(): void {
    // Check if user is already authenticated with valid token
    // isAuthenticated() now validates token expiration
    if (this.authService.isAuthenticated()) {
      // Only redirect if token is valid
      this.router.navigate(['/main']);
    } else {
      // Clear any stale/invalid auth data
      this.authService.logout();
    }
  }

  /* ================================================================
     PUBLIC METHODS
     ================================================================ */
  
  /**
   * Navigates to the home page
   */
  goHome(): void {
    this.router.navigate(['/home']);
  }
}
