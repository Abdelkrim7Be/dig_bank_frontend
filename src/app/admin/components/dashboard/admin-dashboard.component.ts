import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Chart, registerables } from 'chart.js';
import { AuthService } from '../../../auth/services/auth.service';
import { User } from '../../../auth/models/auth.model';
import {
  DashboardService,
  DashboardStats,
  AdminDashboardData,
} from '../../../shared/services/dashboard.service';
import { AdminAccountService } from '../../services/account.service';

Chart.register(...registerables);

// Remove duplicate interface since it's imported from service

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

      <!-- Charts Row -->
      <div class="row mb-4">
        <div class="col-lg-8 mb-4">
          <div class="card border-0 shadow-sm h-100">
            <div class="card-header bg-white">
              <h5 class="card-title mb-0">Transaction Volume</h5>
            </div>
            <div class="card-body">
              <canvas id="transactionChart" width="400" height="200"></canvas>
            </div>
          </div>
        </div>

        <div class="col-lg-4 mb-4">
          <div class="card border-0 shadow-sm h-100">
            <div class="card-header bg-white">
              <h5 class="card-title mb-0">Account Types</h5>
            </div>
            <div class="card-body">
              <canvas id="accountChart" width="400" height="200"></canvas>
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
                              {{ transaction.customerName }}
                            </div>
                            <small class="text-muted">{{
                              transaction.accountNumber
                            }}</small>
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
                        <span
                          class="badge"
                          [class]="getStatusBadge(transaction.status)"
                        >
                          {{ transaction.status }}
                        </span>
                      </td>
                      <td class="text-muted">
                        {{ transaction.date | date : 'short' }}
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

          <!-- System Status -->
          <div class="card border-0 shadow-sm mt-4">
            <div class="card-header bg-white">
              <h5 class="card-title mb-0">System Status</h5>
            </div>
            <div class="card-body">
              <div
                class="d-flex justify-content-between align-items-center mb-2"
              >
                <span>API Status</span>
                <span class="badge bg-success">Online</span>
              </div>
              <div
                class="d-flex justify-content-between align-items-center mb-2"
              >
                <span>Database</span>
                <span class="badge bg-success">Connected</span>
              </div>
              <div
                class="d-flex justify-content-between align-items-center mb-2"
              >
                <span>Payment Gateway</span>
                <span class="badge bg-success">Active</span>
              </div>
              <div class="d-flex justify-content-between align-items-center">
                <span>Backup Status</span>
                <span class="badge bg-warning">Scheduled</span>
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
    private accountService: AdminAccountService
  ) {}

  ngOnInit(): void {
    this.currentUser = this.authService.getCurrentUser();
    this.loadDashboardData();
  }

  private loadDashboardData(): void {
    this.loading = true;
    this.error = null;

    // Load both dashboard data and account statistics
    Promise.all([
      this.dashboardService.getAdminDashboard().toPromise(),
      this.accountService.getAccountStats().toPromise(),
    ])
      .then(([dashboardData, accountStats]) => {
        if (dashboardData) {
          this.stats = {
            ...dashboardData.stats,
            totalAccounts:
              accountStats?.totalAccounts || dashboardData.stats.totalAccounts,
            totalBalance:
              accountStats?.totalBalance || dashboardData.stats.totalBalance,
          };
          this.recentTransactions = dashboardData.recentTransactions;
        }
        this.loading = false;
        this.initializeCharts();
      })
      .catch((error) => {
        console.error('Error loading dashboard data:', error);
        this.error = 'Failed to load dashboard data. Please try again.';
        this.loading = false;
        // Initialize charts with default data
        this.initializeCharts();
      });
  }

  private initializeCharts(): void {
    setTimeout(() => {
      this.createTransactionChart();
      this.createAccountChart();
    }, 100);
  }

  private createTransactionChart(): void {
    const ctx = document.getElementById(
      'transactionChart'
    ) as HTMLCanvasElement;
    if (ctx) {
      new Chart(ctx, {
        type: 'line',
        data: {
          labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
          datasets: [
            {
              label: 'Transactions',
              data: [1200, 1900, 3000, 5000, 2000, 3000],
              borderColor: '#e63946',
              backgroundColor: 'rgba(230, 57, 70, 0.1)',
              tension: 0.4,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              display: false,
            },
          },
        },
      });
    }
  }

  private createAccountChart(): void {
    const ctx = document.getElementById('accountChart') as HTMLCanvasElement;
    if (ctx) {
      // Get account statistics for the chart
      this.accountService.getAccountStats().subscribe({
        next: (accountStats) => {
          const currentAccounts = accountStats.currentAccounts || 0;
          const savingAccounts = accountStats.savingAccounts || 0;
          const total = currentAccounts + savingAccounts;

          new Chart(ctx, {
            type: 'doughnut',
            data: {
              labels: ['Current Accounts', 'Saving Accounts'],
              datasets: [
                {
                  data: total > 0 ? [currentAccounts, savingAccounts] : [1, 1],
                  backgroundColor: ['#e9c46a', '#2a9d8f'],
                },
              ],
            },
            options: {
              responsive: true,
              maintainAspectRatio: false,
              plugins: {
                legend: {
                  position: 'bottom',
                },
              },
            },
          });
        },
        error: () => {
          // Fallback to default data if API fails
          new Chart(ctx, {
            type: 'doughnut',
            data: {
              labels: ['Current Accounts', 'Saving Accounts'],
              datasets: [
                {
                  data: [45, 35],
                  backgroundColor: ['#e9c46a', '#2a9d8f'],
                },
              ],
            },
            options: {
              responsive: true,
              maintainAspectRatio: false,
              plugins: {
                legend: {
                  position: 'bottom',
                },
              },
            },
          });
        },
      });
    }
  }

  getTransactionTypeBadge(type: string): string {
    const badges = {
      DEPOSIT: 'bg-success',
      WITHDRAWAL: 'bg-warning',
      TRANSFER: 'bg-info',
    };
    return badges[type as keyof typeof badges] || 'bg-secondary';
  }

  getStatusBadge(status: string): string {
    const badges = {
      COMPLETED: 'bg-success',
      PENDING: 'bg-warning',
      FAILED: 'bg-danger',
    };
    return badges[status as keyof typeof badges] || 'bg-secondary';
  }

  getAmountClass(type: string): string {
    return type === 'WITHDRAWAL' ? 'text-danger' : 'text-success';
  }
}
