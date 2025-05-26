import { Routes } from '@angular/router';
import {
  AuthGuard,
  AdminGuard,
  CustomerGuard,
  GuestGuard,
} from './auth/guards/auth.guard';
import { UserRole } from './auth/models/auth.model';

export const routes: Routes = [
  // Default redirect
  {
    path: '',
    redirectTo: '/auth/login',
    pathMatch: 'full',
  },

  // Authentication routes (for guests only)
  {
    path: 'auth',
    canActivate: [GuestGuard],
    children: [
      {
        path: 'login',
        loadComponent: () =>
          import('./auth/components/login/login.component').then(
            (m) => m.LoginComponent
          ),
      },
      {
        path: 'register',
        loadComponent: () =>
          import('./auth/components/register/register.component').then(
            (m) => m.RegisterComponent
          ),
      },
      {
        path: '',
        redirectTo: 'login',
        pathMatch: 'full',
      },
    ],
  },

  // Admin routes
  {
    path: 'admin',
    canActivate: [AdminGuard],
    children: [
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./admin/components/dashboard/admin-dashboard.component').then(
            (m) => m.AdminDashboardComponent
          ),
      },
      {
        path: 'customers',
        loadComponent: () =>
          import('./admin/components/customers/customer-list.component').then(
            (m) => m.CustomerListComponent
          ),
      },
      {
        path: 'customers/new',
        loadComponent: () =>
          import('./admin/components/customers/customer-form.component').then(
            (m) => m.AdminCustomerFormComponent
          ),
      },
      {
        path: 'customers/:id',
        loadComponent: () =>
          import(
            './admin/components/customers/customer-details.component'
          ).then((m) => m.AdminCustomerDetailsComponent),
      },
      {
        path: 'customers/:id/edit',
        loadComponent: () =>
          import('./admin/components/customers/customer-form.component').then(
            (m) => m.AdminCustomerFormComponent
          ),
      },
      {
        path: 'accounts',
        loadComponent: () =>
          import('./admin/components/accounts/account-list.component').then(
            (c) => c.AdminAccountListComponent
          ),
      },
      {
        path: 'accounts/new',
        loadComponent: () =>
          import('./admin/components/accounts/account-form.component').then(
            (m) => m.AdminAccountFormComponent
          ),
      },
      {
        path: 'accounts/:id',
        loadComponent: () =>
          import('./admin/components/accounts/account-list.component').then(
            (m) => m.AdminAccountListComponent
          ),
      },
      {
        path: 'transactions',
        loadComponent: () =>
          import('./transactions/transactions.component').then(
            (c) => c.TransactionsComponent
          ),
      },
      {
        path: 'reports',
        loadComponent: () =>
          import('./admin/components/reports/reports.component').then(
            (m) => m.AdminReportsComponent
          ),
      },
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full',
      },
    ],
  },

  // Customer routes
  {
    path: 'customer',
    canActivate: [CustomerGuard],
    children: [
      {
        path: 'dashboard',
        loadComponent: () =>
          import(
            './customer/components/dashboard/customer-dashboard.component'
          ).then((m) => m.CustomerDashboardComponent),
      },
      {
        path: 'deposit',
        loadComponent: () =>
          import('./deposit/deposit.component').then((c) => c.DepositComponent),
      },
      {
        path: 'deposit/:accountId',
        loadComponent: () =>
          import('./deposit/deposit.component').then((c) => c.DepositComponent),
      },
      {
        path: 'withdraw',
        loadComponent: () =>
          import('./withdraw/withdraw.component').then(
            (c) => c.WithdrawComponent
          ),
      },
      {
        path: 'withdraw/:accountId',
        loadComponent: () =>
          import('./withdraw/withdraw.component').then(
            (c) => c.WithdrawComponent
          ),
      },
      {
        path: 'transfer',
        loadComponent: () =>
          import('./transfer/transfer.component').then(
            (c) => c.TransferComponent
          ),
      },
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full',
      },
    ],
  },

  // Profile routes (accessible to all authenticated users)
  {
    path: 'profile',
    canActivate: [AuthGuard],
    loadComponent: () =>
      import('./shared/components/profile/profile.component').then(
        (m) => m.ProfileComponent
      ),
  },

  // Error pages
  {
    path: 'unauthorized',
    loadComponent: () =>
      import('./shared/components/error/unauthorized.component').then(
        (m) => m.UnauthorizedComponent
      ),
  },
  {
    path: 'not-found',
    loadComponent: () =>
      import('./core/not-found/not-found.component').then(
        (m) => m.NotFoundComponent
      ),
  },

  // Wildcard route - must be last
  {
    path: '**',
    redirectTo: '/not-found',
  },
];
