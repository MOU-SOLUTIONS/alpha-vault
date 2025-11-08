# 👤 Profile Component Documentation

**Alpha Vault Financial System**  
**Author:** Mohamed Dhaoui  
**Version:** 1.0.0  
**Last Updated:** December 2024

---

## 📋 Table of Contents

1. [Overview](#overview)
2. [Architecture](#architecture)
3. [Component Structure](#component-structure)
4. [SEO Implementation](#seo-implementation)
5. [Form Management](#form-management)
6. [File Upload](#file-upload)
7. [Accessibility](#accessibility)
8. [Performance Optimizations](#performance-optimizations)
9. [Security Features](#security-features)
10. [Styling & Design](#styling--design)
11. [Testing](#testing)
12. [Troubleshooting](#troubleshooting)

---

## 🎯 Overview

The Profile Component is a comprehensive user profile management interface that allows authenticated users to update their personal information, preferences, and profile image. It serves as a parent page component with proper SEO implementation, following Angular best practices for performance, accessibility, and security.

### Key Features

- **User Profile Management**: Update personal information (name, email)
- **Preferences Configuration**: Set preferred language and currency
- **Password Management**: Optional password change functionality
- **Profile Image Upload**: Upload and manage profile pictures
- **SEO Optimized**: Proper meta tags, canonical URLs, and structured data
- **Accessibility**: WCAG 2.2 AA compliant with proper ARIA attributes
- **Performance**: OnPush change detection, trackBy functions, memoized getters
- **Security**: File validation, SSR-safe implementation, secure file handling
- **Responsive Design**: Mobile-first approach with adaptive layouts

### Route Structure

```
/main/body/profile (ProfileComponent)
```

---

## 🏗️ Architecture

### Component Hierarchy

```
ProfileComponent (Parent Page)
├── Form Sections
│   ├── Personal Information Section
│   ├── Preferences Section
│   └── Password Change Section
├── Image Upload Component
└── Form Actions (Reset/Save)
```

### Dependencies

- **SeoService**: Centralized SEO meta tag management
- **AuthService**: Current user data retrieval
- **UserService**: Profile updates and image uploads
- **NotificationService**: User feedback for actions
- **FormBuilder**: Reactive form management

### Change Detection Strategy

```typescript
changeDetection: ChangeDetectionStrategy.OnPush
```

- Prevents unnecessary change detection cycles
- Requires explicit `markForCheck()` calls for async updates
- Optimizes performance for large forms

---

## 📁 Component Structure

### File Organization

```
profile/
├── profile.component.ts         # Component logic (488 lines)
├── profile.component.html       # Template (416 lines)
├── profile.component.scss       # Styles (1184 lines)
├── profile.component.spec.ts    # Tests (425 lines)
└── PROFILE_DOCUMENTATION.md     # This file
```

### Component Class Structure

```typescript
export class ProfileComponent implements OnInit {
  // Injected Services
  private readonly destroyRef: DestroyRef;
  private readonly cdr: ChangeDetectorRef;
  private readonly fb: FormBuilder;
  private readonly authService: AuthService;
  private readonly userService: UserService;
  private readonly notificationService: NotificationService;
  private readonly seo: SeoService;
  private readonly router: Router;
  private readonly platformId: PLATFORM_ID;
  private readonly isBrowser: boolean;

  // Form & State
  profileForm!: FormGroup;
  currentUser: UserResponseDTO | null = null;
  isLoading = false;
  isSaving = false;
  hasError = false;
  errorMessage = '';
  isUploading = false;
  selectedFile: File | null = null;
  previewUrl: string | null = null;

  // ViewChild References
  @ViewChild('fileInput') fileInputRef?: ElementRef<HTMLInputElement>;

  // TrackBy Functions
  trackByLanguage = (_: number, lang) => lang.value;
  trackByCurrency = (_: number, currency) => currency.value;

  // Memoized Getters
  get selectedLanguageLabel(): string;
  get selectedCurrencyLabel(): string;
}
```

### Template Structure

```html
<main class="profile-container">
  <header class="profile-header">
    <h1>User Profile</h1> <!-- Single H1 for SEO -->
  </header>

  <!-- Loading State -->
  <div *ngIf="isLoading">...</div>

  <!-- Error State -->
  <div *ngIf="hasError">...</div>

  <!-- Form Content -->
  <form [formGroup]="profileForm" (ngSubmit)="onSubmit()">
    <!-- Personal Information Section -->
    <section aria-labelledby="personalInfoHeading">
      <h2 id="personalInfoHeading">Personal Information</h2>
      <!-- Form fields -->
    </section>

    <!-- Preferences Section -->
    <section aria-labelledby="preferencesHeading">
      <h2 id="preferencesHeading">Preferences</h2>
      <!-- Language & Currency selects -->
      
      <!-- Password Subsection -->
      <section aria-labelledby="passwordHeading">
        <h2 id="passwordHeading">Change Password</h2>
        <!-- Password fields -->
      </section>
    </section>

    <!-- Form Actions -->
    <div class="form-actions">
      <button type="button" (click)="loadUserData()">Reset</button>
      <button type="submit">Save Changes</button>
    </div>
  </form>
</main>
```

---

## 🔍 SEO Implementation

### SEO Service Integration

The component uses `SeoService` for centralized meta tag management:

```typescript
private setupSEO(): void {
  this.seo.set({
    title: 'User Profile',
    description: 'Manage and update your personal information, preferences, and account settings in Alpha Vault financial management system.',
    canonicalUrl: 'https://alphavault.app/main/body/profile',
    keywords: ['user profile', 'account settings', 'personal information', 'preferences', 'Alpha Vault'],
    robots: 'index,follow',
    og: {
      title: 'User Profile',
      description: 'Manage and update your personal information and preferences.',
      type: 'website',
      image: '/assets/og/default.png',
    },
    twitter: {
      card: 'summary_large_image',
      title: 'User Profile',
      description: 'Manage and update your personal information and preferences.',
      image: '/assets/og/default.png',
    },
  }, 'Alpha Vault');
}
```

### SEO Best Practices

✅ **Single H1 Tag**: Only one `<h1>` present in the template  
✅ **Semantic HTML**: Proper use of `<main>`, `<section>`, `<header>`  
✅ **Canonical URL**: Absolute URL set for duplicate content prevention  
✅ **Meta Tags**: Title, description, keywords, OG tags, Twitter cards  
✅ **Structured Data**: Ready for JSON-LD if needed  
✅ **Image Optimization**: `ngOptimizedImage` with proper attributes

### SEO Metadata

| Property | Value |
|----------|-------|
| **Title** | "User Profile" |
| **Description** | "Manage and update your personal information, preferences, and account settings in Alpha Vault financial management system." |
| **Canonical** | "https://alphavault.app/main/body/profile" |
| **OG Image** | "/assets/og/default.png" |
| **Brand Suffix** | "Alpha Vault" |

---

## 📝 Form Management

### Reactive Forms

The component uses Angular Reactive Forms with `FormBuilder`:

```typescript
profileForm = this.fb.group({
  firstName: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(50)]],
  lastName: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(50)]],
  email: ['', [Validators.required, Validators.email]],
  preferredLanguage: ['en'],
  preferredCurrency: ['USD'],
  profileImageUrl: [''],
  password: [''],
  confirmPassword: [''],
});
```

### Form Validation

- **Required Fields**: First name, last name, email
- **Email Validation**: Built-in email validator
- **Length Constraints**: Min 2, max 50 characters for names
- **Password Matching**: Custom validator for password confirmation
- **Real-time Feedback**: Visual indicators for valid/invalid states

### Form Sections

1. **Personal Information**
   - First Name (required)
   - Last Name (required)
   - Email Address (required)
   - Profile Image (optional)

2. **Preferences**
   - Preferred Language (dropdown)
   - Preferred Currency (dropdown)
   - Password Change (optional subsection)

### Form Submission

```typescript
onSubmit(): void {
  if (this.profileForm.invalid || !this.currentUser) {
    this.markFormGroupTouched(this.profileForm);
    return;
  }

  // Validate password match if provided
  const password = this.profileForm.get('password')?.value;
  const confirmPassword = this.profileForm.get('confirmPassword')?.value;

  if (password && password !== confirmPassword) {
    this.profileForm.get('confirmPassword')?.setErrors({ mismatch: true });
    return;
  }

  // Submit to API
  this.userService.updateProfile(this.currentUser.id, updateDto)
    .pipe(takeUntilDestroyed(this.destroyRef))
    .subscribe({...});
}
```

---

## 📤 File Upload

### Image Upload Flow

1. **File Selection**: User selects image via file input
2. **Client-side Validation**: File type and size validation
3. **Preview Generation**: FileReader creates preview URL
4. **Upload to Server**: FormData sent to backend
5. **Update Profile**: Profile image URL updated in form

### File Validation

```typescript
onFileSelected(event: Event): void {
  const file = input.files?.[0];
  
  // Validate file type
  if (!file.type.startsWith('image/')) {
    // Show error notification
    return;
  }

  // Validate file size (10MB max)
  const maxSize = 10 * 1024 * 1024;
  if (file.size > maxSize) {
    // Show error notification
    return;
  }

  // Create preview
  const reader = new FileReader();
  reader.onload = (e) => {
    this.previewUrl = e.target?.result as string;
    this.cdr.markForCheck();
  };
  reader.readAsDataURL(file);
}
```

### Image Optimization

The component uses `ngOptimizedImage` for optimized image loading:

```html
<img
  ngOptimizedImage
  [src]="getProfileImageUrl()"
  alt="Profile preview"
  width="150"
  height="150"
  loading="lazy"
  decoding="async"
  class="profile-image-preview"
/>
```

**Benefits:**
- Automatic image optimization
- Lazy loading for performance
- Proper aspect ratio maintenance
- Reduced layout shift

---

## ♿ Accessibility

### ARIA Attributes

- **Roles**: `main`, `form`, `status`, `alert`
- **Labels**: All inputs have associated labels
- **Described By**: Error messages linked via `aria-describedby`
- **Invalid States**: `aria-invalid` for form validation
- **Live Regions**: `aria-live="polite"` for error announcements

### Keyboard Navigation

- **Enter/Space**: Activates buttons
- **Escape**: Blurs focused inputs
- **Tab Order**: Logical focus flow through form
- **Focus Management**: Visible focus indicators

### Screen Reader Support

```html
<!-- Hidden title for form -->
<div id="profileFormTitle" class="sr-only">User Profile Update Form</div>

<!-- Error announcements -->
<div
  id="firstName-error"
  role="alert"
  aria-live="polite">
  {{ getFieldError('firstName') }}
</div>

<!-- Status announcements -->
<div class="sr-only" aria-live="polite">
  {{ isLoading ? 'Loading profile data' : hasError ? 'Error loading profile' : 'Profile form ready' }}
</div>
```

### Color Contrast

- All text meets WCAG 2.2 AA standards (4.5:1 minimum)
- Error states use high-contrast colors
- Focus indicators are clearly visible

### Reduced Motion

```scss
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

---

## ⚡ Performance Optimizations

### Change Detection

- **OnPush Strategy**: Prevents unnecessary change detection cycles
- **Manual Triggers**: `markForCheck()` only when needed
- **TrackBy Functions**: Prevents DOM re-renders in `*ngFor` loops

```typescript
// TrackBy prevents unnecessary DOM updates
trackByLanguage = (_: number, lang) => lang.value;
trackByCurrency = (_: number, currency) => currency.value;
```

### Template Optimization

- **Memoized Getters**: Avoid expensive template re-evaluations

```typescript
// Instead of method calls in template
get selectedLanguageLabel(): string {
  const value = this.profileForm.get('preferredLanguage')?.value;
  return this.preferredLanguages.find(l => l.value === value)?.label || 'English';
}
```

- **TrackBy in Loops**: All `*ngFor` use trackBy functions

```html
<option *ngFor="let lang of preferredLanguages; trackBy: trackByLanguage" [value]="lang.value">
  {{ lang.label }}
</option>
```

### Subscription Management

- **takeUntilDestroyed**: All subscriptions properly cleaned up

```typescript
this.userService.updateProfile(...)
  .pipe(takeUntilDestroyed(this.destroyRef))
  .subscribe({...});
```

### Image Loading

- **Lazy Loading**: Images load only when needed
- **Async Decoding**: Non-blocking image decoding
- **Optimized Images**: `ngOptimizedImage` for automatic optimization

---

## 🔒 Security Features

### File Upload Security

- **Type Validation**: Only image files accepted
- **Size Limits**: 10MB maximum file size
- **Client-side Validation**: Immediate feedback before upload
- **Server-side Validation**: Backend validates all uploads

### SSR Safety

- **Browser Guards**: All browser APIs guarded with `isPlatformBrowser`

```typescript
private readonly isBrowser = isPlatformBrowser(this.platformId);

if (this.isBrowser) {
  // Browser-only code (FileReader, etc.)
}
```

### DOM Access

- **ViewChild Instead of getElementById**: Safe Angular way

```typescript
@ViewChild('fileInput', { static: false }) fileInputRef?: ElementRef<HTMLInputElement>;

// Instead of: document.getElementById('profileImageFile')
if (this.fileInputRef?.nativeElement) {
  this.fileInputRef.nativeElement.value = '';
}
```

### Form Security

- **Input Sanitization**: Angular handles XSS prevention
- **CSRF Protection**: Handled by backend
- **Password Handling**: Passwords never logged or exposed

---

## 🎨 Styling & Design

### Design System

The component uses CSS custom properties for theming:

```scss
:host {
  --primary-color: #6366f1;
  --secondary-color: #8b5cf6;
  --accent-color: #a855f7;
  --success-color: #10b981;
  --error-color: #ef4444;
  --text-dark: #1a202c;
  --text-light: #64748b;
  --bg-primary: #ffffff;
  --bg-secondary: #f8fafc;
  --border-color: #e2e8f0;
  --radius-sm: 8px;
  --radius-md: 12px;
  --radius-lg: 16px;
}
```

### Layout Structure

- **Two-Column Grid**: Desktop layout with responsive breakpoints
- **Single Column**: Mobile layout (< 1024px)
- **Card-based Sections**: Visual separation with gradients and shadows
- **Consistent Spacing**: 10px margins, 1rem gaps

### Visual Features

- **Gradient Accents**: Top borders with gradient colors
- **Hover Effects**: Smooth transitions and transforms
- **Validation States**: Color-coded input states (valid/invalid)
- **Loading States**: Spinners and disabled states
- **Error States**: Clear error messaging with icons

### Responsive Design

```scss
@media (max-width: 1024px) {
  .profile-form {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .form-row {
    grid-template-columns: 1fr;
  }
  
  .form-actions {
    flex-direction: column-reverse;
  }
}
```

---

## 🧪 Testing

### Test Coverage

The component includes comprehensive unit tests covering:

- **Initialization**: Form setup, user data loading
- **Form Validation**: Required fields, email format, password matching
- **Form Submission**: Success and error scenarios
- **Helper Methods**: Field validation, label retrieval
- **Error Handling**: Loading errors, retry functionality
- **Accessibility**: ARIA attributes, keyboard navigation
- **File Upload**: File type/size validation, trackBy functions
- **Memoized Getters**: Language and currency label retrieval

### Test Structure

```typescript
describe('ProfileComponent', () => {
  describe('Initialization', () => {...});
  describe('Form Validation', () => {...});
  describe('Form Submission', () => {...});
  describe('Helper Methods', () => {...});
  describe('Error Handling', () => {...});
  describe('Accessibility', () => {...});
  describe('File Upload', () => {...});
  describe('Memoized Getters', () => {...});
});
```

### Key Test Cases

1. **SEO Setup**: Verifies SeoService is called with correct metadata
2. **Form Population**: Ensures user data populates form correctly
3. **Validation**: Tests all validation rules
4. **Password Matching**: Verifies password confirmation validation
5. **File Validation**: Tests file type and size restrictions
6. **Keyboard Navigation**: Verifies keyboard accessibility
7. **ARIA Attributes**: Ensures proper accessibility attributes

---

## 🔧 Troubleshooting

### Common Issues

#### Issue: Form not updating after save

**Solution**: Ensure `markForCheck()` is called after async operations:

```typescript
this.userService.updateProfile(...)
  .pipe(
    finalize(() => {
      this.isSaving = false;
      this.cdr.markForCheck(); // Required for OnPush
    })
  )
  .subscribe({...});
```

#### Issue: Image preview not showing

**Solution**: Check browser compatibility and FileReader support:

```typescript
if (this.isBrowser) {
  const reader = new FileReader();
  reader.onload = (e) => {
    this.previewUrl = e.target?.result as string;
    this.cdr.markForCheck(); // Trigger change detection
  };
  reader.readAsDataURL(file);
}
```

#### Issue: SEO tags not appearing

**Solution**: Verify SeoService is called and browser guard is not blocking:

```typescript
// SeoService handles browser guards internally
private setupSEO(): void {
  this.seo.set({...}, 'Alpha Vault');
}
```

#### Issue: TrackBy not working

**Solution**: Ensure trackBy function returns a unique identifier:

```typescript
trackByLanguage = (_: number, lang: { value: string }) => lang.value;
```

### Performance Issues

- **Slow Form Rendering**: Check for expensive operations in template
- **Memory Leaks**: Verify all subscriptions use `takeUntilDestroyed`
- **Large Images**: Ensure file size validation (10MB limit)

### Accessibility Issues

- **Screen Reader Not Announcing Errors**: Verify `aria-live` and `role="alert"`
- **Keyboard Navigation Broken**: Check `tabindex` and focus management
- **Color Contrast**: Use browser dev tools to verify contrast ratios

---

## 📚 Related Documentation

- [Angular Reactive Forms](https://angular.io/guide/reactive-forms)
- [Angular Change Detection](https://angular.io/guide/change-detection)
- [WCAG 2.2 Guidelines](https://www.w3.org/WAI/WCAG22/quickref/)
- [Angular Image Optimization](https://angular.io/guide/image-optimization)

---

## 🔄 Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | Dec 2024 | Initial implementation with SEO, accessibility, and performance optimizations |

---

## 👥 Contributors

- **Mohamed Dhaoui** - Initial implementation and architecture

---

**Last Updated**: December 2024  
**Status**: ✅ Production Ready

