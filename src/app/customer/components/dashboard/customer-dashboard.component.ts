import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Chart, registerables } from 'chart.js';
import { AuthService } from '../../../auth/services/auth.service';
import { User } from '../../../auth/models/auth.model';
import { AccountService } from '../../../shared/services/account.service';
import { BankAccount, Transaction } from '../../../shared/models/account.model';
import {
  DashboardService,
  CustomerDashboardData,
} from '../../../shared/services/dashboard.service';

Chart.register(...registerables);

interface AccountSummary {
  accountNumber: string;
  accountType: string;
  balance: number;
  status: string;
}

interface RecentTransaction {
  id: string;
  type: string;
  amount: number;
  description: string;
  date: Date;
  status: string;
}

@Component({
  selector: 'app-customer-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="customer-dashboard">
      <!-- Welcome Header -->
      <div class="welcome-section mb-4">
        <div class="row align-items-center">
          <div class="col-md-8">
            <h1 class="h3 mb-1">Welcome back, {{ currentUser?.firstName }}!</h1>
            <p class="text-muted mb-0">
              Here's what's happening with your accounts today.
            </p>
          </div>
          <div class="col-md-4 text-md-end">
            <div class="quick-actions">
              <button
                class="btn btn-success me-2"
                routerLink="/customer/deposit"
              >
                <i class="bi bi-plus-circle me-1"></i>Add Money
              </button>
              <button class="btn btn-warning me-2" routerLink="/customer/debit">
                <i class="bi bi-dash-circle me-1"></i>Debit
              </button>
              <button class="btn btn-primary" routerLink="/customer/transfer">
                <i class="bi bi-arrow-left-right me-1"></i>Transfer
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Account Cards -->
      <div class="row mb-4">
        <div class="col-lg-8">
          <div class="row">
            <div class="col-md-6 mb-4" *ngFor="let account of accounts">
              <div class="card account-card border-0 shadow-sm h-100">
                <div class="card-body">
                  <div
                    class="d-flex justify-content-between align-items-start mb-3"
                  >
                    <div>
                      <h6 class="card-title text-muted mb-1">
                        {{ account.accountType }} Account
                      </h6>
                      <p class="card-text small text-muted mb-0">
                        {{ account.accountNumber }}
                      </p>
                    </div>
                    <span
                      class="badge"
                      [class]="getAccountStatusBadge(account.status)"
                    >
                      {{ account.status }}
                    </span>
                  </div>
                  <div class="balance-section">
                    <h3 class="balance-amount mb-0">
                      {{ account.balance | currency }}
                    </h3>
                    <small class="text-muted">Available Balance</small>
                  </div>
                  <div class="mt-3">
                    <button
                      class="btn btn-sm btn-outline-primary me-2"
                      [routerLink]="[
                        '/customer/accounts',
                        account.accountNumber
                      ]"
                    >
                      <i class="bi bi-eye me-1"></i>View Details
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Quick Stats -->
        <div class="col-lg-4">
          <div class="card border-0 shadow-sm h-100">
            <div class="card-header bg-white">
              <h5 class="card-title mb-0">Account Summary</h5>
            </div>
            <div class="card-body">
              <div class="stat-item mb-3">
                <div class="d-flex justify-content-between align-items-center">
                  <span class="text-muted">Total Balance</span>
                  <span class="fw-bold h5 mb-0">{{
                    getTotalBalance() | currency
                  }}</span>
                </div>
              </div>
              <div class="stat-item mb-3">
                <div class="d-flex justify-content-between align-items-center">
                  <span class="text-muted">Active Accounts</span>
                  <span class="fw-bold">{{ getActiveAccountsCount() }}</span>
                </div>
              </div>
              <div class="stat-item mb-3">
                <div class="d-flex justify-content-between align-items-center">
                  <span class="text-muted">This Month</span>
                  <span class="fw-bold text-success">+$2,450</span>
                </div>
              </div>
              <hr />
              <div class="d-grid">
                <button class="btn btn-primary" routerLink="/customer/accounts">
                  <i class="bi bi-credit-card me-2"></i>Manage Accounts
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Charts and Transactions -->
      <div class="row">
        <!-- Spending Chart -->
        <div class="col-lg-6 mb-4">
          <div class="card border-0 shadow-sm h-100">
            <div class="card-header bg-white">
              <h5 class="card-title mb-0">Spending Overview</h5>
            </div>
            <div class="card-body">
              <canvas id="spendingChart" width="400" height="300"></canvas>
            </div>
          </div>
        </div>

        <!-- Recent Transactions -->
        <div class="col-lg-6 mb-4">
          <div class="card border-0 shadow-sm h-100">
            <div
              class="card-header bg-white d-flex justify-content-between align-items-center"
            >
              <h5 class="card-title mb-0">Recent Transactions</h5>
              <a
                routerLink="/customer/transaction-history"
                class="btn btn-sm btn-outline-primary"
              >
                View All
              </a>
            </div>
            <div class="card-body p-0">
              <div class="transaction-list">
                <div
                  class="transaction-item"
                  *ngFor="let transaction of recentTransactions"
                >
                  <div class="d-flex align-items-center p-3 border-bottom">
                    <div class="transaction-icon me-3">
                      <i
                        class="bi"
                        [class]="getTransactionIcon(transaction.type)"
                      ></i>
                    </div>
                    <div class="flex-grow-1">
                      <div class="fw-semibold">
                        {{ transaction.description }}
                      </div>
                      <small class="text-muted">{{
                        transaction.date | date : 'short'
                      }}</small>
                    </div>
                    <div class="text-end">
                      <div
                        class="fw-bold"
                        [class]="getAmountClass(transaction.type)"
                      >
                        {{ getAmountPrefix(transaction.type)
                        }}{{ transaction.amount | currency }}
                      </div>
                      <small
                        class="badge"
                        [class]="getTransactionStatusBadge(transaction.status)"
                      >
                        {{ transaction.status }}
                      </small>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Quick Actions -->
      <div class="row">
        <div class="col-12">
          <div class="card border-0 shadow-sm">
            <div class="card-header bg-white">
              <h5 class="card-title mb-0">Quick Actions</h5>
            </div>
            <div class="card-body">
              <div class="row">
                <div class="col-md-3 col-6 mb-3">
                  <button
                    class="btn btn-outline-primary w-100 h-100 py-3"
                    routerLink="/customer/deposit"
                  >
                    <i class="bi bi-plus-circle display-6 d-block mb-2"></i>
                    <span>Add Money</span>
                  </button>
                </div>
                <div class="col-md-3 col-6 mb-3">
                  <button
                    class="btn btn-outline-warning w-100 h-100 py-3"
                    routerLink="/customer/debit"
                  >
                    <i class="bi bi-dash-circle display-6 d-block mb-2"></i>
                    <span>Debit</span>
                  </button>
                </div>
                <div class="col-md-3 col-6 mb-3">
                  <button
                    class="btn btn-outline-success w-100 h-100 py-3"
                    routerLink="/customer/transfer"
                  >
                    <i
                      class="bi bi-arrow-left-right display-6 d-block mb-2"
                    ></i>
                    <span>Transfer Funds</span>
                  </button>
                </div>
                <div class="col-md-3 col-6 mb-3">
                  <button
                    class="btn btn-outline-info w-100 h-100 py-3"
                    routerLink="/customer/transaction-history"
                  >
                    <i class="bi bi-clock-history display-6 d-block mb-2"></i>
                    <span>View History</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      .customer-dashboard {
        padding: 1.5rem;
      }

      .welcome-section {
        background: linear-gradient(
          135deg,
          var(--primary-red) 0%,
          #d62d3a 100%
        );
        color: white;
        padding: 2rem;
        border-radius: 12px;
        margin-bottom: 2rem;
      }

      .account-card {
        transition: transform 0.2s ease-in-out;
        border-left: 4px solid var(--primary-red);
      }

      .account-card:hover {
        transform: translateY(-4px);
      }

      .balance-amount {
        color: var(--primary-red);
        font-weight: 700;
      }

      .transaction-icon {
        width: 40px;
        height: 40px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 1.2rem;
      }

      .transaction-icon.deposit {
        background-color: rgba(42, 157, 143, 0.1);
        color: var(--success-green);
      }

      .transaction-icon.withdrawal {
        background-color: rgba(233, 196, 106, 0.1);
        color: var(--warning-yellow);
      }

      .transaction-icon.transfer {
        background-color: rgba(13, 110, 253, 0.1);
        color: #0d6efd;
      }

      .transaction-item:last-child .border-bottom {
        border-bottom: none !important;
      }

      .stat-item {
        padding: 0.5rem 0;
      }

      .quick-actions .btn {
        min-height: 120px;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        text-align: center;
      }

      @media (max-width: 768px) {
        .customer-dashboard {
          padding: 1rem;
        }

        .welcome-section {
          padding: 1.5rem;
          text-align: center;
        }

        .quick-actions {
          margin-top: 1rem;
        }
      }
    `,
  ],
})
export class CustomerDashboardComponent implements OnInit {
  currentUser: User | null = null;
  loading = true;
  error: string | null = null;

  accounts: AccountSummary[] = [];
  recentTransactions: RecentTransaction[] = [];

  constructor(
    private authService: AuthService,
    private dashboardService: DashboardService,
    private accountService: AccountService
  ) {}

  ngOnInit(): void {
    this.currentUser = this.authService.getCurrentUser();
    this.loadDashboardData();
  }

  private loadDashboardData(): void {
    this.loading = true;
    this.error = null;

    // Debug: Check authentication status
    console.log('Current user:', this.currentUser);
    console.log('Auth token:', localStorage.getItem('digital-banking-token'));

    // Load customer accounts using the enhanced account service
    this.accountService.getCustomerAccounts().subscribe({
      next: (accounts: BankAccount[]) => {
        console.log('Customer accounts received:', accounts);
        this.accounts = this.mapBankAccountsToSummary(accounts);
        this.loadRecentTransactions();
      },
      error: (error) => {
        console.error('Error loading customer accounts:', error);
        console.error('Error details:', {
          status: error.status,
          statusText: error.statusText,
          url: error.url,
          message: error.message,
        });

        // Try fallback with dashboard service
        this.loadDashboardDataFallback();
      },
    });
  }

  private loadRecentTransactions(): void {
    // Load recent transactions for the customer
    const transactionFilter = {
      page: 0,
      size: 5,
      sortBy: 'operationDate',
      sortDirection: 'desc' as 'desc',
    };

    // Try customer-specific method first, then fallback
    this.accountService.getCustomerTransactions(transactionFilter).subscribe({
      next: (response) => {
        console.log('Recent transactions received:', response);
        this.recentTransactions = this.mapTransactionsToRecentTransactions(
          response.content || []
        );
        this.loading = false;
        this.initializeChart();
      },
      error: (error) => {
        console.error(
          'Error loading recent transactions with customer method, trying general method:',
          error
        );

        // Fallback to general method
        this.accountService.getTransactions(transactionFilter).subscribe({
          next: (response) => {
            console.log('Recent transactions received (fallback):', response);
            this.recentTransactions = this.mapTransactionsToRecentTransactions(
              response.content || []
            );
            this.loading = false;
            this.initializeChart();
          },
          error: (generalError) => {
            console.error(
              'Error loading recent transactions (all methods failed):',
              generalError
            );
            // Continue without recent transactions
            this.recentTransactions = [];
            this.loading = false;
            this.initializeChart();
          },
        });
      },
    });
  }

  private loadDashboardDataFallback(): void {
    // Fallback to original dashboard service
    this.dashboardService.getCustomerDashboard().subscribe({
      next: (data: any) => {
        console.log('Customer dashboard data received (fallback):', data);
        this.accounts = this.mapBackendAccountsData(data.accounts || []);
        this.recentTransactions = data.recentTransactions || [];
        this.loading = false;
        this.initializeChart();
      },
      error: (error) => {
        console.error(
          'Error loading customer dashboard data (fallback):',
          error
        );
        this.error = 'Failed to load dashboard data. Please try again.';
        this.loading = false;
        // Load default data for demo
        this.loadDefaultData();
        this.initializeChart();
      },
    });
  }

  private mapBankAccountsToSummary(accounts: BankAccount[]): AccountSummary[] {
    return accounts.map((account) => ({
      accountNumber: this.maskAccountNumber(account.id),
      accountType: this.formatAccountType(account.type),
      balance: account.balance || 0,
      status: account.status || 'ACTIVATED',
    }));
  }

  private mapTransactionsToRecentTransactions(
    transactions: Transaction[]
  ): RecentTransaction[] {
    return transactions.map((transaction) => ({
      id: transaction.id?.toString() || '',
      type: transaction.type,
      amount: transaction.amount,
      description:
        transaction.description ||
        this.getTransactionDescription(transaction.type),
      date: new Date(transaction.operationDate),
      status: transaction.status || 'COMPLETED',
    }));
  }

  private getTransactionDescription(type: string): string {
    const descriptions = {
      DEPOSIT: 'Money Added',
      WITHDRAWAL: 'Money Withdrawn',
      TRANSFER: 'Money Transferred',
    };
    return descriptions[type as keyof typeof descriptions] || 'Transaction';
  }

  private mapBackendAccountsData(accounts: any[]): AccountSummary[] {
    return accounts.map((account) => ({
      accountNumber: this.maskAccountNumber(account.id),
      accountType: this.formatAccountType(account.type),
      balance: account.balance || 0,
      status: account.status || 'ACTIVE',
    }));
  }

  private mapAccountsData(accountsSummary: any): AccountSummary[] {
    // Convert backend data to component format - fallback method
    return [
      {
        accountNumber: '****1234',
        accountType: 'Checking',
        balance: 5420.5,
        status: 'ACTIVE',
      },
      {
        accountNumber: '****5678',
        accountType: 'Savings',
        balance: 12750.25,
        status: 'ACTIVE',
      },
    ];
  }

  private maskAccountNumber(accountId: string | number): string {
    const accountIdStr = accountId?.toString() || '';
    if (!accountIdStr || accountIdStr.length < 4) return '****';
    return '****' + accountIdStr.slice(-4);
  }

  private formatAccountType(type?: string): string {
    switch (type?.toUpperCase()) {
      case 'CURRENT':
      case 'CURRENTACCOUNT':
        return 'Checking';
      case 'SAVING':
      case 'SAVINGACCOUNT':
        return 'Savings';
      default:
        return type || 'Unknown';
    }
  }

  private loadDefaultData(): void {
    this.accounts = [
      {
        accountNumber: '****1234',
        accountType: 'Checking',
        balance: 5420.5,
        status: 'ACTIVE',
      },
      {
        accountNumber: '****5678',
        accountType: 'Savings',
        balance: 12750.25,
        status: 'ACTIVE',
      },
    ];

    this.recentTransactions = [
      {
        id: '1',
        type: 'DEPOSIT',
        amount: 1500.0,
        description: 'Salary Deposit',
        date: new Date(),
        status: 'COMPLETED',
      },
      {
        id: '2',
        type: 'WITHDRAWAL',
        amount: 250.0,
        description: 'ATM Withdrawal',
        date: new Date(Date.now() - 86400000),
        status: 'COMPLETED',
      },
    ];
  }

  private initializeChart(): void {
    setTimeout(() => {
      this.createSpendingChart();
    }, 100);
  }

  private createSpendingChart(): void {
    const ctx = document.getElementById('spendingChart') as HTMLCanvasElement;
    if (ctx) {
      new Chart(ctx, {
        type: 'doughnut',
        data: {
          labels: [
            'Food & Dining',
            'Shopping',
            'Transportation',
            'Bills',
            'Entertainment',
          ],
          datasets: [
            {
              data: [30, 25, 15, 20, 10],
              backgroundColor: [
                '#e63946',
                '#2a9d8f',
                '#e9c46a',
                '#e76f51',
                '#264653',
              ],
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

  getTotalBalance(): number {
    return this.accounts.reduce((total, account) => total + account.balance, 0);
  }

  getActiveAccountsCount(): number {
    return this.accounts.filter((account) => account.status === 'ACTIVE')
      .length;
  }

  getAccountStatusBadge(status: string): string {
    const badges = {
      ACTIVE: 'bg-success',
      INACTIVE: 'bg-warning',
      SUSPENDED: 'bg-danger',
    };
    return badges[status as keyof typeof badges] || 'bg-secondary';
  }

  getTransactionIcon(type: string): string {
    const icons = {
      DEPOSIT: 'bi-arrow-down-circle deposit',
      WITHDRAWAL: 'bi-arrow-up-circle withdrawal',
      TRANSFER: 'bi-arrow-left-right transfer',
    };
    return icons[type as keyof typeof icons] || 'bi-circle';
  }

  getAmountClass(type: string): string {
    return type === 'WITHDRAWAL' ? 'text-danger' : 'text-success';
  }

  getAmountPrefix(type: string): string {
    return type === 'WITHDRAWAL' ? '-' : '+';
  }

  getTransactionStatusBadge(status: string): string {
    const badges = {
      COMPLETED: 'bg-success',
      PENDING: 'bg-warning',
      FAILED: 'bg-danger',
    };
    return badges[status as keyof typeof badges] || 'bg-secondary';
  }
}
