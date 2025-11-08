/*
  Alpha Vault Financial System
  
  @author Mohamed Dhaoui
  @service LoggingService
  @description Centralized logging service for production-safe logging
*/

import { Injectable } from '@angular/core';

import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class LoggingService {
  private isDevelopment = !environment.production;

  log(message: string, data?: any): void {
    // Logging disabled - remove console.log calls
    // In production, you could send to external logging service
    // this.sendToExternalLogger('log', message, data);
  }

  error(message: string, error?: any): void {
    // Only log non-404 errors (404s are expected for new months/budgets)
    if (error?.status !== 404 && this.isDevelopment) {
      console.error(message, error);
    }
    // In production, send to error tracking service
    // this.sendToExternalLogger('error', message, error);
  }

  warn(message: string, data?: any): void {
    if (this.isDevelopment) {
      console.warn(message, data);
    }
    // In production, send to monitoring service
    // this.sendToExternalLogger('warn', message, data);
  }

  info(message: string, data?: any): void {
    if (this.isDevelopment) {
      console.info(message, data);
    }
    // In production, send to analytics service
    // this.sendToExternalLogger('info', message, data);
  }

  // Private method for future external logging integration
  private sendToExternalLogger(level: string, message: string, data?: any): void {
    // Implementation for external logging services like Sentry, LogRocket, etc.
    // This is a placeholder for future implementation
  }
}
