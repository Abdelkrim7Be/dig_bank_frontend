import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AccountService } from '../../../shared/services/account.service';
import { BankAccount } from '../../../shared/models/account.model';
import { AuthService } from '../../../auth/services/auth.service';

@Component({
  selector: 'app-customer-accounts',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  template: `
    <div class="customer-accounts">
      <!-- Header -->
      <div class="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 class="h4 mb-1">My Accounts</h2>
          <p class="text-muted mb-0">Manage your bank accounts</p>
        </div>
        <button class="btn btn-primary" routerLink="/customer/accounts/new">
          <i class="bi bi-plus-circle me-2"></i>
          Open New Account
        </button>
      </div>

      <!-- Loading State -->
      <div *ngIf="loading" class="text-center py-5">
        <div class="spinner-border text-primary" role="status">
          <span class="visually-hidden">Loading...</span>
        </div>
        <p class="mt-3 text-muted">Loading your accounts...</p>
      </div>

      <!-- Error State -->
      <div *ngIf="error && !loading" class="alert alert-danger">
        <i class="bi bi-exclamation-triangle me-2"></i>
        {{ error }}
        <button
          class="btn btn-outline-danger btn-sm ms-2"
          (click)="loadAccounts()"
        >
          <i class="bi bi-arrow-clockwise me-1"></i>Retry
        </button>
      </div>

      <!-- Accounts Grid -->
      <div *ngIf="!loading && !error" class="row">
        <div class="col-lg-4 col-md-6 mb-4" *ngFor="let account of accounts">
          <div class="card account-card border-0 shadow-sm h-100">
            <div class="card-body">
              <!-- Account Header -->
              <div
                class="d-flex justify-content-between align-items-start mb-3"
              >
                <div>
                  <h6 class="card-title text-muted mb-1">
                    {{ formatAccountType(account.type) }} Account
                  </h6>
                  <p class="card-text small text-muted mb-0">
                    {{ maskAccountNumber(account.id) }}
                  </p>
                </div>
                <span
                  class="badge"
                  [class]="getAccountStatusBadge(account.status)"
                >
                  {{ account.status }}
                </span>
              </div>

              <!-- Balance -->
              <div class="balance-section mb-3">
                <h3 class="balance-amount mb-0">
                  {{ account.balance | currency }}
                </h3>
                <small class="text-muted">Available Balance</small>
              </div>

              <!-- Account Details -->
              <div class="account-details mb-3">
                <div class="row text-center">
                  <div class="col-6" *ngIf="account.type === 'CURRENTACCOUNT'">
                    <small class="text-muted d-block">Overdraft Limit</small>
                    <strong>{{ account.overDraft | currency }}</strong>
                  </div>
                  <div class="col-6" *ngIf="account.type === 'SAVINGACCOUNT'">
                    <small class="text-muted d-block">Interest Rate</small>
                    <strong>{{ account.interestRate }}%</strong>
                  </div>
                  <div class="col-6">
                    <small class="text-muted d-block">Created</small>
                    <strong>{{
                      account.createDate | date : 'shortDate'
                    }}</strong>
                  </div>
                </div>
              </div>

              <!-- Quick Actions -->
              <div class="account-actions">
                <div class="row g-2">
                  <div class="col-6">
                    <button
                      class="btn btn-success btn-sm w-100"
                      [routerLink]="['/customer/deposit', account.id]"
                      [disabled]="account.status !== 'ACTIVATED'"
                    >
                      <i class="bi bi-plus-circle me-1"></i>
                      Add Money
                    </button>
                  </div>
                  <div class="col-6">
                    <button
                      class="btn btn-warning btn-sm w-100"
                      [routerLink]="['/customer/debit', account.id]"
                      [disabled]="account.status !== 'ACTIVATED'"
                    >
                      <i class="bi bi-dash-circle me-1"></i>
                      Debit
                    </button>
                  </div>
                  <div class="col-6">
                    <button
                      class="btn btn-primary btn-sm w-100"
                      [routerLink]="['/customer/transfer']"
                      [disabled]="account.status !== 'ACTIVATED'"
                    >
                      <i class="bi bi-arrow-left-right me-1"></i>
                      Transfer
                    </button>
                  </div>
                  <div class="col-6">
                    <button
                      class="btn btn-outline-primary btn-sm w-100"
                      [routerLink]="['/customer/accounts', account.id]"
                    >
                      <i class="bi bi-eye me-1"></i>
                      Details
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Empty State -->
        <div
          *ngIf="!loading && !error && accounts && accounts.length === 0"
          class="col-12"
        >
          <div class="text-center py-5">
            <i class="bi bi-credit-card display-1 text-muted mb-3"></i>
            <h4>No Accounts Found</h4>
            <p class="text-muted mb-4">You don't have any bank accounts yet.</p>
            <button class="btn btn-primary" routerLink="/customer/accounts/new">
              <i class="bi bi-plus-circle me-2"></i>
              Open Your First Account
            </button>
          </div>
        </div>
      </div>

      <!-- Account Summary -->
      <div
        *ngIf="!loading && !error && accounts && accounts.length > 0"
        class="row mt-4"
      >
        <div class="col-12">
          <div class="card border-0 shadow-sm">
            <div class="card-header bg-white">
              <h5 class="card-title mb-0">Account Summary</h5>
            </div>
            <div class="card-body">
              <div class="row text-center">
                <div class="col-md-3 col-6 mb-3">
                  <div class="stat-item">
                    <h4 class="text-primary mb-1">{{ accounts.length }}</h4>
                    <small class="text-muted">Total Accounts</small>
                  </div>
                </div>
                <div class="col-md-3 col-6 mb-3">
                  <div class="stat-item">
                    <h4 class="text-success mb-1">
                      {{ getTotalBalance() | currency }}
                    </h4>
                    <small class="text-muted">Total Balance</small>
                  </div>
                </div>
                <div class="col-md-3 col-6 mb-3">
                  <div class="stat-item">
                    <h4 class="text-info mb-1">
                      {{ getActiveAccountsCount() }}
                    </h4>
                    <small class="text-muted">Active Accounts</small>
                  </div>
                </div>
                <div class="col-md-3 col-6 mb-3">
                  <div class="stat-item">
                    <h4 class="text-warning mb-1">
                      {{ getTotalOverdraft() | currency }}
                    </h4>
                    <small class="text-muted">Available Credit</small>
                  </div>
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
      .customer-accounts {
        padding: 1.5rem;
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

      .account-details {
        background-color: #f8f9fa;
        border-radius: 8px;
        padding: 1rem;
      }

      .stat-item {
        padding: 0.5rem;
      }

      .btn-sm {
        font-size: 0.8rem;
        padding: 0.375rem 0.75rem;
      }

      @media (max-width: 768px) {
        .customer-accounts {
          padding: 1rem;
        }
      }
    `,
  ],
})
export class CustomerAccountsComponent implements OnInit {
  accounts: BankAccount[] = [];
  loading = true;
  error: string | null = null;

  constructor(
    private accountService: AccountService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.loadAccounts();
  }

  loadAccounts(): void {
    this.loading = true;
    this.error = null;

    const currentUser = this.authService.getCurrentUser();
    if (!currentUser) {
      this.error = 'User not authenticated';
      this.loading = false;
      return;
    }

    this.accountService.getCustomerAccounts().subscribe({
      next: (accounts) => {
        this.accounts = accounts || []; // Ensure it's always an array
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading customer accounts:', error);
        this.error = 'Failed to load accounts. Please try again.';
        this.accounts = []; // Initialize empty array on error
        this.loading = false;
      },
    });
  }

  formatAccountType(type?: string): string {
    switch (type?.toUpperCase()) {
      case 'CURRENTACCOUNT':
        return 'Checking';
      case 'SAVINGACCOUNT':
        return 'Savings';
      default:
        return type || 'Unknown';
    }
  }

  maskAccountNumber(accountId: string | number): string {
    const accountIdStr = accountId?.toString() || '';
    if (!accountIdStr || accountIdStr.length < 4) return '****';
    return '****' + accountIdStr.slice(-4);
  }

  getAccountStatusBadge(status: string): string {
    const badges = {
      ACTIVATED: 'bg-success',
      SUSPENDED: 'bg-warning',
      CLOSED: 'bg-danger',
      PENDING: 'bg-info',
    };
    return badges[status as keyof typeof badges] || 'bg-secondary';
  }

  getTotalBalance(): number {
    return this.accounts.reduce(
      (total, account) => total + (account.balance || 0),
      0
    );
  }

  getActiveAccountsCount(): number {
    return this.accounts.filter((account) => account.status === 'ACTIVATED')
      .length;
  }

  getTotalOverdraft(): number {
    return this.accounts
      .filter((account) => account.type === 'CURRENTACCOUNT')
      .reduce((total, account) => total + (account.overDraft || 0), 0);
  }
}
