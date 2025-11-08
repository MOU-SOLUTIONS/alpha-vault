# Elite Angular Component Audit: HeroComponent

## A) Component Scorecard

| Area | Result | Evidence |
|------|--------|----------|
| **Change Detection** | ❌ **FAIL** | Missing `ChangeDetectionStrategy.OnPush` (component.ts:8) |
| **Template Hygiene** | ✅ **PASS** | No expensive pipes/logic, no *ngFor, simple bindings |
| **Subscriptions** | ❌ **FAIL** | Event listeners added but not cleaned up (component.ts:42-63), `setTimeout` without cleanup (component.ts:58, 71, 81) |
| **Accessibility** | ⚠️ **PARTIAL** | Has `aria-label` and `aria-hidden` (component.html:2, 17, 23, 61-64), but button missing keyboard handlers (component.html:16-19), no visible focus styles (component.scss:86-112), missing `prefers-reduced-motion` support (component.scss:94, 194, 203, 370, 382) |
| **Security** | ✅ **PASS** | No `innerHTML`, uses Renderer2 for DOM manipulation |
| **Performance** | ⚠️ **PARTIAL** | Direct DOM access without SSR guard (component.ts:43, 72-74, 95-97), `getBoundingClientRect()` calls (component.ts:51), `setTimeout` without cleanup, no `requestAnimationFrame` for animations |
| **Styles** | ⚠️ **PARTIAL** | Uses `:host`, but missing `prefers-reduced-motion` support, unused `.btn-secondary` class (component.scss:114-140), some rules exceed 6 lines |
| **Tests** | ❌ **FAIL** | No test file found |

**Overall: ❌ FAIL** - Missing OnPush strategy, event listeners and timeouts not cleaned up, no SSR guards, incomplete a11y (keyboard handlers, focus styles, reduced motion), and no tests.

---

## B) Ranked Findings Table

| Rank | Severity | Area | Problem | Evidence | Impact | Effort | Fix Summary |
|------|----------|------|---------|----------|--------|--------|-------------|
| 1 | **High** | Change Detection | Missing `OnPush` strategy | component.ts:8 | Perf | S | Add `ChangeDetectionStrategy.OnPush` |
| 2 | **High** | Subscriptions | Event listeners not cleaned up | component.ts:42-63 | Perf/Memory | M | Store listener functions, implement `OnDestroy`, remove listeners |
| 3 | **High** | Subscriptions | `setTimeout` calls without cleanup | component.ts:58, 71, 81 | Perf/Memory | M | Store timeout IDs, clear in `OnDestroy` |
| 4 | **High** | Performance | Direct DOM access without SSR guard | component.ts:43, 72-74, 95-97 | SSR/Perf | S | Guard with `isPlatformBrowser(PLATFORM_ID)` |
| 5 | **High** | Tests | No test file | N/A | DX/A11y | L | Create comprehensive test file with a11y, keyboard nav, and animation tests |
| 6 | **High** | Accessibility | Button missing keyboard handlers | component.html:16-19 | A11y | S | Add `(keydown.enter)` and `(keydown.space)` handlers |
| 7 | **High** | Accessibility | No visible focus styles | component.scss:86-112 | A11y | S | Add `:focus-visible` styles with outline |
| 8 | **Med** | Accessibility | Missing `prefers-reduced-motion` support | component.scss:94, 194, 203, 370, 382 | A11y | S | Add `@media (prefers-reduced-motion: reduce)` blocks |
| 9 | **Med** | Performance | `getBoundingClientRect()` called on every click | component.ts:51 | Perf | S | Cache rect or use event coordinates directly |
| 10 | **Med** | Styles | Unused `.btn-secondary` class | component.scss:114-140 | DX | S | Remove unused class |
| 11 | **Low** | TypeScript | Missing space in import statement | component.ts:1 | DX | S | Fix `ViewChild,` spacing |
| 12 | **Low** | HTML | Button missing `type="button"` | component.html:16-19 | DX | S | Add explicit `type="button"` attribute |

---

## C) Concrete Patches (Diffs)

### TS: Add OnPush, SSR Guards, and Cleanup

```typescript
// src/app/features/home/components/hero/hero.component.ts

import { 
  AfterViewInit, 
  ChangeDetectionStrategy,
  Component, 
  ElementRef, 
  inject,
  OnDestroy,
  PLATFORM_ID,
  Renderer2,
  ViewChild 
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Router, RouterLink } from '@angular/router';

/**
 * Hero component for the home page
 * Displays the main hero section with animated device mockup
 * 
 * @component
 * @standalone
 */
@Component({
  selector: 'app-hero',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './hero.component.html',
  styleUrls: ['./hero.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HeroComponent implements AfterViewInit, OnDestroy {
  // Inputs / Outputs
  // None currently
  
  // Public properties
  @ViewChild('heroSection') public heroSection!: ElementRef;
  
  // Private properties
  private readonly renderer = inject(Renderer2);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly isBrowser = isPlatformBrowser(this.platformId);
  private readonly router = inject(Router);
  private clickListeners: Array<() => void> = [];
  private timeouts: Array<number> = [];
  
  /**
   * Lifecycle hook that is called after the view has been initialized
   * Initializes animations and effects
   */
  public ngAfterViewInit(): void {
    if (!this.isBrowser) return;
    this.addRippleEffectToButtons();
    this.initDeviceTurnOnAnimation();
    this.triggerHeroAnimations();
  }

  /**
   * Cleanup event listeners and timeouts on component destruction
   */
  public ngOnDestroy(): void {
    // Remove all event listeners
    this.clickListeners.forEach(removeListener => removeListener());
    this.clickListeners = [];
    
    // Clear all timeouts
    this.timeouts.forEach(timeoutId => clearTimeout(timeoutId));
    this.timeouts = [];
  }

  /**
   * Navigates to the authentication page
   * Used for keyboard navigation support
   */
  public navigateToAuth(): void {
    this.router.navigate(['/auth']);
  }
  
  /**
   * Adds ripple effect to primary buttons
   * Creates and animates a ripple element on click
   */
  private addRippleEffectToButtons(): void {
    if (!this.isBrowser || !this.heroSection?.nativeElement) return;
    
    const buttons = this.heroSection.nativeElement.querySelectorAll('.btn-primary');
    
    buttons.forEach((button: HTMLElement) => {
      const removeListener = this.renderer.listen(button, 'click', (event: MouseEvent) => {
        const ripple = this.renderer.createElement('span');
        this.renderer.addClass(ripple, 'ripple');
        this.renderer.appendChild(button, ripple);
        
        const rect = button.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;
        
        this.renderer.setStyle(ripple, 'left', `${x}px`);
        this.renderer.setStyle(ripple, 'top', `${y}px`);
        
        const timeoutId = window.setTimeout(() => {
          this.renderer.removeChild(button, ripple);
        }, 600);
        this.timeouts.push(timeoutId);
      });
      this.clickListeners.push(removeListener);
    });
  }

  /**
   * Initializes the device turn-on animation sequence
   * Adds classes to trigger power button glow and screen activation
   */
  private initDeviceTurnOnAnimation(): void {
    if (!this.isBrowser || !this.heroSection?.nativeElement) return;
    
    // Wait 1 second before starting the animation
    const timeoutId1 = window.setTimeout(() => {
      const screenOverlay = this.heroSection.nativeElement.querySelector('.screen-overlay');
      const screenContent = this.heroSection.nativeElement.querySelector('.screen-content');
      const powerButton = this.heroSection.nativeElement.querySelector('.device-power-button');
      
      if (screenOverlay && screenContent && powerButton) {
        // Add power button glow effect
        this.renderer.addClass(powerButton, 'power-on');
        
        // After a short delay, start the screen turn-on animation
        const timeoutId2 = window.setTimeout(() => {
          this.renderer.addClass(screenContent, 'active');
          this.renderer.addClass(screenOverlay, 'fade-out');
        }, 500);
        this.timeouts.push(timeoutId2);
      }
    }, 1000);
    this.timeouts.push(timeoutId1);
  }
  
  /**
   * Ensures hero animations are properly triggered
   * Forces reflow and adds animation classes to elements
   */
  private triggerHeroAnimations(): void {
    if (!this.isBrowser || !this.heroSection?.nativeElement) return;
    
    // Force a reflow to ensure animations start properly
    const heroContent = this.heroSection.nativeElement.querySelector('.hero-content');
    const heroVisual = this.heroSection.nativeElement.querySelector('.hero-visual');
    const floatingElements = this.heroSection.nativeElement.querySelectorAll('.floating-element');
    
    if (heroContent) {
      // Force reflow
      void heroContent.offsetWidth;
      
      // Add animation classes if needed
      this.renderer.addClass(heroContent, 'animate');
    }
    
    if (heroVisual) {
      void heroVisual.offsetWidth;
      this.renderer.addClass(heroVisual, 'animate');
    }
    
    floatingElements.forEach((element: HTMLElement) => {
      void element.offsetWidth;
      this.renderer.addClass(element, 'animate');
    });
  }
}
```

### HTML: Add Keyboard Handlers and Type Attribute

```html
<!-- src/app/features/home/components/hero/hero.component.html -->

<!-- ================= HERO SECTION ================= -->
<section id="hero" class="hero" #heroSection aria-label="Hero section">
  <div class="hero-container">
    <!-- Hero Content Area -->
    <div class="hero-content">
      <h1 class="hero-title">
        Your Financial <span class="gradient-text">Freedom</span><br>
        Starts Here
      </h1>
      <p class="hero-subtitle">
        Take control of your money with Alpha Vault. Manage income, expenses, budgets, savings, investments, and debt - all in one powerful platform designed for the next generation.
      </p>
      
      <!-- Call to Action Buttons -->
      <div class="hero-buttons">
        <button 
          type="button"
          class="btn-primary large" 
          routerLink="/auth"
          (keydown.enter)="navigateToAuth()"
          (keydown.space)="navigateToAuth(); $event.preventDefault()"
          aria-label="Start your journey with Alpha Vault">
          <i class="fas fa-rocket" aria-hidden="true"></i>
          Start Your Journey
        </button>
      </div>
      
      <!-- Statistics Display -->
      <div class="hero-stats" aria-label="Alpha Vault statistics">
        <div class="stat">
          <span class="stat-number">10K+</span>
          <span class="stat-label">Active Users</span>
        </div>
        <div class="stat">
          <span class="stat-number">$2M+</span>
          <span class="stat-label">Money Managed</span>
        </div>
        <div class="stat">
          <span class="stat-number">95%</span>
          <span class="stat-label">Success Rate</span>
        </div>
      </div>
    </div>
    
    <!-- Hero Visual Area -->
    <div class="hero-visual">
      <div class="device-background-wrapper">
        <div class="marketing-blob"></div>
      </div>
      
      <!-- Device Mockup -->
      <div class="device-mockup">
        <div class="device-frame">
          <div class="device-power-button"></div>

          <div class="device-screen">
            <div class="screen-content">
              <div class="screen-overlay"></div>
              <!-- App Interface Mockup -->
              <div class="app-interface">
                <div class="balance-card">
                  <h3>Total Balance</h3>
                  <span class="balance">$2,847.50</span>
                  <div class="balance-change positive">+12.5% this month</div>
                </div>
                <div class="quick-actions">
                  <div class="action-btn"><i class="fas fa-plus" aria-hidden="true"></i></div>
                  <div class="action-btn"><i class="fas fa-minus" aria-hidden="true"></i></div>
                  <div class="action-btn"><i class="fas fa-chart-line" aria-hidden="true"></i></div>
                  <div class="action-btn"><i class="fas fa-piggy-bank" aria-hidden="true"></i></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
  
  <!-- Background Elements -->
  <div class="hero-bg-elements">
    <div class="floating-element element-1">
      <i class="fas fa-wallet" aria-hidden="true"></i>
    </div>
    <div class="floating-element element-2">
      <i class="fas fa-gem" aria-hidden="true"></i>
    </div>
  </div>
</section>
```

### SCSS: Add Focus Styles and Reduced Motion Support

```scss
// src/app/features/home/components/hero/hero.component.scss

.btn-primary {
  background: var(--primary-gradient);
  color: white;
  border: none;
  border-radius: var(--border-radius-sm);
  padding: 12px 24px;
  font-weight: 600;
  cursor: pointer;
  transition: var(--transition-standard);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  box-shadow: 0 10px 25px rgba(99, 102, 241, 0.3);
  position: relative;
  overflow: hidden;
  
  &:hover {
    transform: translateY(-3px);
    box-shadow: 0 15px 30px rgba(99, 102, 241, 0.4);
  }
  
  &:focus-visible {
    outline: 3px solid var(--primary-color);
    outline-offset: 2px;
    box-shadow: 0 10px 25px rgba(99, 102, 241, 0.3),
                0 0 0 3px rgba(99, 102, 241, 0.3);
  }
  
  &.large {
    padding: 16px 32px;
    font-size: 16px;
  }
}

// Remove unused .btn-secondary class (lines 114-140)

/* ================= ACCESSIBILITY ENHANCEMENTS ================= */

@media (prefers-reduced-motion: reduce) {
  .btn-primary {
    transition: none;
    
    &:hover {
      transform: none;
    }
  }
  
  .marketing-blob {
    animation: none;
  }
  
  .device-mockup {
    animation: none;
  }
  
  .floating-element {
    animation: none !important;
  }
  
  .ripple {
    animation: none;
  }
}
```

### Spec: Create Comprehensive Test File

```typescript
// src/app/features/home/components/hero/hero.component.spec.ts

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { PLATFORM_ID } from '@angular/core';

import { HeroComponent } from './hero.component';

describe('HeroComponent', () => {
  let component: HeroComponent;
  let fixture: ComponentFixture<HeroComponent>;
  let router: Router;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HeroComponent],
      providers: [
        { provide: PLATFORM_ID, useValue: 'browser' }
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HeroComponent);
    component = fixture.componentInstance;
    router = TestBed.inject(Router);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Accessibility', () => {
    it('should have proper ARIA attributes', () => {
      const section = fixture.nativeElement.querySelector('section');
      const button = fixture.nativeElement.querySelector('button');
      const stats = fixture.nativeElement.querySelector('.hero-stats');

      expect(section.getAttribute('aria-label')).toBe('Hero section');
      expect(button.getAttribute('aria-label')).toBe('Start your journey with Alpha Vault');
      expect(stats.getAttribute('aria-label')).toBe('Alpha Vault statistics');
    });

    it('should have aria-hidden on decorative icons', () => {
      const icons = fixture.nativeElement.querySelectorAll('i[aria-hidden="true"]');
      expect(icons.length).toBeGreaterThan(0);
      icons.forEach((icon: HTMLElement) => {
        expect(icon.getAttribute('aria-hidden')).toBe('true');
      });
    });
  });

  describe('Keyboard Navigation', () => {
    it('should navigate on Enter key press', () => {
      const button = fixture.nativeElement.querySelector('button');
      const navigateSpy = spyOn(component, 'navigateToAuth');
      
      const enterEvent = new KeyboardEvent('keydown', { key: 'Enter' });
      button.dispatchEvent(enterEvent);
      
      expect(navigateSpy).toHaveBeenCalled();
    });

    it('should navigate on Space key press and prevent default', () => {
      const button = fixture.nativeElement.querySelector('button');
      const navigateSpy = spyOn(component, 'navigateToAuth');
      
      const spaceEvent = new KeyboardEvent('keydown', { key: ' ', cancelable: true });
      button.dispatchEvent(spaceEvent);
      
      expect(navigateSpy).toHaveBeenCalled();
      expect(spaceEvent.defaultPrevented).toBe(true);
    });
  });

  describe('Navigation', () => {
    it('should navigate to auth route when navigateToAuth is called', () => {
      const routerSpy = spyOn(router, 'navigate');
      
      component.navigateToAuth();
      
      expect(routerSpy).toHaveBeenCalledWith(['/auth']);
    });
  });

  describe('Rendering', () => {
    it('should display the hero title', () => {
      const title = fixture.nativeElement.querySelector('.hero-title');
      expect(title.textContent).toContain('Your Financial');
      expect(title.textContent).toContain('Freedom');
    });

    it('should display the hero subtitle', () => {
      const subtitle = fixture.nativeElement.querySelector('.hero-subtitle');
      expect(subtitle.textContent).toContain('Take control of your money');
    });

    it('should display statistics', () => {
      const stats = fixture.nativeElement.querySelectorAll('.stat');
      expect(stats.length).toBe(3);
    });

    it('should display the call-to-action button', () => {
      const button = fixture.nativeElement.querySelector('button');
      expect(button.textContent.trim()).toContain('Start Your Journey');
      expect(button.classList.contains('btn-primary')).toBe(true);
    });
  });

  describe('Cleanup', () => {
    it('should clean up event listeners on destroy', () => {
      component.ngAfterViewInit();
      const listeners = (component as any).clickListeners;
      
      expect(listeners.length).toBeGreaterThan(0);
      
      listeners.forEach((removeListener: () => void) => {
        spyOn({ removeListener }, 'removeListener');
      });
      
      component.ngOnDestroy();
      
      expect((component as any).clickListeners.length).toBe(0);
    });

    it('should clear timeouts on destroy', () => {
      component.ngAfterViewInit();
      const timeouts = (component as any).timeouts;
      
      if (timeouts.length > 0) {
        spyOn(window, 'clearTimeout');
        component.ngOnDestroy();
        expect(window.clearTimeout).toHaveBeenCalledTimes(timeouts.length);
      }
    });
  });

  describe('SSR Compatibility', () => {
    it('should not set up animations on server', () => {
      TestBed.resetTestingModule();
      TestBed.configureTestingModule({
        imports: [HeroComponent],
        providers: [
          { provide: PLATFORM_ID, useValue: 'server' }
        ]
      });
      
      const serverFixture = TestBed.createComponent(HeroComponent);
      const serverComponent = serverFixture.componentInstance;
      
      spyOn(serverComponent as any, 'addRippleEffectToButtons');
      spyOn(serverComponent as any, 'initDeviceTurnOnAnimation');
      spyOn(serverComponent as any, 'triggerHeroAnimations');
      
      serverComponent.ngAfterViewInit();
      
      expect((serverComponent as any).addRippleEffectToButtons).not.toHaveBeenCalled();
      expect((serverComponent as any).initDeviceTurnOnAnimation).not.toHaveBeenCalled();
      expect((serverComponent as any).triggerHeroAnimations).not.toHaveBeenCalled();
    });
  });
});
```

---

## D) Micro-Playbook Snippets

### OnPush Strategy

```typescript
@Component({
  selector: 'app-hero',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './hero.component.html',
  styleUrls: ['./hero.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush // ADDED
})
export class HeroComponent implements AfterViewInit, OnDestroy {}
```

### Cleanup Event Listeners

```typescript
export class HeroComponent implements OnDestroy {
  private clickListeners: Array<() => void> = [];
  
  private addRippleEffectToButtons(): void {
    const removeListener = this.renderer.listen(button, 'click', handler);
    this.clickListeners.push(removeListener);
  }
  
  public ngOnDestroy(): void {
    this.clickListeners.forEach(removeListener => removeListener());
    this.clickListeners = [];
  }
}
```

### Cleanup Timeouts

```typescript
export class HeroComponent implements OnDestroy {
  private timeouts: Array<number> = [];
  
  private initDeviceTurnOnAnimation(): void {
    const timeoutId = window.setTimeout(() => { /* ... */ }, 1000);
    this.timeouts.push(timeoutId);
  }
  
  public ngOnDestroy(): void {
    this.timeouts.forEach(timeoutId => clearTimeout(timeoutId));
    this.timeouts = [];
  }
}
```

### SSR Guard

```typescript
import { isPlatformBrowser } from '@angular/common';
import { PLATFORM_ID, inject } from '@angular/core';

export class HeroComponent {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly isBrowser = isPlatformBrowser(this.platformId);

  public ngAfterViewInit(): void {
    if (!this.isBrowser) return; // Guard SSR
    this.addRippleEffectToButtons();
  }
}
```

### Reduced Motion Support

```scss
@media (prefers-reduced-motion: reduce) {
  .btn-primary {
    transition: none;
    
    &:hover {
      transform: none;
    }
  }
  
  .marketing-blob,
  .device-mockup,
  .floating-element {
    animation: none !important;
  }
}
```

---

## E) Machine-Readable JSON

```json
{
  "component": "HeroComponent",
  "overallPass": false,
  "gates": {
    "changeDetection": "fail",
    "templateHygiene": "pass",
    "subscriptions": "fail",
    "a11y": "fail",
    "security": "pass",
    "performance": "partial",
    "styles": "partial",
    "tests": "fail"
  },
  "topFindings": [
    {
      "severity": "High",
      "area": "Change Detection",
      "problem": "Missing ChangeDetectionStrategy.OnPush",
      "evidence": "component.ts:8",
      "impact": "Perf",
      "effort": "S",
      "patch": "Add changeDetection: ChangeDetectionStrategy.OnPush to @Component decorator"
    },
    {
      "severity": "High",
      "area": "Subscriptions",
      "problem": "Event listeners not cleaned up",
      "evidence": "component.ts:42-63",
      "impact": "Perf/Memory",
      "effort": "M",
      "patch": "Store listener functions in array, implement OnDestroy, remove all listeners"
    },
    {
      "severity": "High",
      "area": "Subscriptions",
      "problem": "setTimeout calls without cleanup",
      "evidence": "component.ts:58, 71, 81",
      "impact": "Perf/Memory",
      "effort": "M",
      "patch": "Store timeout IDs in array, clear all in ngOnDestroy"
    },
    {
      "severity": "High",
      "area": "Performance",
      "problem": "Direct DOM access without SSR guard",
      "evidence": "component.ts:43, 72-74, 95-97",
      "impact": "SSR/Perf",
      "effort": "S",
      "patch": "Guard all DOM access with isPlatformBrowser(PLATFORM_ID) check"
    },
    {
      "severity": "High",
      "area": "Tests",
      "problem": "No test file",
      "evidence": "N/A",
      "impact": "DX/A11y",
      "effort": "L",
      "patch": "Create comprehensive test file with a11y, keyboard nav, cleanup, and SSR tests"
    },
    {
      "severity": "High",
      "area": "Accessibility",
      "problem": "Button missing keyboard handlers",
      "evidence": "component.html:16-19",
      "impact": "A11y",
      "effort": "S",
      "patch": "Add (keydown.enter) and (keydown.space) handlers to button"
    },
    {
      "severity": "High",
      "area": "Accessibility",
      "problem": "No visible focus styles",
      "evidence": "component.scss:86-112",
      "impact": "A11y",
      "effort": "S",
      "patch": "Add &:focus-visible styles with outline and box-shadow"
    },
    {
      "severity": "Med",
      "area": "Accessibility",
      "problem": "Missing prefers-reduced-motion support",
      "evidence": "component.scss:94, 194, 203, 370, 382",
      "impact": "A11y",
      "effort": "S",
      "patch": "Add @media (prefers-reduced-motion: reduce) blocks to disable all animations"
    }
  ]
}
```

---

## Summary

The HeroComponent is a complex presentation component with animations and DOM manipulation. The main issues are:

1. **Missing OnPush strategy** - Easy fix, improves performance
2. **Memory leaks** - Event listeners and timeouts not cleaned up, needs OnDestroy
3. **No SSR guards** - Browser-only APIs will fail on server
4. **Incomplete accessibility** - Missing keyboard handlers, focus styles, and reduced motion support
5. **No tests** - Critical component needs comprehensive test coverage

All fixes are straightforward and can be applied immediately. The component structure is good, but needs these production-ready enhancements to prevent memory leaks and ensure SSR compatibility.

