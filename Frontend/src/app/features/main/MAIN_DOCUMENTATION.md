# 🏠 Main Component Documentation

**Alpha Vault Financial System**  
**Author:** Mohamed Dhaoui  
**Version:** 1.0.0  
**Last Updated:** December 2024

---

## 📋 Table of Contents

1. [Overview](#overview)
2. [Architecture](#architecture)
3. [Component Structure](#component-structure)
4. [Child Components](#child-components)
5. [Layout & Responsive Design](#layout--responsive-design)
6. [Sidebar Management](#sidebar-management)
7. [State Management](#state-management)
8. [Performance Optimizations](#performance-optimizations)
9. [Security Features](#security-features)
10. [Accessibility](#accessibility)
11. [Styling & Design](#styling--design)
12. [Testing](#testing)
13. [Troubleshooting](#troubleshooting)

---

## 🎯 Overview

The Main Component is the primary layout wrapper for the authenticated application area. It provides the foundational structure for the entire authenticated user experience, managing the navigation bar, sidebar, and main content area. It handles responsive design, mobile sidebar toggling, component initialization, and accessibility features.

### Key Features

- **Layout Management**: Organizes navbar, sidebar, and content area in a fixed layout
- **Responsive Design**: Adaptive layout for desktop, tablet, and mobile devices
- **Mobile Sidebar**: Toggle sidebar on mobile devices with smooth animations
- **Component Initialization**: Tracks loading states of child components
- **Accessibility**: WCAG 2.2 AA compliant with proper ARIA attributes and keyboard navigation
- **SSR Compatible**: Guards all browser-only APIs for server-side rendering
- **Performance**: OnPush change detection strategy for optimal performance
- **Safe DOM Manipulation**: Uses Renderer2 for all DOM operations

### Route Structure

```
/main (MainComponent)
├── /body (BodyComponent)
    ├── /dashboard (DashboardComponent)
    ├── /income (IncomeComponent)
    ├── /expense (ExpenseComponent)
    ├── /saving (SavingComponent)
    ├── /budget (BudgetComponent)
    ├── /debt (DebtComponent)
    └── /investment (InvestmentComponent)
```

---

## 🏗️ Architecture

### Design Patterns

- **Container/Presentational Pattern**: Main component as container, child components as presentational
- **Layout Component Pattern**: Provides structure and layout for child components
- **State Management Pattern**: Manages layout state (sidebar, loading) independent of business logic
- **Responsive Design Pattern**: Mobile-first approach with progressive enhancement
- **Safe DOM Pattern**: Uses Renderer2 instead of direct DOM manipulation

### Technology Stack

- **Framework**: Angular 17+ with standalone components
- **Change Detection**: OnPush strategy for optimal performance
- **DOM Manipulation**: Renderer2 for safe DOM operations
- **SSR Support**: isPlatformBrowser guards for all browser-only APIs
- **Styling**: SCSS with CSS custom properties and responsive media queries
- **Testing**: Jasmine and Karma with comprehensive test coverage

### Component Dependencies

```typescript
// Child Components
import { NavbarComponent } from '../navbar/navbar.component';
import { SidbarComponent } from '../sidbar/sidbar.component';
import { BodyComponent } from '../body/body.component';

// Angular Core
import { CommonModule, isPlatformBrowser } from '@angular/common';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  DestroyRef,
  HostListener,
  PLATFORM_ID,
  Renderer2,
} from '@angular/core';
```

---

## 📐 Component Structure

### File Structure

```
main/
├── main.component.ts          # Component logic (274 lines)
├── main.component.html         # Template (80 lines)
├── main.component.scss         # Styles (436 lines)
└── main.component.spec.ts      # Tests (72 lines)
```

### Component Class Structure

```typescript
export class MainComponent implements OnInit, OnDestroy {
  // Public Properties
  sidebarOpen: boolean = false;              // Sidebar state (mobile)
  isInitializing: boolean = true;             // Initialization state
  componentsLoaded: {                         // Child component loading states
    navbar: boolean;
    sidebar: boolean;
    body: boolean;
  };

  // Private Properties (Injected)
  private readonly destroyRef: DestroyRef;
  private readonly cdr: ChangeDetectorRef;
  private readonly renderer: Renderer2;
  private readonly platformId: PLATFORM_ID;
  private readonly isBrowser: boolean;
}
```

### Template Structure

```html
<main class="body" [class.sidebar-open]="sidebarOpen" [class.initializing]="isInitializing">
  <!-- Loading Overlay -->
  <div class="loading-overlay" *ngIf="isInitializing">
    <div class="loading-spinner"></div>
    <p>Loading Alpha Vault...</p>
  </div>

  <!-- Mobile Menu Toggle -->
  <button class="menu-toggle">...</button>

  <!-- Navbar -->
  <nav class="navbar-container">
    <app-navbar></app-navbar>
  </nav>

  <!-- Sidebar -->
  <aside class="sidebar-container">
    <app-sidbar></app-sidbar>
  </aside>

  <!-- Main Content -->
  <section class="content-container">
    <app-body></app-body>
  </section>

  <!-- Mobile Overlay -->
  <div class="overlay" *ngIf="sidebarOpen"></div>

  <!-- Screen Reader Announcements -->
  <div class="sr-only" aria-live="polite">...</div>
</main>
```

---

## 🧩 Child Components

### 1. NavbarComponent

**Purpose**: Top navigation bar with user menu, notifications, language selector, and home button

**Location**: `../navbar/navbar.component.ts`

**Features**:
- User avatar and dropdown menu
- Notification center
- Language selector
- Home navigation button
- Responsive design

**Communication**:
- Emits `componentLoaded` event when initialized
- Receives `loaded` class for animation

### 2. SidbarComponent

**Purpose**: Left sidebar navigation with section navigation buttons

**Location**: `../sidbar/sidbar.component.ts`

**Features**:
- Section navigation (Dashboard, Income, Expense, etc.)
- Dynamic color theming per section
- Active route highlighting
- Responsive design (hidden on mobile, toggleable)
- Logo and branding

**Communication**:
- Emits `componentLoaded` event when initialized
- Receives `loaded` class for animation
- Controlled by `sidebarOpen` state from parent

### 3. BodyComponent

**Purpose**: Main content area with router outlet for child routes

**Location**: `../body/body.component.ts`

**Features**:
- Router outlet for dynamic content
- Loading states
- Error handling
- Content transitions

**Communication**:
- Emits `componentLoaded` event when initialized
- Receives `loaded` class for animation
- Contains router outlet for child routes

---

## 📱 Layout & Responsive Design

### Desktop Layout (>1024px)

```
┌─────────────────────────────────────────┐
│  Sidebar │ Navbar (full width)          │
│  (70px)  ├──────────────────────────────┤
│          │                              │
│          │     Content Area             │
│          │     (full width)             │
│          │                              │
│          │                              │
└──────────┴──────────────────────────────┘
```

**Layout Properties**:
- Sidebar: Fixed, 70px width, always visible
- Navbar: Fixed, 80px height, positioned after sidebar
- Content: Fixed, fills remaining space

### Tablet Layout (768px - 1024px)

```
┌─────────────────────────────────────────┐
│  Navbar (full width)                    │
├─────────────────────────────────────────┤
│                                          │
│     Content Area                         │
│     (full width)                         │
│                                          │
│                                          │
└─────────────────────────────────────────┘

Sidebar: Hidden by default, toggleable
```

### Mobile Layout (<768px)

```
┌─────────────────────────────────────────┐
│  [Menu] Navbar (full width)             │
├─────────────────────────────────────────┤
│                                          │
│     Content Area                         │
│     (full width)                         │
│                                          │
│                                          │
└─────────────────────────────────────────┘

Sidebar: Hidden off-screen, slide-in on toggle
Overlay: Dark overlay when sidebar is open
```

### CSS Custom Properties

```scss
:root {
  --sidebar-width: 70px;      // Desktop sidebar width
  --navbar-height: 80px;       // Navbar height
}

@media (width <= 768px) {
  :root {
    --sidebar-width: 50px;     // Mobile sidebar width
    --navbar-height: 80px;     // Navbar height (unchanged)
  }
}
```

### Layout Calculations

```scss
// Navbar positioning
.navbar-container {
  left: calc(var(--sidebar-width, 70px) + 10px);
  width: calc(100% - var(--sidebar-width, 70px) - 20px);
}

// Content positioning
.content-container {
  left: calc(var(--sidebar-width, 70px) + 10px);
  top: calc(var(--navbar-height, 80px));
  width: calc(100% - var(--sidebar-width, 70px) - 20px);
  height: calc(100vh - var(--navbar-height, 80px));
}
```

---

## 🎛️ Sidebar Management

### Desktop Behavior

- Sidebar is always visible (70px width)
- Fixed position on left side
- No toggle functionality needed

### Mobile Behavior

- Sidebar is hidden by default (off-screen)
- Toggle button (hamburger menu) in top-left corner
- Slide-in animation when opened
- Dark overlay when open
- Content shifts to accommodate sidebar
- Auto-closes on window resize (>1024px)

### Sidebar State Management

```typescript
// Toggle sidebar
toggleSidebar(): void {
  this.sidebarOpen = !this.sidebarOpen;
  this.updateBodyScroll();      // Prevent body scroll when open
  this.announceSidebarState();  // Screen reader announcement
  this.cdr.markForCheck();      // Trigger change detection
}

// Close sidebar
closeSidebar(): void {
  if (!this.sidebarOpen) return;
  this.sidebarOpen = false;
  this.updateBodyScroll();
  this.announceSidebarState();
  this.cdr.markForCheck();
}
```

### Keyboard Controls

- **Escape Key**: Closes sidebar (if open)
- **Enter/Space**: Activates menu toggle button
- **Tab Navigation**: Supports keyboard navigation through all elements

### Body Scroll Management

When sidebar is open on mobile, body scroll is disabled to prevent background scrolling:

```typescript
private updateBodyScroll(): void {
  if (!this.isBrowser) return;
  
  const body = document.body;
  if (this.sidebarOpen) {
    this.renderer.setStyle(body, 'overflow', 'hidden');
  } else {
    this.renderer.removeStyle(body, 'overflow');
  }
}
```

### Window Resize Handling

```typescript
@HostListener('window:resize')
onWindowResize(): void {
  if (!this.isBrowser) return;
  
  // Auto-close sidebar on large screens (desktop behavior)
  if (window.innerWidth > 1024 && this.sidebarOpen) {
    this.closeSidebar();
  }
}
```

---

## 🗄️ State Management

### Component State

```typescript
// Sidebar State
sidebarOpen: boolean = false;           // Mobile sidebar open/closed

// Initialization State
isInitializing: boolean = true;         // Component initialization

// Child Component Loading States
componentsLoaded: {
  navbar: boolean;      // Navbar component loaded
  sidebar: boolean;     // Sidebar component loaded
  body: boolean;        // Body component loaded
}
```

### State Flow

```
1. Component Initializes
   ↓
2. isInitializing = true
   ↓
3. setupAccessibility() + setupKeyboardNavigation()
   ↓
4. requestAnimationFrame() → Simulate component loading
   ↓
5. componentsLoaded = { navbar: true, sidebar: true, body: true }
   ↓
6. checkAllComponentsLoaded() → All loaded?
   ↓
7. isInitializing = false
   ↓
8. Loading overlay disappears
```

### Child Component Communication

Child components emit `componentLoaded` events:

```typescript
onComponentLoaded(componentName: keyof typeof this.componentsLoaded): void {
  this.componentsLoaded[componentName] = true;
  this.checkAllComponentsLoaded();
  this.cdr.markForCheck();
}

private checkAllComponentsLoaded(): void {
  const allLoaded = Object.values(this.componentsLoaded).every(loaded => loaded);
  if (allLoaded) {
    this.isInitializing = false;
    this.cdr.markForCheck();
  }
}
```

---

## ⚡ Performance Optimizations

### Change Detection Strategy

```typescript
@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
})
```

**Benefits:**
- Reduces change detection cycles
- Only triggers when inputs change or manually triggered
- Improves performance, especially with multiple child components

### Manual Change Detection

```typescript
private readonly cdr = inject(ChangeDetectorRef);

// After state changes
this.cdr.markForCheck();
```

### RequestAnimationFrame

Uses `requestAnimationFrame` for initialization to ensure smooth rendering:

```typescript
requestAnimationFrame(() => {
  if (!this.isBrowser) return;
  this.componentsLoaded.navbar = true;
  this.componentsLoaded.sidebar = true;
  this.componentsLoaded.body = true;
  this.checkAllComponentsLoaded();
});
```

### Renderer2 for DOM Operations

Uses Renderer2 instead of direct DOM manipulation:

```typescript
// Safe DOM manipulation
this.renderer.setStyle(body, 'overflow', 'hidden');
this.renderer.removeStyle(body, 'overflow');
this.renderer.createElement('div');
this.renderer.setAttribute(element, 'aria-live', 'polite');
```

**Benefits:**
- SSR compatible
- Works in web workers
- Safer than direct DOM access

### GPU-Accelerated Animations

CSS animations use GPU-accelerated properties:

```scss
.menu-toggle {
  transform: translate3d(calc(var(--sidebar-width, 70px) + 6px), 0, 0);
  will-change: transform;
  backface-visibility: hidden;
}
```

---

## 🔒 Security Features

### SSR Guards

All browser-only APIs are guarded:

```typescript
private readonly platformId = inject(PLATFORM_ID);
private readonly isBrowser = isPlatformBrowser(this.platformId);

ngOnInit(): void {
  if (!this.isBrowser) return;
  this.initializeComponent();
}

private updateBodyScroll(): void {
  if (!this.isBrowser) return;
  // Browser-only code
}
```

### Safe DOM Manipulation

Uses Renderer2 for all DOM operations:

```typescript
// Safe element creation
const announcement = this.renderer.createElement('div');
this.renderer.setAttribute(announcement, 'aria-live', 'polite');
this.renderer.setProperty(announcement, 'textContent', message);
this.renderer.appendChild(document.body, announcement);
```

### Cleanup on Destroy

Proper cleanup prevents memory leaks:

```typescript
ngOnDestroy(): void {
  this.cleanup();
}

private cleanup(): void {
  if (!this.isBrowser) return;
  
  // Restore body scroll
  this.renderer.removeStyle(document.body, 'overflow');
  
  // Close sidebar if open
  if (this.sidebarOpen) {
    this.sidebarOpen = false;
    this.cdr.markForCheck();
  }
}
```

---

## ♿ Accessibility

### Semantic HTML

```html
<main role="main" aria-label="Main application area">
  <nav role="banner" aria-label="Main navigation">
  <aside role="navigation" aria-label="Sidebar navigation">
  <section role="region" aria-label="Main content">
```

### ARIA Attributes

- `role="main"` for main content area
- `role="banner"` for navbar
- `role="navigation"` for sidebar
- `role="region"` for content area
- `role="button"` for overlay
- `role="status"` for loading state
- `aria-label` for all interactive elements
- `aria-expanded` for toggle button
- `aria-controls` linking toggle to sidebar
- `aria-hidden` for sidebar state
- `aria-live="polite"` for dynamic announcements

### Keyboard Navigation

- **Tab**: Navigate through all interactive elements
- **Enter/Space**: Activate buttons and toggles
- **Escape**: Close sidebar (if open)
- **Arrow Keys**: Navigate within sidebar (handled by child component)

### Screen Reader Support

Dynamic announcements for state changes:

```typescript
private announceToScreenReader(message: string): void {
  if (!this.isBrowser) return;
  
  const announcement = this.renderer.createElement('div');
  this.renderer.setAttribute(announcement, 'aria-live', 'polite');
  this.renderer.setAttribute(announcement, 'aria-atomic', 'true');
  this.renderer.addClass(announcement, 'sr-only');
  this.renderer.setProperty(announcement, 'textContent', message);
  
  this.renderer.appendChild(document.body, announcement);
  
  // Remove after announcement
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      if (this.renderer.parentNode(announcement)) {
        this.renderer.removeChild(document.body, announcement);
      }
    });
  });
}
```

### Focus Management

- Focus returns to toggle button after sidebar closes
- Focus trap in sidebar (handled by child component)
- Visible focus indicators for all interactive elements

### Reduced Motion Support

```scss
@media (prefers-reduced-motion: reduce) {
  .body,
  .navbar-container,
  .sidebar-container,
  .content-container,
  .menu-toggle,
  .overlay {
    animation: none;
    transition: none;
  }
}
```

### High Contrast Support

```scss
@media (prefers-contrast: high) {
  .overlay {
    background: rgb(0 0 0 / 80%);
  }
  
  .menu-toggle {
    background: #fff;
    border: 2px solid #000;
  }
}
```

---

## 🎨 Styling & Design

### CSS Custom Properties

```scss
:root {
  --sidebar-width: 70px;      // Desktop sidebar width
  --navbar-height: 80px;       // Navbar height
}

@media (width <= 768px) {
  :root {
    --sidebar-width: 50px;     // Mobile sidebar width
    --navbar-height: 80px;     // Navbar height (unchanged)
  }
}
```

### Animations

#### Fade In

```scss
@keyframes fadeIn {
  from { opacity: 0; }
  to   { opacity: 1; }
}
```

#### Slide In From Left

```scss
@keyframes slideInFromLeft {
  from {
    opacity: 0;
    transform: translateX(-100%);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}
```

#### Slide In From Top

```scss
@keyframes slideInFromTop {
  from {
    opacity: 0;
    transform: translateY(-100%);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
```

#### Scale In

```scss
@keyframes scaleIn {
  from {
    opacity: 0;
    transform: scale(0.95);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}
```

#### Spin

```scss
@keyframes spin {
  0%   { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
```

### Component Animations

- **Navbar**: Slide in from top (0.6s)
- **Sidebar**: Slide in from left (0.5s)
- **Content**: Scale in (0.7s, 0.2s delay)
- **Menu Toggle**: Fade in (0.8s)
- **Loading Overlay**: Fade in (0.3s)

### Mobile Sidebar Animation

```scss
@media (width <= 1024px) {
  .sidebar-container {
    transform: translate3d(-100%, 0, 0);  // Hidden by default
    transition: transform 0.4s ease-out;
  }
  
  .body.sidebar-open .sidebar-container {
    transform: translate3d(0, 0, 0);      // Slide in when open
  }
}
```

### Content Shrinking Animation

When sidebar opens on mobile, content shrinks from the right:

```scss
.body.sidebar-open {
  .navbar-container {
    left: calc(var(--sidebar-width, 70px) + 10px);
    right: 10px;
    width: auto;  // Shrinks from right
  }
  
  .content-container {
    left: calc(var(--sidebar-width, 70px) + 10px);
    right: 10px;
    width: auto;  // Shrinks from right
  }
}
```

### Loading Overlay

```scss
.loading-overlay {
  position: fixed;
  inset: 0;
  z-index: 1000;
  background: rgb(255 255 255 / 95%);
  backdrop-filter: blur(10px);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
}
```

---

## 🧪 Testing

### Test Coverage

The component includes comprehensive test coverage:

```typescript
describe('MainComponent', () => {
  it('should create', () => {
    expect(component).toBeTruthy();
  });
  
  it('should initialize with sidebar closed', () => {
    expect(component.sidebarOpen).toBeFalse();
  });
  
  it('should toggle sidebar state', () => {
    const initialState = component.sidebarOpen;
    component.toggleSidebar();
    expect(component.sidebarOpen).toBe(!initialState);
  });
  
  it('should close sidebar', () => {
    component.sidebarOpen = true;
    component.closeSidebar();
    expect(component.sidebarOpen).toBeFalse();
  });
  
  it('should track component loading states', () => {
    expect(component.componentsLoaded.navbar).toBeFalse();
    expect(component.componentsLoaded.sidebar).toBeFalse();
    expect(component.componentsLoaded.body).toBeFalse();
  });
  
  it('should mark components as loaded', () => {
    component.onComponentLoaded('navbar');
    expect(component.componentsLoaded.navbar).toBeTrue();
  });
  
  it('should handle component loading completion', () => {
    component.onComponentLoaded('navbar');
    component.onComponentLoaded('sidebar');
    component.onComponentLoaded('body');
    expect(component.isInitializing).toBeFalse();
  });
});
```

### Test Scenarios

1. **Component Initialization**: Component creates and initializes correctly
2. **Sidebar Toggle**: Sidebar state toggles correctly
3. **Sidebar Close**: Sidebar closes correctly
4. **Component Loading**: Loading states tracked correctly
5. **Component Completion**: Initialization completes when all components loaded

---

## 🔧 Troubleshooting

### Common Issues

#### 1. Sidebar Not Toggling on Mobile

**Problem**: Menu toggle button doesn't open/close sidebar.

**Solution**:
- Check that `sidebarOpen` property is updating
- Verify `cdr.markForCheck()` is called after state change
- Check CSS media queries are correct
- Ensure `translate3d` transform is applied correctly
- Check browser console for errors

#### 2. Content Not Shrinking When Sidebar Opens

**Problem**: Content doesn't adjust when sidebar opens on mobile.

**Solution**:
- Verify `.body.sidebar-open` class is applied
- Check CSS calculations for `left` and `right` properties
- Ensure `width: auto` is set for content containers
- Verify CSS custom properties are defined correctly

#### 3. Body Scroll Not Disabled

**Problem**: Background scrolls when sidebar is open.

**Solution**:
- Check that `updateBodyScroll()` is called
- Verify `renderer.setStyle()` is working correctly
- Ensure `overflow: hidden` is applied to body
- Check that cleanup restores scroll on destroy

#### 4. Loading Overlay Stuck

**Problem**: Loading overlay never disappears.

**Solution**:
- Check that `componentsLoaded` is being updated
- Verify `checkAllComponentsLoaded()` is called
- Ensure child components emit `componentLoaded` events
- Check that `isInitializing` is set to `false`

#### 5. Sidebar Not Closing on Window Resize

**Problem**: Sidebar stays open when resizing to desktop size.

**Solution**:
- Verify `@HostListener('window:resize')` is working
- Check that `window.innerWidth > 1024` condition is correct
- Ensure `closeSidebar()` is called
- Verify `cdr.markForCheck()` is called

### Debugging Tips

1. **Enable Console Logging** (temporarily):
```typescript
toggleSidebar(): void {
  console.log('Toggling sidebar, current state:', this.sidebarOpen);
  this.sidebarOpen = !this.sidebarOpen;
  console.log('New state:', this.sidebarOpen);
  // ... rest of method
}
```

2. **Check Component State**:
```typescript
console.log('Sidebar Open:', this.sidebarOpen);
console.log('Initializing:', this.isInitializing);
console.log('Components Loaded:', this.componentsLoaded);
```

3. **Verify CSS Custom Properties**:
```javascript
// In browser console
getComputedStyle(document.documentElement).getPropertyValue('--sidebar-width');
getComputedStyle(document.documentElement).getPropertyValue('--navbar-height');
```

4. **Monitor DOM Changes**:
- Use browser DevTools → Elements tab
- Inspect `.body`, `.sidebar-container`, `.content-container`
- Check applied classes and styles
- Verify transform values

---

## 📚 Additional Resources

### Related Documentation

- [Navbar Component](../navbar/navbar.component.ts)
- [Sidebar Component](../sidbar/SIDBAR_DOCUMENTATION.md)
- [Body Component](../body/body.component.ts)
- [Angular Change Detection](https://angular.dev/guide/change-detection)
- [Angular Renderer2](https://angular.dev/api/core/Renderer2)
- [WCAG 2.2 Guidelines](https://www.w3.org/WAI/WCAG22/quickref/)

### Code References

- **Component**: `src/app/features/main/main.component.ts`
- **Template**: `src/app/features/main/main.component.html`
- **Styles**: `src/app/features/main/main.component.scss`
- **Tests**: `src/app/features/main/main.component.spec.ts`

---

## 📝 Changelog

### Version 1.0.0 (December 2024)

- Initial implementation
- Layout wrapper for authenticated application area
- Responsive design with mobile sidebar
- Component initialization tracking
- Accessibility features (WCAG 2.2 AA)
- SSR compatibility with browser guards
- OnPush change detection strategy
- Safe DOM manipulation with Renderer2
- Comprehensive test coverage
- Smooth animations and transitions

---

**Document Generated:** December 2024  
**Component Version:** 1.0.0  
**Last Reviewed:** December 2024

