import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Chart, registerables } from 'chart.js';
import { map, tap } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { AuthService } from '../../../auth/services/auth.service';
import { User } from '../../../auth/models/auth.model';
import {
  DashboardService,
  DashboardStats,
} from '../../../shared/services/dashboard.service';
import { AdminAccountService } from '../../services/account.service';
import { AccountService } from '../../../shared/services/account.service';

Chart.register(...registerables);

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="admin-dashboard">
      <!-- Header -->
      <div class="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h1 class="h3 mb-0">Admin Dashboard</h1>
          <p class="text-muted mb-0">
            Welcome back, {{ currentUser?.firstName }}!
          </p>
        </div>
        <div class="d-flex gap-2">
          <button class="btn btn-outline-primary">
            <i class="bi bi-download me-2"></i>Export Report
          </button>
          <button class="btn btn-primary">
            <i class="bi bi-plus-circle me-2"></i>Add Customer
          </button>
        </div>
      </div>

      <!-- Stats Cards -->
      <div class="row mb-4">
        <div class="col-xl-3 col-md-6 mb-4">
          <div class="card border-0 shadow-sm h-100">
            <div class="card-body">
              <div class="d-flex align-items-center">
                <div class="flex-shrink-0">
                  <div class="stat-icon bg-primary">
                    <i class="bi bi-people text-white"></i>
                  </div>
                </div>
                <div class="flex-grow-1 ms-3">
                  <div class="small text-muted">Total Customers</div>
                  <div class="h4 mb-0">{{ stats.totalCustomers | number }}</div>
                  <div class="small text-success">
                    <i class="bi bi-arrow-up"></i> +{{ stats.monthlyGrowth }}%
                    this month
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="col-xl-3 col-md-6 mb-4">
          <div class="card border-0 shadow-sm h-100">
            <div class="card-body">
              <div class="d-flex align-items-center">
                <div class="flex-shrink-0">
                  <div class="stat-icon bg-success">
                    <i class="bi bi-credit-card text-white"></i>
                  </div>
                </div>
                <div class="flex-grow-1 ms-3">
                  <div class="small text-muted">Total Accounts</div>
                  <div class="h4 mb-0">{{ stats.totalAccounts | number }}</div>
                  <div class="small text-success">
                    <i class="bi bi-arrow-up"></i> Active accounts
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="col-xl-3 col-md-6 mb-4">
          <div class="card border-0 shadow-sm h-100">
            <div class="card-body">
              <div class="d-flex align-items-center">
                <div class="flex-shrink-0">
                  <div class="stat-icon bg-warning">
                    <i class="bi bi-currency-dollar text-white"></i>
                  </div>
                </div>
                <div class="flex-grow-1 ms-3">
                  <div class="small text-muted">Total Balance</div>
                  <div class="h4 mb-0">{{ stats.totalBalance | currency }}</div>
                  <div class="small text-success">
                    <i class="bi bi-arrow-up"></i> +{{ stats.revenueGrowth }}%
                    revenue
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="col-xl-3 col-md-6 mb-4">
          <div class="card border-0 shadow-sm h-100">
            <div class="card-body">
              <div class="d-flex align-items-center">
                <div class="flex-shrink-0">
                  <div class="stat-icon bg-info">
                    <i class="bi bi-arrow-left-right text-white"></i>
                  </div>
                </div>
                <div class="flex-grow-1 ms-3">
                  <div class="small text-muted">Transactions</div>
                  <div class="h4 mb-0">
                    {{ stats.totalTransactions | number }}
                  </div>
                  <div class="small text-warning">
                    <i class="bi bi-clock"></i>
                    {{ stats.pendingTransactions }} pending
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Recent Activity -->
      <div class="row">
        <div class="col-lg-8 mb-4">
          <div class="card border-0 shadow-sm">
            <div
              class="card-header bg-white d-flex justify-content-between align-items-center"
            >
              <h5 class="card-title mb-0">Recent Transactions</h5>
              <a
                routerLink="/admin/transactions"
                class="btn btn-sm btn-outline-primary"
                >View All</a
              >
            </div>
            <div class="card-body p-0">
              <div class="table-responsive">
                <table class="table table-hover mb-0">
                  <thead class="table-light">
                    <tr>
                      <th>Customer</th>
                      <th>Type</th>
                      <th>Amount</th>
                      <th>Status</th>
                      <th>Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr *ngFor="let transaction of recentTransactions">
                      <td>
                        <div class="d-flex align-items-center">
                          <div class="user-avatar me-2">
                            <i class="bi bi-person-circle text-muted"></i>
                          </div>
                          <div>
                            <div class="fw-semibold">
                              {{ getCustomerName(transaction) }}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span
                          class="badge"
                          [class]="getTransactionTypeBadge(transaction.type)"
                        >
                          {{ transaction.type }}
                        </span>
                      </td>
                      <td
                        class="fw-semibold"
                        [class]="getAmountClass(transaction.type)"
                      >
                        {{ transaction.amount | currency }}
                      </td>
                      <td>
                        <span class="badge bg-success"> COMPLETED </span>
                      </td>
                      <td class="text-muted">
                        {{ transaction.operationDate | date : 'short' }}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        <div class="col-lg-4 mb-4">
          <div class="card border-0 shadow-sm">
            <div class="card-header bg-white">
              <h5 class="card-title mb-0">Quick Actions</h5>
            </div>
            <div class="card-body">
              <div class="d-grid gap-2">
                <button
                  class="btn btn-primary"
                  routerLink="/admin/customers/new"
                >
                  <i class="bi bi-person-plus me-2"></i>Add New Customer
                </button>
                <button
                  class="btn btn-success"
                  routerLink="/admin/accounts/new"
                >
                  <i class="bi bi-credit-card me-2"></i>Create Account
                </button>
                <button
                  class="btn btn-warning"
                  routerLink="/admin/transactions"
                >
                  <i class="bi bi-eye me-2"></i>Review Transactions
                </button>
                <button class="btn btn-info" routerLink="/admin/reports">
                  <i class="bi bi-graph-up me-2"></i>Generate Report
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      .admin-dashboard {
        padding: 1.5rem;
      }

      .stat-icon {
        width: 48px;
        height: 48px;
        border-radius: 12px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 1.5rem;
      }

      .card {
        transition: transform 0.2s ease-in-out;
      }

      .card:hover {
        transform: translateY(-2px);
      }

      .user-avatar {
        font-size: 1.5rem;
      }

      .table th {
        border-top: none;
        font-weight: 600;
        color: var(--dark-gray);
      }

      .badge {
        font-size: 0.75rem;
        padding: 0.375rem 0.75rem;
      }

      @media (max-width: 768px) {
        .admin-dashboard {
          padding: 1rem;
        }

        .d-flex.justify-content-between {
          flex-direction: column;
          gap: 1rem;
        }
      }
    `,
  ],
})
export class AdminDashboardComponent implements OnInit {
  currentUser: User | null = null;
  loading = true;
  error: string | null = null;

  stats: DashboardStats = {
    totalCustomers: 0,
    totalAccounts: 0,
    totalBalance: 0,
    totalTransactions: 0,
    activeCustomers: 0,
    pendingTransactions: 0,
    monthlyGrowth: 0,
    revenueGrowth: 0,
  };

  recentTransactions: any[] = [];

  constructor(
    private authService: AuthService,
    private dashboardService: DashboardService,
    private adminAccountService: AdminAccountService,
    private accountService: AccountService
  ) {}

  ngOnInit(): void {
    this.currentUser = this.authService.getCurrentUser();
    this.loadDashboardData();
  }

  private loadDashboardData(): void {
    this.loading = true;
    this.error = null;

    // Load dashboard stats, account statistics, and recent transactions separately
    Promise.all([
      this.dashboardService
        .getAdminStats()
        .toPromise()
        .catch(() => null),
      this.adminAccountService
        .getAccountStats()
        .toPromise()
        .catch(() => null),
      this.loadRecentTransactions()
        .toPromise()
        .catch(() => []),
    ])
      .then(([dashboardStats, accountStats, recentTransactions]) => {
        // Set stats from dashboard or fallback to account stats
        if (dashboardStats) {
          this.stats = {
            ...dashboardStats,
            totalAccounts:
              accountStats?.totalAccounts || dashboardStats.totalAccounts,
            totalBalance:
              accountStats?.totalBalance || dashboardStats.totalBalance,
          };
        } else if (accountStats) {
          // Fallback to account stats if dashboard stats fail
          this.stats = {
            totalCustomers: 0,
            totalAccounts: accountStats.totalAccounts || 0,
            totalBalance: accountStats.totalBalance || 0,
            totalTransactions: 0,
            activeCustomers: 0,
            pendingTransactions: 0,
            monthlyGrowth: 0,
            revenueGrowth: 0,
          };
        }

        this.recentTransactions = recentTransactions || [];
        this.loading = false;
      })
      .catch((error) => {
        console.error('Error loading dashboard data:', error);
        this.error = 'Failed to load dashboard data. Please try again.';
        this.loading = false;
      });
  }

  private loadRecentTransactions(): Observable<any[]> {
    // Load recent transactions using the admin transaction endpoint
    return this.accountService
      .getTransactions({
        page: 0,
        size: 5,
        sortBy: 'operationDate',
        sortDirection: 'desc',
      })
      .pipe(
        map((response: any) => response.content || []),
        tap((transactions: any[]) => {
          console.log(
            'Admin Dashboard - Recent transactions loaded:',
            transactions
          );
        })
      );
  }

  // Helper methods for transaction display
  getTransactionTypeBadge(type: string): string {
    switch (type?.toUpperCase()) {
      case 'DEPOSIT':
        return 'bg-success';
      case 'WITHDRAWAL':
        return 'bg-danger';
      case 'TRANSFER':
        return 'bg-primary';
      default:
        return 'bg-secondary';
    }
  }

  getAmountClass(type: string): string {
    switch (type?.toUpperCase()) {
      case 'DEPOSIT':
        return 'text-success';
      case 'WITHDRAWAL':
        return 'text-danger';
      case 'TRANSFER':
        return 'text-primary';
      default:
        return '';
    }
  }

  getCustomerName(transaction: any): string {
    // Extract customer username from the transaction data
    if (transaction.customer && transaction.customer.username) {
      return transaction.customer.username;
    }
    // Fallback to customer name if username not available
    if (transaction.customer && transaction.customer.name) {
      return transaction.customer.name;
    }
    // Fallback to other possible fields
    if (transaction.customerName) {
      return transaction.customerName;
    }
    if (transaction.performedBy) {
      return transaction.performedBy;
    }
    return 'Unknown Customer';
  }
}
