import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AccountService } from '../shared/services/account.service';
import {
  Account,
  Transaction,
  AccountSummary,
} from '../shared/models/account.model';
import { LoaderComponent } from '../shared/components/loader/loader.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, LoaderComponent],
  template: `
    <div class="container-fluid mt-4">
      <!-- Welcome Section -->
      <div class="row mb-4">
        <div class="col-12">
          <div class="card shadow-sm">
            <div class="card-body">
              <div class="d-flex justify-content-between align-items-center">
                <div>
                  <h4 class="card-title mb-1">Welcome to Digital Banking!</h4>
                  <p class="text-muted">
                    Here's what's happening with your accounts today.
                  </p>
                </div>
                <div class="text-end">
                  <p class="mb-0">{{ today | date : 'EEEE, MMMM d, y' }}</p>
                  <p class="mb-0 text-muted">
                    Last login: {{ lastLogin | date : 'medium' }}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Loading State -->
      <app-loader *ngIf="loading"></app-loader>

      <!-- Stats Row -->
      <div class="row mb-4" *ngIf="!loading">
        <div class="col-md-3 col-sm-6 mb-3">
          <div class="card shadow-sm bg-primary text-white h-100">
            <div class="card-body">
              <h5 class="card-title">Total Balance</h5>
              <h3 class="mb-0">
                {{ getTotalBalance() | currency : 'USD' : 'symbol' : '1.2-2' }}
              </h3>
              <p class="small mb-0">
                <i class="bi bi-arrow-up"></i> {{ accounts.length }} accounts
              </p>
            </div>
          </div>
        </div>
        <div class="col-md-3 col-sm-6 mb-3">
          <div class="card shadow-sm h-100">
            <div class="card-body">
              <h5 class="card-title">Active Accounts</h5>
              <h3 class="mb-0">{{ getActiveAccountsCount() }}</h3>
              <p class="small text-muted mb-0">{{ getAccountTypesText() }}</p>
            </div>
          </div>
        </div>
        <div class="col-md-3 col-sm-6 mb-3">
          <div class="card shadow-sm h-100">
            <div class="card-body">
              <h5 class="card-title">Recent Transactions</h5>
              <h3 class="mb-0">{{ recentTransactions.length }}</h3>
              <p class="small text-muted mb-0">Last 30 days</p>
            </div>
          </div>
        </div>
        <div class="col-md-3 col-sm-6 mb-3">
          <div class="card shadow-sm h-100">
            <div class="card-body">
              <h5 class="card-title">Account Status</h5>
              <h3 class="mb-0">
                <span class="badge bg-success">Active</span>
              </h3>
              <p class="small text-muted mb-0">All systems operational</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Quick Actions Row -->
      <div class="row mb-4">
        <div class="col-lg-8">
          <div class="row">
            <div class="col-md-4 mb-3">
              <div class="card shadow-sm h-100">
                <div class="card-body d-flex flex-column">
                  <div class="mb-3 text-primary">
                    <i class="bi bi-wallet2 fs-1"></i>
                  </div>
                  <h5 class="card-title">Accounts</h5>
                  <p class="card-text flex-grow-1">
                    View and manage your bank accounts, check balances and
                    statements.
                  </p>
                  <a
                    routerLink="/accounts"
                    class="btn btn-sm btn-outline-primary mt-2"
                    >View Accounts</a
                  >
                </div>
              </div>
            </div>

            <div class="col-md-4 mb-3">
              <div class="card shadow-sm h-100">
                <div class="card-body d-flex flex-column">
                  <div class="mb-3 text-primary">
                    <i class="bi bi-arrow-left-right fs-1"></i>
                  </div>
                  <h5 class="card-title">Transactions</h5>
                  <p class="card-text flex-grow-1">
                    Review your recent transactions, filter by date and
                    categories.
                  </p>
                  <a
                    routerLink="/transactions"
                    class="btn btn-sm btn-outline-primary mt-2"
                    >View Transactions</a
                  >
                </div>
              </div>
            </div>

            <div class="col-md-4 mb-3">
              <div class="card shadow-sm h-100">
                <div class="card-body d-flex flex-column">
                  <div class="mb-3 text-primary">
                    <i class="bi bi-send fs-1"></i>
                  </div>
                  <h5 class="card-title">Transfers</h5>
                  <p class="card-text flex-grow-1">
                    Transfer money between your accounts or to other people.
                  </p>
                  <a
                    routerLink="/transfers"
                    class="btn btn-sm btn-outline-primary mt-2"
                    >New Transfer</a
                  >
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="col-lg-4 mb-3">
          <div class="card shadow-sm h-100">
            <div class="card-header bg-light">
              <h5 class="mb-0">Quick Links</h5>
            </div>
            <div class="card-body">
              <div class="list-group list-group-flush">
                <a
                  href="#"
                  class="list-group-item list-group-item-action d-flex align-items-center"
                >
                  <i class="bi bi-plus-circle me-3 text-success"></i>
                  <span>Open New Account</span>
                </a>
                <a
                  href="#"
                  class="list-group-item list-group-item-action d-flex align-items-center"
                >
                  <i class="bi bi-credit-card me-3 text-primary"></i>
                  <span>Apply for Credit Card</span>
                </a>
                <a
                  href="#"
                  class="list-group-item list-group-item-action d-flex align-items-center"
                >
                  <i class="bi bi-graph-up-arrow me-3 text-info"></i>
                  <span>Investment Options</span>
                </a>
                <a
                  href="#"
                  class="list-group-item list-group-item-action d-flex align-items-center"
                >
                  <i class="bi bi-house me-3 text-warning"></i>
                  <span>Mortgage Calculator</span>
                </a>
                <a
                  href="#"
                  class="list-group-item list-group-item-action d-flex align-items-center"
                >
                  <i class="bi bi-headset me-3 text-danger"></i>
                  <span>Contact Support</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Recent Transactions & Financial Summary Row -->
      <div class="row mb-4">
        <div class="col-lg-8 mb-3">
          <div class="card shadow-sm h-100">
            <div
              class="card-header bg-light d-flex justify-content-between align-items-center"
            >
              <h5 class="mb-0">Recent Transactions</h5>
              <a
                routerLink="/transactions"
                class="btn btn-sm btn-outline-primary"
                >View All</a
              >
            </div>
            <div class="card-body p-0">
              <div class="table-responsive">
                <table class="table table-hover mb-0">
                  <thead class="table-light">
                    <tr>
                      <th>Date</th>
                      <th>Description</th>
                      <th>Account</th>
                      <th class="text-end">Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr *ngFor="let transaction of recentTransactions">
                      <td>
                        {{ transaction.operationDate | date : 'MMM d, y' }}
                      </td>
                      <td>{{ transaction.description }}</td>
                      <td>
                        {{ getAccountDisplay(transaction.accountNumber) }}
                      </td>
                      <td
                        class="text-end"
                        [ngClass]="getAmountClass(transaction.type)"
                      >
                        {{
                          getAmountDisplay(transaction)
                            | currency : 'USD' : 'symbol' : '1.2-2'
                        }}
                      </td>
                    </tr>
                    <tr *ngIf="recentTransactions.length === 0">
                      <td colspan="4" class="text-center text-muted">
                        No recent transactions found
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        <div class="col-lg-4 mb-3">
          <div class="card shadow-sm h-100">
            <div class="card-header bg-light">
              <h5 class="mb-0">Financial Summary</h5>
            </div>
            <div class="card-body">
              <div class="mb-4">
                <h6>Monthly Spending</h6>
                <div class="progress mb-2" style="height: 10px;">
                  <div
                    class="progress-bar bg-primary"
                    role="progressbar"
                    style="width: 65%;"
                    aria-valuenow="65"
                    aria-valuemin="0"
                    aria-valuemax="100"
                  ></div>
                </div>
                <div class="d-flex justify-content-between">
                  <small class="text-muted">$1,950 of $3,000 budget</small>
                  <small class="text-muted">65%</small>
                </div>
              </div>

              <div class="mb-4">
                <h6>Savings Goal</h6>
                <div class="progress mb-2" style="height: 10px;">
                  <div
                    class="progress-bar bg-success"
                    role="progressbar"
                    style="width: 40%;"
                    aria-valuenow="40"
                    aria-valuemin="0"
                    aria-valuemax="100"
                  ></div>
                </div>
                <div class="d-flex justify-content-between">
                  <small class="text-muted">$4,000 of $10,000 goal</small>
                  <small class="text-muted">40%</small>
                </div>
              </div>

              <div>
                <h6>Upcoming Bills</h6>
                <ul class="list-group list-group-flush">
                  <li
                    class="list-group-item px-0 d-flex justify-content-between align-items-center"
                  >
                    <span>Rent Payment</span>
                    <span class="badge bg-warning rounded-pill"
                      >Due in 5 days</span
                    >
                  </li>
                  <li
                    class="list-group-item px-0 d-flex justify-content-between align-items-center"
                  >
                    <span>Internet Bill</span>
                    <span class="badge bg-danger rounded-pill"
                      >Due in 2 days</span
                    >
                  </li>
                  <li
                    class="list-group-item px-0 d-flex justify-content-between align-items-center"
                  >
                    <span>Phone Bill</span>
                    <span class="badge bg-success rounded-pill">Paid</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      .card {
        transition: transform 0.3s ease, box-shadow 0.3s ease;
        border: none;
        border-radius: 0.5rem;
      }

      .card:hover {
        transform: translateY(-5px);
        box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.15) !important;
      }

      .card-header {
        border-top-left-radius: 0.5rem !important;
        border-top-right-radius: 0.5rem !important;
      }

      .table th,
      .table td {
        padding: 0.75rem 1rem;
      }

      .progress {
        border-radius: 0.5rem;
      }

      .bi {
        line-height: 1;
      }
    `,
  ],
})
export class DashboardComponent implements OnInit {
  today = new Date();
  lastLogin = new Date(Date.now() - 24 * 60 * 60 * 1000); // Yesterday

  // Data properties
  accounts: Account[] = [];
  recentTransactions: Transaction[] = [];
  accountSummary: AccountSummary | null = null;
  loading = false;

  constructor(private accountService: AccountService) {}

  ngOnInit(): void {
    this.loadDashboardData();
  }

  loadDashboardData(): void {
    this.loading = true;

    // Load accounts
    this.accountService.getAccounts().subscribe({
      next: (accounts) => {
        this.accounts = accounts;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading accounts:', error);
        this.loading = false;
      },
    });

    // Load recent transactions
    this.accountService
      .getTransactions({
        page: 0,
        size: 5,
        sortBy: 'operationDate',
        sortDirection: 'desc',
      })
      .subscribe({
        next: (response) => {
          this.recentTransactions = response.content;
        },
        error: (error) => {
          console.error('Error loading transactions:', error);
        },
      });

    // Load account summary
    this.accountService.getAccountSummary().subscribe({
      next: (summary) => {
        this.accountSummary = summary;
      },
      error: (error) => {
        console.error('Error loading account summary:', error);
      },
    });
  }

  getTotalBalance(): number {
    return this.accounts.reduce((total, account) => total + account.balance, 0);
  }

  getActiveAccountsCount(): number {
    return this.accounts.filter((account) => account.status === 'ACTIVE')
      .length;
  }

  getAccountTypesText(): string {
    const types = [
      ...new Set(this.accounts.map((account) => account.accountType)),
    ];
    return types
      .map((type) => type.charAt(0) + type.slice(1).toLowerCase())
      .join(', ');
  }

  getAccountDisplay(accountNumber?: string): string {
    if (!accountNumber) return 'N/A';
    const account = this.accounts.find(
      (acc) => acc.accountNumber === accountNumber
    );
    if (account) {
      const type =
        account.accountType.charAt(0) +
        account.accountType.slice(1).toLowerCase();
      return `${type} ****${accountNumber.slice(-4)}`;
    }
    return `****${accountNumber.slice(-4)}`;
  }

  getAmountClass(type: string): string {
    switch (type) {
      case 'DEPOSIT':
      case 'INTEREST':
        return 'text-success';
      case 'WITHDRAWAL':
      case 'FEE':
      case 'PAYMENT':
        return 'text-danger';
      default:
        return '';
    }
  }

  getAmountDisplay(transaction: Transaction): number {
    const isDebit = ['WITHDRAWAL', 'FEE', 'PAYMENT'].includes(transaction.type);
    return isDebit ? -transaction.amount : transaction.amount;
  }
}
