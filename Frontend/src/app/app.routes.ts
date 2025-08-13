// src/app/app.routes.ts
import { Routes } from '@angular/router';

export const appRoutes: Routes = [
  { path: '', redirectTo: 'home', pathMatch: 'full' },

  {
    path: 'home',
    loadComponent: () =>
      import('./features/home/home.component').then((m) => m.HomeComponent),
  },

  {
    path: 'about',
    loadComponent: () =>
      import('./shared/components/about/about.component').then((m) => m.AboutComponent),
  },

  {
    path: 'contact',
    loadComponent: () =>
      import('./shared/components/contact/contact.component').then((m) => m.ContactComponent),
  },

  {
    path: 'auth',
    loadComponent: () =>
      import('./features/auth/auth.component').then((m) => m.AuthComponent),
  },

  {
    path: 'main',
    loadComponent: () =>
      import('./features/main/main.component').then((m) => m.MainComponent),
    children: [
      {
        path: 'body',
        loadComponent: () =>
          import('./features/body/body.component').then((m) => m.BodyComponent),
        children: [
          {
            path: 'income',
            loadComponent: () =>
              import('./features/income/income.component').then(
                (m) => m.IncomeComponent
              ),
          },
          {
            path: 'expense',
            loadComponent: () =>
              import('./features/expense/expense.component').then(
                (m) => m.ExpenseComponent
              ),
          },
          {
            path: 'budget',
            loadComponent: () =>
              import('./features/budget/budget.component').then(
                (m) => m.BudgetComponent
              ),
          },
          {
            path: 'saving',
            loadComponent: () =>
              import('./features/saving/saving.component').then(
                (m) => m.SavingComponent
              ),
          },
          {
            path: 'investment',
            loadComponent: () =>
              import('./features/investment/investment.component').then(
                (m) => m.InvestmentComponent
              ),
            children: [
              {
                path: 'crypto',
                loadComponent: () =>
                  import('./features/investment/crypto/crypto.component').then(
                    (m) => m.CryptoComponent
                  ),
              },

              // Optionally, redirect empty "investment" to "crypto" or whichever you prefer:
              { path: '', redirectTo: 'crypto', pathMatch: 'full' },
            ],
          },
          {
            path: 'debt',
            loadComponent: () =>
              import('./features/debt/debt.component').then(
                (m) => m.DebtComponent
              ),
          },
          // ← add more routes here under body if needed
        ],
      },
    ],
  },

  // wildcard fallback
  { path: '**', redirectTo: 'home' },
];
