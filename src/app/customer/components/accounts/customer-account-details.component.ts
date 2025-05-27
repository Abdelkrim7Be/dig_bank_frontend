import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AccountService } from '../../../shared/services/account.service';
import {
  BankAccount,
  Transaction,
  TransactionFilter,
} from '../../../shared/models/account.model';
import { AuthService } from '../../../auth/services/auth.service';

@Component({
  selector: 'app-customer-account-details',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  template: `
    <div class="customer-account-details">
      <!-- Back Button -->
      <div class="mb-3">
        <button
          class="btn btn-outline-secondary"
          routerLink="/customer/accounts"
        >
          <i class="bi bi-arrow-left me-2"></i>Back to Accounts
        </button>
      </div>

      <!-- Loading State -->
      <div *ngIf="loading" class="text-center py-5">
        <div class="spinner-border text-primary" role="status">
          <span class="visually-hidden">Loading...</span>
        </div>
        <p class="mt-3 text-muted">Loading account details...</p>
      </div>

      <!-- Error State -->
      <div *ngIf="error && !loading" class="alert alert-danger">
        <i class="bi bi-exclamation-triangle me-2"></i>
        {{ error }}
        <button
          class="btn btn-outline-danger btn-sm ms-2"
          (click)="loadAccountDetails()"
        >
          <i class="bi bi-arrow-clockwise me-1"></i>Retry
        </button>
      </div>

      <!-- Account Details -->
      <div *ngIf="account && !loading" class="row">
        <!-- Account Info Card -->
        <div class="col-lg-4 mb-4">
          <div class="card border-0 shadow-sm h-100">
            <div class="card-header bg-primary text-white">
              <h5 class="card-title mb-0">
                <i class="bi bi-credit-card me-2"></i>
                Account Information
              </h5>
            </div>
            <div class="card-body">
              <!-- Account Type -->
              <div class="mb-3">
                <label class="form-label text-muted">Account Type</label>
                <p class="fw-bold">{{ formatAccountType(account.type) }}</p>
              </div>

              <!-- Account Number -->
              <div class="mb-3">
                <label class="form-label text-muted">Account Number</label>
                <p class="fw-bold font-monospace">
                  {{ maskAccountNumber(account.id) }}
                </p>
              </div>

              <!-- Status -->
              <div class="mb-3">
                <label class="form-label text-muted">Status</label>
                <p>
                  <span
                    class="badge"
                    [class]="getAccountStatusBadge(account.status)"
                  >
                    {{ account.status }}
                  </span>
                </p>
              </div>

              <!-- Balance -->
              <div class="mb-3">
                <label class="form-label text-muted">Available Balance</label>
                <h4 class="text-success mb-0">
                  {{ account.balance | currency }}
                </h4>
              </div>

              <!-- Account Specific Details -->
              <div *ngIf="account.type === 'CURRENTACCOUNT'" class="mb-3">
                <label class="form-label text-muted">Overdraft Limit</label>
                <p class="fw-bold text-warning">
                  {{ account.overDraft | currency }}
                </p>
              </div>

              <div *ngIf="account.type === 'SAVINGACCOUNT'" class="mb-3">
                <label class="form-label text-muted">Interest Rate</label>
                <p class="fw-bold text-info">
                  {{ account.interestRate }}% per annum
                </p>
              </div>

              <!-- Created Date -->
              <div class="mb-3">
                <label class="form-label text-muted">Account Opened</label>
                <p class="fw-bold">
                  {{ account.createDate | date : 'fullDate' }}
                </p>
              </div>

              <!-- Quick Actions -->
              <div class="d-grid gap-2">
                <button
                  class="btn btn-success"
                  [routerLink]="['/customer/deposit', account.id]"
                  [disabled]="account.status !== 'ACTIVATED'"
                >
                  <i class="bi bi-plus-circle me-2"></i>Credit
                </button>
                <button
                  class="btn btn-warning"
                  [routerLink]="['/customer/debit', account.id]"
                  [disabled]="account.status !== 'ACTIVATED'"
                >
                  <i class="bi bi-dash-circle me-2"></i>Debit
                </button>
                <button
                  class="btn btn-primary"
                  [routerLink]="['/customer/transfer']"
                  [disabled]="account.status !== 'ACTIVATED'"
                >
                  <i class="bi bi-arrow-left-right me-2"></i>Transfer Funds
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Transactions -->
        <div class="col-lg-8 mb-4">
          <div class="card border-0 shadow-sm h-100">
            <div
              class="card-header bg-white d-flex justify-content-between align-items-center"
            >
              <h5 class="card-title mb-0">
                <i class="bi bi-clock-history me-2"></i>
                Recent Transactions
              </h5>
              <button
                class="btn btn-outline-primary btn-sm"
                routerLink="/customer/transaction-history"
              >
                View All
              </button>
            </div>
            <div class="card-body p-0">
              <!-- Transaction Filters -->
              <div class="p-3 border-bottom bg-light">
                <div class="row g-2">
                  <div class="col-md-4">
                    <select
                      class="form-select form-select-sm"
                      [(ngModel)]="transactionFilter.type"
                      (change)="loadTransactions()"
                    >
                      <option value="">All Types</option>
                      <option value="DEPOSIT">Deposits</option>
                      <option value="WITHDRAWAL">Withdrawals</option>
                      <option value="TRANSFER">Transfers</option>
                    </select>
                  </div>
                  <div class="col-md-4">
                    <input
                      type="date"
                      class="form-control form-control-sm"
                      [(ngModel)]="transactionFilter.startDate"
                      (change)="loadTransactions()"
                      placeholder="Start Date"
                    />
                  </div>
                  <div class="col-md-4">
                    <input
                      type="date"
                      class="form-control form-control-sm"
                      [(ngModel)]="transactionFilter.endDate"
                      (change)="loadTransactions()"
                      placeholder="End Date"
                    />
                  </div>
                </div>
              </div>

              <!-- Transactions List -->
              <div
                class="transaction-list"
                style="max-height: 400px; overflow-y: auto;"
              >
                <div *ngIf="transactionsLoading" class="text-center py-4">
                  <div
                    class="spinner-border spinner-border-sm text-primary"
                    role="status"
                  >
                    <span class="visually-hidden">Loading transactions...</span>
                  </div>
                </div>

                <div *ngIf="transactionsError" class="alert alert-warning m-3">
                  <i class="bi bi-exclamation-triangle me-2"></i>
                  {{ transactionsError }}
                </div>

                <div *ngIf="!transactionsLoading && !transactionsError">
                  <div
                    *ngFor="let transaction of transactions"
                    class="transaction-item border-bottom p-3"
                  >
                    <div class="d-flex align-items-center">
                      <div class="transaction-icon me-3">
                        <i
                          class="bi"
                          [class]="getTransactionIcon(transaction.type)"
                        ></i>
                      </div>
                      <div class="flex-grow-1">
                        <div class="fw-semibold">
                          {{
                            transaction.description ||
                              getTransactionDescription(transaction.type)
                          }}
                        </div>
                        <small class="text-muted">
                          {{ transaction.operationDate | date : 'medium' }}
                        </small>
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
                          [class]="
                            getTransactionStatusBadge(transaction.status)
                          "
                        >
                          {{ transaction.status }}
                        </small>
                      </div>
                    </div>
                  </div>

                  <div
                    *ngIf="
                      !transactionsLoading &&
                      !transactionsError &&
                      transactions &&
                      transactions.length === 0
                    "
                    class="text-center py-4"
                  >
                    <i class="bi bi-inbox display-4 text-muted mb-3"></i>
                    <p class="text-muted">
                      No transactions found for this account.
                    </p>
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
      .customer-account-details {
        padding: 1.5rem;
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

      .transaction-item:hover {
        background-color: #f8f9fa;
      }

      @media (max-width: 768px) {
        .customer-account-details {
          padding: 1rem;
        }
      }
    `,
  ],
})
export class CustomerAccountDetailsComponent implements OnInit {
  account: BankAccount | null = null;
  transactions: Transaction[] = [];
  loading = true;
  transactionsLoading = false;
  error: string | null = null;
  transactionsError: string | null = null;
  accountId: string | null = null;

  transactionFilter: TransactionFilter = {
    page: 0,
    size: 10,
    sortBy: 'operationDate',
    sortDirection: 'desc' as 'desc',
  };

  constructor(
    private route: ActivatedRoute,
    private accountService: AccountService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.accountId = this.route.snapshot.paramMap.get('id');
    if (this.accountId) {
      this.transactionFilter.accountId = this.accountId;
      this.loadAccountDetails();
      this.loadTransactions();
    } else {
      this.error = 'Account ID not provided';
      this.loading = false;
    }
  }

  loadAccountDetails(): void {
    if (!this.accountId) return;

    this.loading = true;
    this.error = null;

    this.accountService.getAccountById(this.accountId).subscribe({
      next: (account) => {
        this.account = account;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading account details:', error);
        this.error = 'Failed to load account details. Please try again.';
        this.loading = false;
      },
    });
  }

  loadTransactions(): void {
    if (!this.accountId) return;

    this.transactionsLoading = true;
    this.transactionsError = null;

    // Try customer-specific method first, then fallback
    this.accountService
      .getCustomerTransactions(this.transactionFilter)
      .subscribe({
        next: (response) => {
          this.transactions = response.content || [];
          this.transactionsLoading = false;
        },
        error: (error) => {
          console.error(
            'Error loading transactions with customer method, trying general method:',
            error
          );

          // Fallback to general method
          this.accountService
            .getTransactions(this.transactionFilter)
            .subscribe({
              next: (response) => {
                this.transactions = response.content || [];
                this.transactionsLoading = false;
              },
              error: (generalError) => {
                console.error(
                  'Error loading transactions (all methods failed):',
                  generalError
                );
                this.transactionsError = 'Failed to load transactions.';
                this.transactions = []; // Initialize empty array on error
                this.transactionsLoading = false;
              },
            });
        },
      });
  }

  formatAccountType(type?: string): string {
    switch (type?.toUpperCase()) {
      case 'CURRENTACCOUNT':
        return 'Checking Account';
      case 'SAVINGACCOUNT':
        return 'Savings Account';
      default:
        return type || 'Unknown Account';
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

  getTransactionIcon(type: string): string {
    const icons = {
      DEPOSIT: 'bi-arrow-down-circle deposit',
      WITHDRAWAL: 'bi-arrow-up-circle withdrawal',
      TRANSFER: 'bi-arrow-left-right transfer',
    };
    return icons[type as keyof typeof icons] || 'bi-circle';
  }

  getTransactionDescription(type: string): string {
    const descriptions = {
      DEPOSIT: 'Money Added',
      WITHDRAWAL: 'Money Withdrawn',
      TRANSFER: 'Money Transferred',
    };
    return descriptions[type as keyof typeof descriptions] || 'Transaction';
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
