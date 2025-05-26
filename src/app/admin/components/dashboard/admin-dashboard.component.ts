import { Component, OnInit, AfterViewInit, OnDestroy } from '@angular/core';
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
          <button
            class="btn btn-outline-primary"
            (click)="exportReport()"
            [disabled]="loading"
          >
            <span
              *ngIf="exportingReport"
              class="spinner-border spinner-border-sm me-2"
            ></span>
            <i class="bi bi-download me-2" *ngIf="!exportingReport"></i>
            {{ exportingReport ? 'Exporting...' : 'Export Report' }}
          </button>
          <button class="btn btn-primary" routerLink="/admin/customers/new">
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

      <!-- Charts Section -->
      <div class="row">
        <div class="col-lg-6 mb-4">
          <div class="card border-0 shadow-sm">
            <div class="card-header bg-white">
              <h5 class="card-title mb-0">Account Types Distribution</h5>
            </div>
            <div class="card-body">
              <canvas id="accountTypesChart" width="400" height="200"></canvas>
            </div>
          </div>
        </div>

        <div class="col-lg-6 mb-4">
          <div class="card border-0 shadow-sm">
            <div class="card-header bg-white">
              <h5 class="card-title mb-0">Transaction Types Distribution</h5>
            </div>
            <div class="card-body">
              <canvas
                id="transactionVolumeChart"
                width="400"
                height="200"
              ></canvas>
            </div>
          </div>
        </div>
      </div>

      <div class="row">
        <div class="col-lg-12 mb-4">
          <div class="card border-0 shadow-sm">
            <div class="card-header bg-white">
              <h5 class="card-title mb-0">Monthly Growth Trends</h5>
            </div>
            <div class="card-body">
              <canvas id="growthTrendsChart" width="400" height="150"></canvas>
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
export class AdminDashboardComponent
  implements OnInit, AfterViewInit, OnDestroy
{
  currentUser: User | null = null;
  loading = true;
  error: string | null = null;
  exportingReport = false;

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

  // Chart instances
  accountTypesChart: Chart | null = null;
  transactionVolumeChart: Chart | null = null;
  growthTrendsChart: Chart | null = null;

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

  ngAfterViewInit(): void {
    // Initialize charts after view is ready
    setTimeout(() => {
      this.initializeCharts();
      // Ensure charts have some data even if backend is not available
      setTimeout(() => {
        this.ensureChartsHaveData();
      }, 500);
    }, 100);
  }

  ngOnDestroy(): void {
    // Destroy chart instances to prevent memory leaks
    if (this.accountTypesChart) {
      this.accountTypesChart.destroy();
    }
    if (this.transactionVolumeChart) {
      this.transactionVolumeChart.destroy();
    }
    if (this.growthTrendsChart) {
      this.growthTrendsChart.destroy();
    }
  }

  private loadDashboardData(): void {
    this.loading = true;
    this.error = null;

    // Load dashboard stats, account statistics, transaction summary, and recent transactions separately
    Promise.all([
      this.dashboardService
        .getAdminStats()
        .toPromise()
        .catch(() => null),
      this.adminAccountService
        .getAccountStats()
        .toPromise()
        .catch(() => null),
      this.dashboardService
        .getTransactionsSummary()
        .toPromise()
        .catch(() => null),
      this.loadRecentTransactions()
        .toPromise()
        .catch(() => []),
    ])
      .then(
        ([
          dashboardStats,
          accountStats,
          transactionsSummary,
          recentTransactions,
        ]) => {
          // Set stats from dashboard or fallback to account stats
          if (dashboardStats) {
            this.stats = {
              ...dashboardStats,
              totalAccounts:
                accountStats?.totalAccounts || dashboardStats.totalAccounts,
              totalBalance:
                accountStats?.totalBalance || dashboardStats.totalBalance,
              totalTransactions:
                transactionsSummary?.totalTransactions ||
                dashboardStats.totalTransactions,
              pendingTransactions:
                transactionsSummary?.pendingTransactions ||
                dashboardStats.pendingTransactions,
            };
          } else {
            // Fallback to individual stats if dashboard stats fail
            this.stats = {
              totalCustomers: 0,
              totalAccounts: accountStats?.totalAccounts || 0,
              totalBalance: accountStats?.totalBalance || 0,
              totalTransactions: transactionsSummary?.totalTransactions || 0,
              activeCustomers: 0,
              pendingTransactions:
                transactionsSummary?.pendingTransactions || 0,
              monthlyGrowth: 0,
              revenueGrowth: 0,
            };
          }

          // If we still don't have transaction data, try to get it from transaction service
          if (!this.stats.totalTransactions) {
            this.loadTransactionCountFallback();
          }

          this.recentTransactions = recentTransactions || [];
          this.loading = false;

          console.log('Admin Dashboard Stats:', this.stats);
          console.log('Transactions Summary:', transactionsSummary);

          // Update charts with real data after loading
          setTimeout(() => {
            this.updateChartsWithRealData(transactionsSummary);
          }, 200);
        }
      )
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

  private loadTransactionCountFallback(): void {
    // Try to get total transaction count from the transaction service
    this.accountService
      .getTransactions({
        page: 0,
        size: 1,
        sortBy: 'operationDate',
        sortDirection: 'desc',
      })
      .subscribe({
        next: (response: any) => {
          if (response && response.totalElements !== undefined) {
            this.stats.totalTransactions = response.totalElements;
            console.log(
              'Fallback transaction count loaded:',
              response.totalElements
            );
          }
        },
        error: (error) => {
          console.error('Error loading transaction count fallback:', error);
        },
      });
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

  // Chart initialization methods
  private initializeCharts(): void {
    this.createAccountTypesChart();
    this.createTransactionVolumeChart();
    this.createGrowthTrendsChart();
  }

  private updateChartsWithRealData(transactionsSummary: any): void {
    console.log('Updating charts with real data:', transactionsSummary);

    if (this.transactionVolumeChart) {
      let realData = [0, 0, 0]; // Default fallback data

      if (transactionsSummary && transactionsSummary.transactionsByType) {
        realData = [
          transactionsSummary.transactionsByType.DEPOSIT || 0,
          transactionsSummary.transactionsByType.WITHDRAWAL || 0,
          transactionsSummary.transactionsByType.TRANSFER || 0,
        ];
      } else {
        // Use some sample data if no real data is available
        realData = [
          Math.floor(Math.random() * 100) + 50, // Add Money
          Math.floor(Math.random() * 80) + 30, // Debit
          Math.floor(Math.random() * 60) + 20, // Transfer
        ];
      }

      console.log('Chart data being set:', realData);
      this.transactionVolumeChart.data.datasets[0].data = realData;
      this.transactionVolumeChart.update('active');
    } else {
      console.warn('Transaction volume chart not initialized');
    }
  }

  private ensureChartsHaveData(): void {
    // Ensure transaction volume chart has some data to display
    if (this.transactionVolumeChart) {
      const currentData = this.transactionVolumeChart.data.datasets[0]
        .data as number[];
      const hasData = currentData.some((value) => value > 0);

      if (!hasData) {
        console.log('No data in transaction chart, adding sample data');
        // Add some sample data for demonstration
        const sampleData = [
          Math.floor(Math.random() * 100) + 50, // Add Money
          Math.floor(Math.random() * 80) + 30, // Debit
          Math.floor(Math.random() * 60) + 20, // Transfer
        ];
        this.transactionVolumeChart.data.datasets[0].data = sampleData;
        this.transactionVolumeChart.update('active');
        console.log('Sample data added to chart:', sampleData);
      }
    }
  }

  private createAccountTypesChart(): void {
    const ctx = document.getElementById(
      'accountTypesChart'
    ) as HTMLCanvasElement;
    if (ctx) {
      this.accountTypesChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
          labels: ['Current', 'Savings', 'Business', 'Investment'],
          datasets: [
            {
              data: [45, 30, 15, 10],
              backgroundColor: ['#e63946', '#2a9d8f', '#e9c46a', '#f4a261'],
              borderWidth: 2,
              borderColor: '#fff',
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
    }
  }

  private createTransactionVolumeChart(): void {
    const ctx = document.getElementById(
      'transactionVolumeChart'
    ) as HTMLCanvasElement;
    if (ctx) {
      this.transactionVolumeChart = new Chart(ctx, {
        type: 'bar',
        data: {
          labels: ['Add Money', 'Debit', 'Transfer'],
          datasets: [
            {
              label: 'Transaction Count',
              data: [0, 0, 0], // Start with zeros, will be updated with real data
              backgroundColor: ['#2a9d8f', '#e63946', '#f4a261'],
              borderColor: ['#2a9d8f', '#e63946', '#f4a261'],
              borderWidth: 1,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            y: {
              beginAtZero: true,
              ticks: {
                stepSize: 1,
              },
            },
          },
          plugins: {
            legend: {
              display: false,
            },
            tooltip: {
              callbacks: {
                label: function (context) {
                  return context.parsed.y + ' transactions';
                },
              },
            },
          },
        },
      });
    }
  }

  private createGrowthTrendsChart(): void {
    const ctx = document.getElementById(
      'growthTrendsChart'
    ) as HTMLCanvasElement;
    if (ctx) {
      this.growthTrendsChart = new Chart(ctx, {
        type: 'line',
        data: {
          labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
          datasets: [
            {
              label: 'Customers',
              data: [100, 120, 140, 160, 180, 200],
              borderColor: '#2a9d8f',
              backgroundColor: 'rgba(42, 157, 143, 0.1)',
              tension: 0.4,
            },
            {
              label: 'Accounts',
              data: [80, 95, 110, 125, 140, 155],
              borderColor: '#e63946',
              backgroundColor: 'rgba(230, 57, 70, 0.1)',
              tension: 0.4,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            y: {
              beginAtZero: true,
            },
          },
          plugins: {
            legend: {
              position: 'top',
            },
          },
        },
      });
    }
  }

  // Export functionality
  exportReport(): void {
    this.exportingReport = true;

    // Create CSV content
    const csvContent = this.generateCSVReport();

    // Create and download file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute(
      'download',
      `admin-report-${new Date().toISOString().split('T')[0]}.csv`
    );
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setTimeout(() => {
      this.exportingReport = false;
    }, 1000);
  }

  private generateCSVReport(): string {
    const headers = ['Metric', 'Value'];
    const rows = [
      ['Total Customers', (this.stats.totalCustomers || 0).toString()],
      ['Total Accounts', (this.stats.totalAccounts || 0).toString()],
      ['Total Balance', (this.stats.totalBalance || 0).toString()],
      ['Total Transactions', (this.stats.totalTransactions || 0).toString()],
      ['Active Customers', (this.stats.activeCustomers || 0).toString()],
      [
        'Pending Transactions',
        (this.stats.pendingTransactions || 0).toString(),
      ],
      ['Monthly Growth %', (this.stats.monthlyGrowth || 0).toString()],
      ['Revenue Growth %', (this.stats.revenueGrowth || 0).toString()],
      ['Report Generated', new Date().toISOString()],
    ];

    const csvContent = [headers, ...rows]
      .map((row) => row.map((field) => `"${field}"`).join(','))
      .join('\n');

    return csvContent;
  }
}
