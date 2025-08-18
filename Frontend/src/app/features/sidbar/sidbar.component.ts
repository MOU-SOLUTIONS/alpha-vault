import { CommonModule } from '@angular/common';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { filter, takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';

/**
 * SidbarComponent - Navigation sidebar for the application
 * 
 * This component provides navigation functionality to different sections
 * of the application through a vertical sidebar with icon buttons.
 * Features dynamic color changing based on the selected section.
 */
@Component({
  standalone: true,
  selector: 'app-sidbar',
  imports: [CommonModule],
  templateUrl: './sidbar.component.html',
  styleUrl: './sidbar.component.scss',
})
export class SidbarComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  
  // Current section for color theming
  currentSection: keyof typeof this.sectionColors = 'default';
  
  // Color themes for each section
  sectionColors = {
    default: {
      primary: '#6366f1',
      secondary: '#8b5cf6',
      primaryDark: '#4f46e5',
      secondaryDark: '#7c3aed',
      accent: '#a855f7',
      glow: 'rgba(139, 92, 246, 0.3)',
      background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
      backgroundHover: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)'
    },
    income: {
      primary: '#3b82f6',
      secondary: '#2563eb',
      primaryDark: '#1d4ed8',
      secondaryDark: '#1e40af',
      accent: '#60a5fa',
      glow: 'rgba(59, 130, 246, 0.3)',
      background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
      backgroundHover: 'linear-gradient(135deg, #1d4ed8 0%, #1e40af 100%)'

    },
    expense: {
      primary: '#3f51b5',
      secondary: '#303f9f',
      primaryDark: '#283593',
      secondaryDark: '#1a237e',
      accent: '#5c6bc0',
      glow: 'rgba(63, 81, 181, 0.3)',
      background: 'linear-gradient(135deg, #3f51b5 0%, #303f9f 100%)',
      backgroundHover: 'linear-gradient(135deg, #283593 0%, #1a237e 100%)'
    },
    saving: {
      primary: '#f59e0b',
      secondary: '#d97706',
      primaryDark: '#b45309',
      secondaryDark: '#92400e',
      accent: '#fbbf24',
      glow: 'rgba(245, 158, 11, 0.3)',
      background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
      backgroundHover: 'linear-gradient(135deg, #b45309 0%, #92400e 100%)'

     
    },
    budget: {
      primary: '#10b981',
      secondary: '#059669',
      primaryDark: '#047857',
      secondaryDark: '#065f46',
      accent: '#34d399',
      glow: 'rgba(16, 185, 129, 0.3)',
      background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
      backgroundHover: 'linear-gradient(135deg, #047857 0%, #065f46 100%)'


    },
    debt: {
      primary: '#ec4899',
      secondary: '#db2777',
      primaryDark: '#be185d',
      secondaryDark: '#9d174d',
      accent: '#f472b6',
      glow: 'rgba(236, 72, 153, 0.3)',
      background: 'linear-gradient(135deg, #ec4899 0%, #db2777 100%)',
      backgroundHover: 'linear-gradient(135deg, #be185d 0%, #9d174d 100%)'
    },
    investment: {
      primary: '#8b5cf6',
      secondary: '#7c3aed',
      primaryDark: '#6d28d9',
      secondaryDark: '#5b21b6',
      accent: '#a78bfa',
      glow: 'rgba(139, 92, 246, 0.3)',
      background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
      backgroundHover: 'linear-gradient(135deg, #6d28d9 0%, #5b21b6 100%)'
    }
  } as const;

  /**
   * Creates an instance of SidbarComponent
   * @param router - Angular Router for navigation
   */
  constructor(private router: Router) {}

  ngOnInit(): void {
    // Subscribe to router events to detect section changes
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd),
      takeUntil(this.destroy$)
    ).subscribe((event: NavigationEnd) => {
      this.updateSectionColors(event.url);
    });
    
    // Set initial colors based on current route
    this.updateSectionColors(this.router.url);
    
    // Force initial color application
    setTimeout(() => {
      this.applySectionColors();
    }, 100);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Updates the sidebar colors based on the current route
   * @param url - Current route URL
   */
  private updateSectionColors(url: string): void {
    let newSection = 'default';
    
    // More flexible route detection
    const urlLower = url.toLowerCase();
    
    if (urlLower.includes('income') || urlLower.includes('main/body/income')) {
      newSection = 'income';
    } else if (urlLower.includes('expense') || urlLower.includes('main/body/expense')) {
      newSection = 'expense';
    } else if (urlLower.includes('saving') || urlLower.includes('main/body/saving')) {
      newSection = 'saving';
    } else if (urlLower.includes('budget') || urlLower.includes('main/body/budget')) {
      newSection = 'budget';
    } else if (urlLower.includes('debt') || urlLower.includes('main/body/debt')) {
      newSection = 'debt';
    } else if (urlLower.includes('investment') || urlLower.includes('main/body/investment')) {
      newSection = 'investment';
    }
    
    if (newSection !== this.currentSection) {
      this.currentSection = newSection as keyof typeof this.sectionColors;
      
      // Apply colors to CSS custom properties
      this.applySectionColors();
    } else {
      // Even if section didn't change, ensure colors are applied
      this.applySectionColors();
    }
  }

  /**
   * Applies the current section colors to CSS custom properties
   */
  private applySectionColors(): void {
    const colors = this.sectionColors[this.currentSection];
    
    // Apply colors to the component's host element instead of document root
    const hostElement = document.querySelector('app-sidbar');
    if (hostElement) {
      (hostElement as HTMLElement).style.setProperty('--sidebar-primary', colors.primary);
      (hostElement as HTMLElement).style.setProperty('--sidebar-secondary', colors.secondary);
      (hostElement as HTMLElement).style.setProperty('--sidebar-primary-dark', colors.primaryDark);
      (hostElement as HTMLElement).style.setProperty('--sidebar-secondary-dark', colors.secondaryDark);
      (hostElement as HTMLElement).style.setProperty('--sidebar-accent', colors.accent);
      (hostElement as HTMLElement).style.setProperty('--sidebar-glow', colors.glow);
      (hostElement as HTMLElement).style.setProperty('--sidebar-background', colors.background);
      (hostElement as HTMLElement).style.setProperty('--sidebar-background-hover', colors.backgroundHover);
    }
    
    // Also apply to document root as fallback
    const root = document.documentElement;
    root.style.setProperty('--sidebar-primary', colors.primary);
    root.style.setProperty('--sidebar-secondary', colors.secondary);
    root.style.setProperty('--sidebar-primary-dark', colors.primaryDark);
    root.style.setProperty('--sidebar-secondary-dark', colors.secondaryDark);
    root.style.setProperty('--sidebar-accent', colors.accent);
    root.style.setProperty('--sidebar-glow', colors.glow);
    root.style.setProperty('--sidebar-background', colors.background);
    root.style.setProperty('--sidebar-background-hover', colors.backgroundHover);
  }

  /**
   * Gets the current section colors for dynamic styling
   */
  getCurrentColors(): typeof this.sectionColors[keyof typeof this.sectionColors] {
    return this.sectionColors[this.currentSection];
  }

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
