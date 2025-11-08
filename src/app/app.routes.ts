// src/app/app.routes.ts
import { Routes } from '@angular/router';

import { authGuard } from './core/guards/auth.guard';

export const appRoutes: Routes = [
  {
    path: 'home',
    loadComponent: () => import('./features/home/home.component').then(m => m.HomeComponent)
  },
  {
    path: 'auth',
    loadComponent: () => import('./features/auth/auth-layout.component').then(m => m.AuthLayoutComponent),
    children: [
      {
        path: '',
        redirectTo: 'login',
        pathMatch: 'full'
      },
      {
        path: 'login',
        loadComponent: () => import('./features/auth/login/login.component').then(m => m.LoginComponent)
      },
      {
        path: 'signup',
        loadComponent: () => import('./features/auth/signup/signup.component').then(m => m.SignupComponent)
      },
      {
        path: 'reset-password',
        loadComponent: () => import('./features/auth/password-reset/password-reset.component').then(m => m.PasswordResetComponent)
      }
    ]
  },
  {
    path: 'main',
    loadComponent: () => import('./features/main/main.component').then(m => m.MainComponent),
    canActivate: [authGuard],
    children: [
      {
        path: '',
        redirectTo: 'body',
        pathMatch: 'full'
      },
      {
        path: 'body',
        loadComponent: () => import('./features/body/body.component').then(m => m.BodyComponent),
        canActivate: [authGuard],
        children: [
          {
            path: '',
            redirectTo: 'dashboard',
            pathMatch: 'full'
          },
          {
            path: 'dashboard',
            loadComponent: () => import('./features/dashboard/dashboard.component').then(m => m.DashboardComponent),
            canActivate: [authGuard]
          },
          {
            path: 'income',
            loadComponent: () => import('./features/income/income.component').then(m => m.IncomeComponent),
            canActivate: [authGuard]
          },
          {
            path: 'expense',
            loadComponent: () => import('./features/expense/expense.component').then(m => m.ExpenseComponent),
            canActivate: [authGuard]
          },
          {
            path: 'saving',
            loadComponent: () => import('./features/saving/saving.component').then(m => m.SavingComponent),
            canActivate: [authGuard]
          },
          {
            path: 'budget',
            loadComponent: () => import('./features/budget/budget.component').then(m => m.BudgetComponent),
            canActivate: [authGuard]
          },
          {
            path: 'debt',
            loadComponent: () => import('./features/debt/debt.component').then(m => m.DebtComponent),
            canActivate: [authGuard]
          },
          {
            path: 'investment',
            loadComponent: () => import('./features/investment/investment.component').then(m => m.InvestmentComponent),
            canActivate: [authGuard]
          },
          {
            path: 'profile',
            loadComponent: () => import('./features/profile/profile.component').then(m => m.ProfileComponent),
            canActivate: [authGuard]
          }
        ]
      }
    ]
  },
  {
    path: '',
    redirectTo: '/home',
    pathMatch: 'full'
  }
];
