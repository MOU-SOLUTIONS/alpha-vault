/*
  Alpha Vault Financial System
  
  @author Mohamed Dhaoui
  @component BodyComponent
  @description Main content area component with router outlet for dynamic content
*/

import { CommonModule, isPlatformBrowser } from '@angular/common';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  DestroyRef,
  EventEmitter,
  inject,
  OnInit,
  Output,
  PLATFORM_ID,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router, RouterModule, RouterOutlet } from '@angular/router';
import { filter } from 'rxjs/operators';

import { META_FRAGMENT } from '../../core/seo/page-meta.model';

@Component({
  selector: 'app-body',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterModule],
  templateUrl: './body.component.html',
  styleUrls: ['./body.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: META_FRAGMENT,
      useValue: {
        description: 'Main content area router outlet container providing dynamic content loading, error handling, and loading states for financial dashboard routes. Features smooth transitions, accessibility support, and responsive design in Alpha Vault financial management system.'
      }
    }
  ],
})
export class BodyComponent implements OnInit {

  @Output() componentLoaded = new EventEmitter<void>();

  @Output() contentChanged = new EventEmitter<string>();

  currentRoute = '';

  isComponentLoaded = false;

  isContentLoading = false;

  hasContentError = false;

  contentErrorMessage = '';

  private readonly destroyRef = inject(DestroyRef);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly router = inject(Router);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly isBrowser = isPlatformBrowser(this.platformId);

  ngOnInit(): void {
    this.initializeComponent();
    this.setupRouterMonitoring();
  }

  get statusAnnouncement(): string {
    return this.currentRoute 
      ? `Content changed to: ${this.currentRoute}` 
      : 'Content loaded successfully';
  }
 
  retryContentLoad(): void {
    this.hasContentError = false;
    this.contentErrorMessage = '';
    this.isContentLoading = true;
    
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        this.isContentLoading = false;
        this.componentLoaded.emit();
        this.cdr.markForCheck();
      });
    });
  }

  clearContentError(): void {
    this.hasContentError = false;
    this.contentErrorMessage = '';
    this.cdr.markForCheck();
  }

  private initializeComponent(): void {
    requestAnimationFrame(() => {
      this.isComponentLoaded = true;
      this.componentLoaded.emit();
      this.cdr.markForCheck();
    });
  }

  private setupRouterMonitoring(): void {
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe((event: NavigationEnd) => {
      this.currentRoute = event.urlAfterRedirects;
      this.contentChanged.emit(this.currentRoute);
      this.cdr.markForCheck();
    });
  }
}
