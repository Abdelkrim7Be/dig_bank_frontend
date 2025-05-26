import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AccountService } from '../shared/services/account.service';
import {
  Transaction,
  TransactionType,
  TransactionStatus,
  TransactionFilter,
  PagedResponse,
  Account,
} from '../shared/models/account.model';
import { LoaderComponent } from '../shared/components/loader/loader.component';
import { InlineAlertComponent } from '../shared/components/inline-alert/inline-alert.component';

@Component({
  selector: 'app-transactions',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
    LoaderComponent,
    InlineAlertComponent,
  ],
  template: `
    <div class="container-fluid">
      <!-- Page Header -->
      <div class="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 class="mb-1">Transaction History</h2>
          <p class="text-muted mb-0">
            View and filter your transaction history
          </p>
        </div>
        <div class="d-flex gap-2">
          <button class="btn btn-success" routerLink="/deposit">
            <i class="bi bi-plus-circle me-2"></i>
            Deposit
          </button>
          <button class="btn btn-warning" routerLink="/withdraw">
            <i class="bi bi-dash-circle me-2"></i>
            Withdraw
          </button>
          <button class="btn btn-primary" routerLink="/transfer">
            <i class="bi bi-arrow-left-right me-2"></i>
            Transfer
          </button>
        </div>
      </div>

      <!-- Filters -->
      <div class="card mb-4">
        <div class="card-header">
          <h5 class="mb-0">
            <i class="bi bi-funnel me-2"></i>
            Filters
          </h5>
        </div>
        <div class="card-body">
          <div class="row">
            <div class="col-md-3">
              <label for="accountFilter" class="form-label">Account</label>
              <select
                id="accountFilter"
                class="form-select"
                [(ngModel)]="filter.accountId"
                (change)="applyFilters()"
              >
                <option value="">All Accounts</option>
                <option *ngFor="let account of accounts" [value]="account.id">
                  {{ account.id }} -
                  {{ getAccountDisplayText(account) }}
                </option>
              </select>
            </div>
            <div class="col-md-2">
              <label for="typeFilter" class="form-label">Type</label>
              <select
                id="typeFilter"
                class="form-select"
                [(ngModel)]="filter.type"
                (change)="applyFilters()"
              >
                <option value="">All Types</option>
                <option value="DEPOSIT">Deposit</option>
                <option value="WITHDRAWAL">Withdrawal</option>
                <option value="TRANSFER">Transfer</option>
                <option value="PAYMENT">Payment</option>
                <option value="FEE">Fee</option>
                <option value="INTEREST">Interest</option>
              </select>
            </div>
            <div class="col-md-2">
              <label for="statusFilter" class="form-label">Status</label>
              <select
                id="statusFilter"
                class="form-select"
                [(ngModel)]="filter.status"
                (change)="applyFilters()"
              >
                <option value="">All Status</option>
                <option value="PENDING">Pending</option>
                <option value="COMPLETED">Completed</option>
                <option value="FAILED">Failed</option>
                <option value="CANCELLED">Cancelled</option>
              </select>
            </div>
            <div class="col-md-2">
              <label for="startDate" class="form-label">From Date</label>
              <input
                type="date"
                id="startDate"
                class="form-control"
                [(ngModel)]="filter.startDate"
                (change)="applyFilters()"
              />
            </div>
            <div class="col-md-2">
              <label for="endDate" class="form-label">To Date</label>
              <input
                type="date"
                id="endDate"
                class="form-control"
                [(ngModel)]="filter.endDate"
                (change)="applyFilters()"
              />
            </div>
            <div class="col-md-1 d-flex align-items-end">
              <button
                class="btn btn-outline-secondary"
                (click)="clearFilters()"
              >
                <i class="bi bi-x-circle"></i>
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Loading State -->
      <app-loader *ngIf="loading"></app-loader>

      <!-- Error State -->
      <app-inline-alert
        *ngIf="error"
        type="danger"
        [message]="error"
        [dismissible]="true"
        (dismissed)="error = ''"
      >
      </app-inline-alert>

      <!-- Transactions Table -->
      <div class="card" *ngIf="!loading && !error">
        <div
          class="card-header d-flex justify-content-between align-items-center"
        >
          <h5 class="mb-0">Transactions</h5>
          <span class="badge bg-secondary"
            >{{ pagedResponse?.totalElements || 0 }} total</span
          >
        </div>
        <div class="card-body p-0">
          <div class="table-responsive">
            <table class="table table-hover mb-0">
              <thead class="table-light">
                <tr>
                  <th>Date</th>
                  <th>Account</th>
                  <th>Type</th>
                  <th>Description</th>
                  <th>Amount</th>
                  <th>Balance</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let transaction of transactions">
                  <td>
                    <div>{{ transaction.operationDate | date : 'short' }}</div>
                    <small class="text-muted" *ngIf="transaction.processedDate">
                      Processed:
                      {{ transaction.processedDate | date : 'short' }}
                    </small>
                  </td>
                  <td>
                    <div>{{ transaction.accountNumber }}</div>
                    <small class="text-muted"
                      >ID: {{ transaction.accountId }}</small
                    >
                  </td>
                  <td>
                    <span
                      class="badge"
                      [ngClass]="getTypeBadgeClass(transaction.type)"
                    >
                      {{ getTypeDisplay(transaction.type) }}
                    </span>
                  </td>
                  <td>
                    <div>{{ transaction.description }}</div>
                    <small class="text-muted" *ngIf="transaction.reference">
                      Ref: {{ transaction.reference }}
                    </small>
                  </td>
                  <td>
                    <span
                      [ngClass]="getAmountClass(transaction.type)"
                      class="fw-bold"
                    >
                      {{
                        getAmountDisplay(transaction)
                          | currency : 'USD' : 'symbol' : '1.2-2'
                      }}
                    </span>
                  </td>
                  <td>
                    {{
                      transaction.balance
                        | currency : 'USD' : 'symbol' : '1.2-2'
                    }}
                  </td>
                  <td>
                    <span
                      class="badge"
                      [ngClass]="getStatusBadgeClass(transaction.status)"
                    >
                      {{ transaction.status }}
                    </span>
                  </td>
                  <td>
                    <button
                      class="btn btn-sm btn-outline-primary"
                      [routerLink]="['/transactions', transaction.id]"
                    >
                      <i class="bi bi-eye"></i>
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Pagination -->
        <div
          class="card-footer"
          *ngIf="pagedResponse && pagedResponse.totalPages > 1"
        >
          <nav aria-label="Transaction pagination">
            <ul class="pagination justify-content-center mb-0">
              <li class="page-item" [class.disabled]="pagedResponse.first">
                <button
                  class="page-link"
                  (click)="goToPage(0)"
                  [disabled]="pagedResponse.first"
                >
                  First
                </button>
              </li>
              <li class="page-item" [class.disabled]="pagedResponse.first">
                <button
                  class="page-link"
                  (click)="goToPage(pagedResponse.number - 1)"
                  [disabled]="pagedResponse.first"
                >
                  Previous
                </button>
              </li>
              <li class="page-item active">
                <span class="page-link">
                  {{ pagedResponse.number + 1 }} of
                  {{ pagedResponse.totalPages }}
                </span>
              </li>
              <li class="page-item" [class.disabled]="pagedResponse.last">
                <button
                  class="page-link"
                  (click)="goToPage(pagedResponse.number + 1)"
                  [disabled]="pagedResponse.last"
                >
                  Next
                </button>
              </li>
              <li class="page-item" [class.disabled]="pagedResponse.last">
                <button
                  class="page-link"
                  (click)="goToPage(pagedResponse.totalPages - 1)"
                  [disabled]="pagedResponse.last"
                >
                  Last
                </button>
              </li>
            </ul>
          </nav>
        </div>
      </div>

      <!-- Empty State -->
      <div
        class="text-center py-5"
        *ngIf="!loading && !error && transactions.length === 0"
      >
        <i class="bi bi-receipt display-1 text-muted"></i>
        <h4 class="mt-3">No Transactions Found</h4>
        <p class="text-muted">No transactions match your current filters.</p>
        <button class="btn btn-outline-primary" (click)="clearFilters()">
          Clear Filters
        </button>
      </div>
    </div>
  `,
  styles: [
    `
      .table th {
        border-top: none;
        font-weight: 600;
      }

      .badge {
        font-size: 0.75em;
      }

      .text-success {
        color: var(--success-green) !important;
      }

      .text-danger {
        color: var(--danger-orange) !important;
      }

      .pagination .page-link {
        color: var(--primary-red);
      }

      .pagination .page-item.active .page-link {
        background-color: var(--primary-red);
        border-color: var(--primary-red);
      }
    `,
  ],
})
export class TransactionsComponent implements OnInit {
  transactions: Transaction[] = [];
  accounts: Account[] = [];
  pagedResponse: PagedResponse<Transaction> | null = null;
  loading = false;
  error = '';

  filter: TransactionFilter = {
    page: 0,
    size: 20,
    sortBy: 'operationDate',
    sortDirection: 'desc',
  };

  constructor(private accountService: AccountService) {}

  ngOnInit(): void {
    this.loadAccounts();
    this.loadTransactions();
  }

  loadAccounts(): void {
    this.accountService.getAccounts().subscribe({
      next: (accounts) => {
        this.accounts = accounts;
      },
      error: (error) => {
        console.error('Error loading accounts:', error);
      },
    });
  }

  loadTransactions(): void {
    this.loading = true;
    this.error = '';

    this.accountService.getTransactions(this.filter).subscribe({
      next: (response) => {
        this.pagedResponse = response;
        this.transactions = response.content;
        this.loading = false;
      },
      error: (error) => {
        this.error = 'Failed to load transactions. Please try again.';
        this.loading = false;
        console.error('Error loading transactions:', error);
      },
    });
  }

  applyFilters(): void {
    this.filter.page = 0; // Reset to first page when filtering
    this.loadTransactions();
  }

  clearFilters(): void {
    this.filter = {
      page: 0,
      size: 20,
      sortBy: 'operationDate',
      sortDirection: 'desc',
    };
    this.loadTransactions();
  }

  goToPage(page: number): void {
    this.filter.page = page;
    this.loadTransactions();
  }

  getAccountDisplayText(account: any): string {
    const type = account?.type || account?.accountType;
    return this.getAccountTypeDisplay(type);
  }

  getAccountTypeDisplay(type: string | undefined): string {
    if (!type) {
      return 'Unknown';
    }
    return type.charAt(0) + type.slice(1).toLowerCase();
  }

  getTypeDisplay(type: TransactionType): string {
    if (!type) {
      return 'Unknown';
    }
    return type.charAt(0) + type.slice(1).toLowerCase();
  }

  getTypeBadgeClass(type: TransactionType): string {
    switch (type) {
      case TransactionType.DEPOSIT:
        return 'bg-success';
      case TransactionType.WITHDRAWAL:
        return 'bg-warning';
      case TransactionType.TRANSFER:
        return 'bg-info';
      case TransactionType.PAYMENT:
        return 'bg-primary';
      case TransactionType.FEE:
        return 'bg-danger';
      case TransactionType.INTEREST:
        return 'bg-success';
      default:
        return 'bg-secondary';
    }
  }

  getStatusBadgeClass(status: TransactionStatus): string {
    switch (status) {
      case TransactionStatus.COMPLETED:
        return 'bg-success';
      case TransactionStatus.PENDING:
        return 'bg-warning';
      case TransactionStatus.FAILED:
        return 'bg-danger';
      case TransactionStatus.CANCELLED:
        return 'bg-secondary';
      default:
        return 'bg-secondary';
    }
  }

  getAmountClass(type: TransactionType): string {
    switch (type) {
      case TransactionType.DEPOSIT:
      case TransactionType.INTEREST:
        return 'text-success';
      case TransactionType.WITHDRAWAL:
      case TransactionType.FEE:
      case TransactionType.PAYMENT:
        return 'text-danger';
      default:
        return '';
    }
  }

  getAmountDisplay(transaction: Transaction): number {
    const isDebit = [
      TransactionType.WITHDRAWAL,
      TransactionType.FEE,
      TransactionType.PAYMENT,
    ].includes(transaction.type);

    return isDebit ? -transaction.amount : transaction.amount;
  }
}
