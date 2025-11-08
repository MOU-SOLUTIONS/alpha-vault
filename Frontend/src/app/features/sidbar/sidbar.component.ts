/*
  Alpha Vault Financial System
  
  @author Mohamed Dhaoui
  @component SidbarComponent
  @description Advanced navigation sidebar with dynamic color theming and smooth animations
*/

import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, DestroyRef, ElementRef, HostBinding, inject, OnInit, Renderer2 } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs/operators';

import { META_FRAGMENT } from '../../core/seo/page-meta.model';

@Component({
  standalone: true,
  selector: 'app-sidbar',
  imports: [CommonModule],
  templateUrl: './sidbar.component.html',
  styleUrl: './sidbar.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: META_FRAGMENT,
      useValue: {
        description: 'Navigation sidebar component providing dynamic color theming and smooth animations for financial section navigation. Features keyboard-accessible navigation buttons, route-aware active states, and responsive design with enhanced accessibility in Alpha Vault financial management system.'
      }
    }
  ],
})
export class SidbarComponent implements OnInit {

  private readonly destroyRef = inject(DestroyRef);

  private readonly cdr = inject(ChangeDetectorRef);

  private _currentSection: keyof typeof this.sectionColors = 'default';

  private _cachedColors!: typeof this.sectionColors[keyof typeof this.sectionColors];

  private _routeActiveCache = new Map<string, boolean>();

  get currentSection(): keyof typeof this.sectionColors {
    return this._currentSection;
  }

  @HostBinding('style.--sidebar-primary') get sidebarPrimary(): string {
    return this.sectionColors[this._currentSection].primary;
  }

  @HostBinding('style.--sidebar-secondary') get sidebarSecondary(): string {
    return this.sectionColors[this._currentSection].secondary;
  }

  @HostBinding('style.--sidebar-primary-dark') get sidebarPrimaryDark(): string {
    return this.sectionColors[this._currentSection].primaryDark;
  }

  @HostBinding('style.--sidebar-secondary-dark') get sidebarSecondaryDark(): string {
    return this.sectionColors[this._currentSection].secondaryDark;
  }

  @HostBinding('style.--sidebar-accent') get sidebarAccent(): string {
    return this.sectionColors[this._currentSection].accent;
  }

  @HostBinding('style.--sidebar-glow') get sidebarGlow(): string {
    return this.sectionColors[this._currentSection].glow;
  }

  @HostBinding('style.--sidebar-background') get sidebarBackground(): string {
    return this.sectionColors[this._currentSection].background;
  }

  @HostBinding('style.--sidebar-background-hover') get sidebarBackgroundHover(): string {
    return this.sectionColors[this._currentSection].backgroundHover;
  }

  readonly sectionColors = {
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
    dashboard: {
      primary: '#6366f1',
      secondary: '#8b5cf6',
      primaryDark: '#ec4899',
      secondaryDark: '#3b82f6',
      accent: '#6366f1',
      glow: 'rgba(139, 92, 246, 0.4)',
      background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 25%, #ec4899 50%, #3b82f6 75%, #10b981 100%)',
      backgroundHover: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 25%, #db2777 50%, #2563eb 75%, #059669 100%)'
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
      primary: '#8d5603',
      secondary: '#a66a0a',
      primaryDark: '#7a4a02',
      secondaryDark: '#6b4200',
      accent: '#b87d0a',
      glow: 'rgba(141, 86, 3, 0.3)',
      background: 'linear-gradient(135deg, #8d5603 0%, #a66a0a 100%)',
      backgroundHover: 'linear-gradient(135deg, #7a4a02 0%, #6b4200 100%)'
    },
    budget: {
      primary: '#065f46',
      secondary: '#047857',
      primaryDark: '#047857',
      secondaryDark: '#065f46',
      accent: '#34d399',
      glow: 'rgba(16, 185, 129, 0.3)',
      background: 'linear-gradient(135deg, #047857 0%,#065f46 100%)',
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

  private readonly router = inject(Router);
  private readonly renderer = inject(Renderer2);
  private readonly elementRef = inject(ElementRef);

  ngOnInit(): void {
    this._cachedColors = this.sectionColors[this._currentSection];
    this.initializeComponent();
  }

  private initializeComponent(): void {
    this.setupRouterMonitoring();
    
    this.updateSectionColors(this.router.url);
  }

  private setupRouterMonitoring(): void {
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe((event: NavigationEnd) => {
      this.updateSectionColors(event.url);
    });
  }

  private updateSectionColors(url: string): void {
    const newSection = this.determineSectionFromUrl(url);
    
    if (newSection !== this._currentSection) {
      this._currentSection = newSection;
      this._cachedColors = this.sectionColors[this._currentSection];
      this._routeActiveCache.clear();
      this.applySectionColors();
      this.cdr.markForCheck();
    }
  }

  private determineSectionFromUrl(url: string): keyof typeof this.sectionColors {
    const urlLower = url.toLowerCase();
    
    if (urlLower.includes('dashboard') || urlLower.includes('main/body/dashboard')) {
      return 'dashboard';
    } else if (urlLower.includes('income') || urlLower.includes('main/body/income')) {
      return 'income';
    } else if (urlLower.includes('expense') || urlLower.includes('main/body/expense')) {
      return 'expense';
    } else if (urlLower.includes('saving') || urlLower.includes('main/body/saving')) {
      return 'saving';
    } else if (urlLower.includes('budget') || urlLower.includes('main/body/budget')) {
      return 'budget';
    } else if (urlLower.includes('debt') || urlLower.includes('main/body/debt')) {
      return 'debt';
    } else if (urlLower.includes('investment') || urlLower.includes('main/body/investment')) {
      return 'investment';
    }
    
    return 'default';
  }

  private applySectionColors(): void {
    this.renderer.addClass(this.elementRef.nativeElement, 'colors-updated');
    
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        this.renderer.removeClass(this.elementRef.nativeElement, 'colors-updated');
      });
    });
  }

  getCurrentColors(): typeof this.sectionColors[keyof typeof this.sectionColors] {
    return this._cachedColors;
  }


  navigateToDashboard(): void {
    this.router.navigate(['main/body/dashboard']);
  }

  navigateToIncome(): void {
    this.router.navigate(['main/body/income']);
  }

  navigateToExpense(): void {
    this.router.navigate(['main/body/expense']);
  }

  navigateToSaving(): void {
    this.router.navigate(['main/body/saving']);
  }

  navigateToBudget(): void {
    this.router.navigate(['main/body/budget']);
  }

  navigateToDebt(): void {
    this.router.navigate(['main/body/debt']);
  }

  navigateToInvestment(): void {
    this.router.navigate(['main/body/investment']);
  }

  isRouteActive(path: string): boolean {
    if (this._routeActiveCache.has(path)) {
      return this._routeActiveCache.get(path)!;
    }
    
    const isActive = (
      this.router.url === `/${path}` || 
      this.router.url.startsWith(`/${path}`)
    );
    
    this._routeActiveCache.set(path, isActive);
    return isActive;
  }
}
