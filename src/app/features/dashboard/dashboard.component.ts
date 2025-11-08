/*
  Alpha Vault Financial System
  
  @author Mohamed Dhaoui
  @component DashboardComponent
  @description Elite financial dashboard with comprehensive overview
*/

import { CommonModule, CurrencyPipe, isPlatformBrowser } from '@angular/common';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, DestroyRef, inject, OnDestroy, OnInit, PLATFORM_ID } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { interval } from 'rxjs';
import { forkJoin, of } from 'rxjs';
import { catchError, finalize } from 'rxjs/operators';

import { SeoService } from '../../core/seo/seo.service';
import { AuthService } from '../../core/services/auth.service';
import { BudgetService } from '../../core/services/budget.service';
import { DebtService } from '../../core/services/debt.service';
import { ExpenseService } from '../../core/services/expense.service';
import { IncomeService } from '../../core/services/income.service';
import { InvestmentService } from '../../core/services/investment.service';
import { SavingGoalService } from '../../core/services/saving.service';
import { DashboardBudgetSummaryComponent } from './components/dashboard-budget-summary/dashboard-budget-summary.component';
import { DashboardDebtSummaryComponent } from './components/dashboard-debt-summary/dashboard-debt-summary.component';
import { DashboardInvestmentSummaryComponent } from './components/dashboard-investment-summary/dashboard-investment-summary.component';
import { DashboardMonthlyTrendComponent } from './components/dashboard-monthly-trend/dashboard-monthly-trend.component';
import { DashboardRecentActivityComponent } from './components/dashboard-recent-activity/dashboard-recent-activity.component';
import { DashboardSavingsSummaryComponent } from './components/dashboard-savings-summary/dashboard-savings-summary.component';

@Component({
  standalone: true,
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    CurrencyPipe,
    DashboardMonthlyTrendComponent,
    DashboardRecentActivityComponent,
    DashboardBudgetSummaryComponent,
    DashboardSavingsSummaryComponent,
    DashboardInvestmentSummaryComponent,
    DashboardDebtSummaryComponent,
  ],
})
export class DashboardComponent implements OnInit, OnDestroy {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly isBrowser = isPlatformBrowser(this.platformId);
  private readonly destroyRef = inject(DestroyRef);
  private readonly seo = inject(SeoService);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly authService = inject(AuthService);
  private readonly incomeService = inject(IncomeService);
  private readonly expenseService = inject(ExpenseService);
  private readonly budgetService = inject(BudgetService);
  private readonly savingService = inject(SavingGoalService);
  private readonly investmentService = inject(InvestmentService);
  private readonly debtService = inject(DebtService);

  userId: number | null = null;
  isLoading = true;
  
  totalIncome = 0;
  totalExpense = 0;
  netWorth = 0;
  totalSavings = 0;
  totalInvestments = 0;
  totalDebt = 0;
  availableBudget = 0;
  
  monthlyIncome = 0;
  monthlyExpense = 0;
  monthlyBudget = 0;
  
  yearlyIncome = 0;
  yearlyExpense = 0;

  readonly currentMonthName: string;
  readonly currentYear: number;

  // Real-time clock properties
  currentTime = '';
  currentDate = '';
  currentDay = '';
  greeting = '';

  // Weather properties
  weather = {
    temperature: 0,
    condition: 'Clear',
    icon: 'sun',
    location: 'Loading...',
    humidity: 0,
    windSpeed: 0
  };
  weatherLoading = true;

  get monthlySurplus(): number {
    return this.monthlyIncome - this.monthlyExpense;
  }

  get isSurplus(): boolean {
    return this.monthlySurplus >= 0;
  }

  get savingsRate(): string {
    if (this.monthlyIncome > 0) {
      return ((this.totalSavings / this.monthlyIncome) * 100).toFixed(1);
    }
    return '0';
  }

  getUserFirstName(): string {
    if (!this.isBrowser) return 'User';
    const user = this.authService.getCurrentUser();
    return user?.firstName || 'User';
  }

  constructor() {
    const now = new Date();
    this.currentMonthName = now.toLocaleString('en-US', { month: 'long' });
    this.currentYear = now.getFullYear();
  }

  ngOnInit(): void {
    this.setupSEO();
    this.loadDashboardData();
    this.initializeRealTimeUpdates();
    this.loadWeather();
  }

  ngOnDestroy(): void {
    // Cleanup is handled by takeUntilDestroyed
  }

  private initializeRealTimeUpdates(): void {
    if (!this.isBrowser) return;

    // Update time immediately
    this.updateTime();

    // Update time every second
    interval(1000)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        this.updateTime();
      });
  }

  private updateTime(): void {
    if (!this.isBrowser) return;

    const now = new Date();
    
    // Format time (HH:MM:SS)
    const hours = now.getHours().toString().padStart(2, '0');
    const minutes = now.getMinutes().toString().padStart(2, '0');
    const seconds = now.getSeconds().toString().padStart(2, '0');
    this.currentTime = `${hours}:${minutes}:${seconds}`;

    // Format date (Day, Month DD, YYYY)
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    this.currentDay = days[now.getDay()];
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    this.currentDate = `${months[now.getMonth()]} ${now.getDate()}, ${now.getFullYear()}`;

    // Update greeting based on time of day
    const hour = now.getHours();
    if (hour < 12) {
      this.greeting = 'Good Morning';
    } else if (hour < 17) {
      this.greeting = 'Good Afternoon';
    } else if (hour < 21) {
      this.greeting = 'Good Evening';
    } else {
      this.greeting = 'Good Night';
    }

    this.cdr.markForCheck();
  }

  private loadWeather(): void {
    if (!this.isBrowser) {
      this.weatherLoading = false;
      return;
    }

    this.weatherLoading = true;

    // Try to get user's location for weather
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          // In a real app, you would call a weather API here
          // For now, we'll use mock data
          this.setMockWeather(position.coords.latitude, position.coords.longitude);
        },
        () => {
          // If geolocation fails, use default location
          this.setMockWeather(40.7128, -74.0060); // New York default
        }
      );
    } else {
      // Browser doesn't support geolocation
      this.setMockWeather(40.7128, -74.0060);
    }
  }

  private setMockWeather(lat: number, lon: number): void {
    // Mock weather data - in production, replace with real API call
    // Example: OpenWeatherMap API
    const conditions = ['Clear', 'Cloudy', 'Partly Cloudy', 'Sunny', 'Rainy'];
    const icons = ['sun', 'cloud', 'cloud-sun', 'sun', 'cloud-rain'];
    const randomIndex = Math.floor(Math.random() * conditions.length);
    
    // Simulate realistic temperature based on time of day
    const hour = new Date().getHours();
    let baseTemp = 20; // Base temperature
    if (hour >= 6 && hour < 12) {
      baseTemp = 18; // Morning
    } else if (hour >= 12 && hour < 18) {
      baseTemp = 25; // Afternoon
    } else if (hour >= 18 && hour < 22) {
      baseTemp = 22; // Evening
    } else {
      baseTemp = 15; // Night
    }
    
    this.weather = {
      temperature: baseTemp + Math.floor(Math.random() * 8) - 4, // ±4°C variation
      condition: conditions[randomIndex],
      icon: icons[randomIndex],
      location: 'Your Location', // In production, reverse geocode lat/lon
      humidity: Math.floor(Math.random() * 40) + 40, // 40-80%
      windSpeed: Math.floor(Math.random() * 20) + 5 // 5-25 km/h
    };

    this.weatherLoading = false;
    this.cdr.markForCheck();

    // TODO: Replace with real weather API call
    // Example:
    // this.http.get(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=YOUR_API_KEY&units=metric`)
    //   .pipe(takeUntilDestroyed(this.destroyRef))
    //   .subscribe(data => {
    //     this.weather = {
    //       temperature: Math.round(data.main.temp),
    //       condition: data.weather[0].main,
    //       icon: this.getWeatherIcon(data.weather[0].icon),
    //       location: data.name,
    //       humidity: data.main.humidity,
    //       windSpeed: Math.round(data.wind.speed * 3.6) // Convert m/s to km/h
    //     };
    //     this.weatherLoading = false;
    //     this.cdr.markForCheck();
    //   });
  }

  private setupSEO(): void {
    if (!this.isBrowser) return;

    this.seo.set({
      title: 'Financial Dashboard',
      description: 'Comprehensive financial dashboard providing an overview of your income, expenses, budget, savings, investments, and debt management in Alpha Vault.',
      canonicalUrl: 'https://alphavault.app/main/body/dashboard',
      keywords: ['financial dashboard', 'money management', 'personal finance', 'Alpha Vault', 'financial overview'],
      og: {
        title: 'Financial Dashboard',
        description: 'Comprehensive financial dashboard providing an overview of your finances.',
        image: '/assets/og/default.png',
        type: 'website',
      },
      twitter: {
        card: 'summary_large_image',
        title: 'Financial Dashboard',
        description: 'Comprehensive financial dashboard providing an overview of your finances.',
        image: '/assets/og/default.png',
      },
      structuredData: {
        '@context': 'https://schema.org',
        '@type': 'WebPage',
        name: 'Financial Dashboard',
        description: 'Comprehensive financial dashboard providing an overview of your finances.',
        url: 'https://alphavault.app/main/body/dashboard',
      },
    });
  }

  private loadDashboardData(): void {
    this.userId = this.authService.getUserId();
    
    if (!this.userId) {
      this.isLoading = false;
      this.cdr.markForCheck();
      return;
    }

    this.isLoading = true;

    forkJoin({
      monthlyIncome: this.incomeService.getCurrentMonthIncome(this.userId).pipe(
        catchError(() => of(0))
      ),
      yearlyIncome: this.incomeService.getCurrentYearIncome(this.userId).pipe(
        catchError(() => of(0))
      ),
      monthlyExpense: this.expenseService.getMonthExpense().pipe(
        catchError(() => of(0))
      ),
      yearlyExpense: this.expenseService.getYearExpense().pipe(
        catchError(() => of(0))
      ),
      savingsStats: this.savingService.getTotals().pipe(
        catchError(() => {
          return of({ totalCurrentAmount: 0, totalTargetAmount: 0, activeGoals: 0, totalGoals: 0, completedGoals: 0, totalRemainingAmount: 0, averageProgress: 0, goalsByCategory: {}, goalsByPriority: {}, goalsByStatus: {} });
        })
      ),
      investments: this.investmentService.getAll().pipe(
        catchError(() => of([]))
      ),
      debtTotals: this.debtService.getDebtTotals().pipe(
        catchError(() => {
          return of({ totalDebt: 0, totalPaid: 0, totalMinPayments: 0, creditorCount: 0 });
        })
      ),
      budgetSummary: this.budgetService.getCurrentMonthBudgetSummary(this.userId).pipe(
        catchError(() => of(null))
      ),
    }).pipe(
      takeUntilDestroyed(this.destroyRef),
      finalize(() => {
        this.isLoading = false;
        this.cdr.markForCheck();
      })
    ).subscribe({
      next: (data) => {
        this.monthlyIncome = data.monthlyIncome || 0;
        this.yearlyIncome = data.yearlyIncome || 0;
        this.totalIncome = this.yearlyIncome;

        this.monthlyExpense = data.monthlyExpense || 0;
        this.yearlyExpense = data.yearlyExpense || 0;
        this.totalExpense = this.yearlyExpense;

        const savingsStats = data.savingsStats as any;
        this.totalSavings = savingsStats.totalCurrent || savingsStats.totalCurrentAmount || 0;

        const investments = data.investments as any[];
        this.totalInvestments = investments.reduce((sum, inv) => {
          if (inv.status === 'CLOSED' && inv.soldValue) {
            return sum + (inv.soldValue || 0);
          }
          return sum + (inv.currentValue || inv.amountInvested || 0);
        }, 0);

        const debtTotals = data.debtTotals;
        if (debtTotals instanceof Map) {
          this.totalDebt = debtTotals.get('totalRemaining') || debtTotals.get('totalDebt') || 0;
        } else if (typeof debtTotals === 'object' && debtTotals !== null) {
          this.totalDebt = (debtTotals as any).totalRemaining || (debtTotals as any).totalDebt || 0;
        } else {
          this.totalDebt = 0;
        }

        if (data.budgetSummary) {
          const budget = data.budgetSummary as any;
          this.monthlyBudget = budget.totalBudget || budget.totalPlanned || 0;
          this.availableBudget = budget.availableBudget || (this.monthlyBudget - this.monthlyExpense);
        }

        this.netWorth = this.totalIncome - this.totalExpense + this.totalSavings + this.totalInvestments - this.totalDebt;

        this.cdr.markForCheck();
      },
      error: () => {
        this.isLoading = false;
        this.cdr.markForCheck();
      }
    });
  }
}
