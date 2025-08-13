import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Router } from '@angular/router';

/**
 * SidbarComponent - Navigation sidebar for the application
 * 
 * This component provides navigation functionality to different sections
 * of the application through a vertical sidebar with icon buttons.
 */
@Component({
  selector: 'app-sidbar',
  imports: [CommonModule],
  templateUrl: './sidbar.component.html',
  styleUrl: './sidbar.component.scss',
})
export class SidbarComponent {
  /**
   * Creates an instance of SidbarComponent
   * @param router - Angular Router for navigation
   */
  constructor(private router: Router) {}

  /**
   * Navigates to the income section of the application
   */
  navigateToIncome(): void {
    this.router.navigate(['main/body/income']);
  }

  /**
   * Navigates to the expense section of the application
   */
  navigateToExpense(): void {
    this.router.navigate(['main/body/expense']);
  }

  /**
   * Navigates to the saving section of the application
   */
  navigateToSaving(): void {
    this.router.navigate(['main/body/saving']);
  }

  /**
   * Navigates to the budget section of the application
   */
  navigateToBudget(): void {
    this.router.navigate(['main/body/budget']);
  }

  /**
   * Navigates to the debt section of the application
   */
  navigateToDebt(): void {
    this.router.navigate(['main/body/debt']);
  }

  /**
   * Navigates to the investment section of the application
   */
  navigateToInvestment(): void {
    this.router.navigate(['main/body/investment']);
  }

  /**
   * Checks if the current route matches the given path
   * Used to highlight the active navigation button
   * 
   * @param path - The route path to check
   * @returns True if the current route matches or starts with the given path
   */
  isRouteActive(path: string): boolean {
    return (
      this.router.url === `/${path}` || this.router.url.startsWith(`/${path}`)
    );
  }
}
