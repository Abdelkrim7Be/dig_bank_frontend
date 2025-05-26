import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import {
  FormsModule,
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';

import { AccountService } from '../../../shared/services/account.service';
import { AdminAccountService } from '../../services/account.service';
import { BankingApiService } from '../../../core/services/banking-api.service';
import {
  Transaction,
  TransactionType,
  TransactionFilter,
  PagedResponse,
  Account,
} from '../../../shared/models/account.model';
import { LoaderComponent } from '../../../shared/components/loader/loader.component';
import { InlineAlertComponent } from '../../../shared/components/inline-alert/inline-alert.component';

@Component({
  selector: 'app-admin-transactions',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    FormsModule,
    ReactiveFormsModule,
    LoaderComponent,
    InlineAlertComponent,
  ],
  template: `
    <div class="container-fluid">
      <!-- Page Header -->
      <div class="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 class="mb-1">Transaction Management</h2>
          <p class="text-muted mb-0">
            View all transactions and perform banking operations
          </p>
        </div>
        <div class="d-flex gap-2">
          <button
            class="btn btn-success"
            (click)="openOperationModal('credit')"
            [disabled]="loading"
          >
            <i class="bi bi-plus-circle me-2"></i>
            Credit
          </button>
          <button
            class="btn btn-warning"
            (click)="openOperationModal('debit')"
            [disabled]="loading"
          >
            <i class="bi bi-dash-circle me-2"></i>
            Debit
          </button>
          <button
            class="btn btn-primary"
            routerLink="/admin/transfer"
            [disabled]="loading"
          >
            <i class="bi bi-arrow-left-right me-2"></i>
            Transfer
          </button>
        </div>
      </div>

      <!-- Success/Error Messages -->
      <div
        *ngIf="successMessage"
        class="alert alert-success alert-dismissible fade show"
        role="alert"
      >
        {{ successMessage }}
        <button
          type="button"
          class="btn-close"
          (click)="successMessage = ''"
          aria-label="Close"
        ></button>
      </div>

      <div
        *ngIf="errorMessage"
        class="alert alert-danger alert-dismissible fade show"
        role="alert"
      >
        {{ errorMessage }}
        <button
          type="button"
          class="btn-close"
          (click)="errorMessage = ''"
          aria-label="Close"
        ></button>
      </div>

      <!-- Filters -->
      <div class="card mb-4">
        <div class="card-header">
          <h5 class="card-title mb-0">Filters</h5>
        </div>
        <div class="card-body">
          <div class="row g-3">
            <div class="col-md-3">
              <label class="form-label">Account ID</label>
              <input
                type="text"
                class="form-control"
                [(ngModel)]="filter.accountId"
                placeholder="Enter account ID"
              />
            </div>
            <div class="col-md-3">
              <label class="form-label">Transaction Type</label>
              <select class="form-select" [(ngModel)]="filter.type">
                <option value="">All Types</option>
                <option value="DEPOSIT">Add Money</option>
                <option value="WITHDRAWAL">Debit</option>
                <option value="TRANSFER">Transfer</option>
              </select>
            </div>
            <div class="col-md-2">
              <label class="form-label">Start Date</label>
              <input
                type="date"
                class="form-control"
                [(ngModel)]="filter.startDate"
              />
            </div>
            <div class="col-md-2">
              <label class="form-label">End Date</label>
              <input
                type="date"
                class="form-control"
                [(ngModel)]="filter.endDate"
              />
            </div>
            <div class="col-md-2 d-flex align-items-end">
              <div class="d-grid gap-2 w-100">
                <button class="btn btn-primary" (click)="applyFilters()">
                  <i class="bi bi-search me-2"></i>Filter
                </button>
                <button
                  class="btn btn-outline-secondary"
                  (click)="clearFilters()"
                >
                  Clear
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Transactions Table -->
      <div class="card">
        <div
          class="card-header d-flex justify-content-between align-items-center"
        >
          <h5 class="card-title mb-0">All Transactions</h5>
          <span class="badge bg-primary">
            {{ pagedResponse?.totalElements || 0 }} total
          </span>
        </div>
        <div class="card-body p-0">
          <app-loader *ngIf="loading"></app-loader>
          <app-inline-alert
            *ngIf="error && !loading"
            type="danger"
            [message]="error"
          ></app-inline-alert>

          <div *ngIf="!loading && !error" class="table-responsive">
            <table class="table table-hover mb-0">
              <thead class="table-light">
                <tr>
                  <th>ID</th>
                  <th>Customer</th>
                  <th>Account ID</th>
                  <th>Type</th>
                  <th>Amount</th>
                  <th>Description</th>
                  <th>Date</th>
                  <th>Balance</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let transaction of transactions">
                  <td>{{ transaction.id }}</td>
                  <td>
                    <div class="d-flex align-items-center">
                      <i class="bi bi-person-circle text-muted me-2"></i>
                      {{ getCustomerName(transaction) }}
                    </div>
                  </td>
                  <td>
                    <code>{{ transaction.accountId }}</code>
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
                  <td>{{ transaction.description || 'N/A' }}</td>
                  <td>{{ transaction.operationDate | date : 'short' }}</td>
                  <td>{{ transaction.accountBalance | currency }}</td>
                </tr>
                <tr *ngIf="transactions.length === 0">
                  <td colspan="8" class="text-center py-4 text-muted">
                    No transactions found
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Pagination -->
          <div
            *ngIf="pagedResponse && pagedResponse.totalPages > 1"
            class="d-flex justify-content-between align-items-center p-3"
          >
            <div class="text-muted">
              Showing {{ pagedResponse.size * pagedResponse.number + 1 }} to
              {{
                Math.min(
                  pagedResponse.size * (pagedResponse.number + 1),
                  pagedResponse.totalElements
                )
              }}
              of {{ pagedResponse.totalElements }} entries
            </div>
            <nav>
              <ul class="pagination mb-0">
                <li class="page-item" [class.disabled]="pagedResponse.first">
                  <button
                    class="page-link"
                    (click)="goToPage(pagedResponse.number - 1)"
                    [disabled]="pagedResponse.first"
                  >
                    Previous
                  </button>
                </li>
                <li
                  *ngFor="let page of getPageNumbers()"
                  class="page-item"
                  [class.active]="page === pagedResponse.number"
                >
                  <button class="page-link" (click)="goToPage(page)">
                    {{ page + 1 }}
                  </button>
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
              </ul>
            </nav>
          </div>
        </div>
      </div>
    </div>

    <!-- Banking Operation Modal -->
    <div
      *ngIf="showModal"
      class="modal d-block"
      tabindex="-1"
      style="background-color: rgba(0,0,0,0.5);"
    >
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">
              {{ getOperationTitle() }}
            </h5>
            <button
              type="button"
              class="btn-close"
              (click)="closeModal()"
              aria-label="Close"
            ></button>
          </div>
          <form [formGroup]="operationForm" (ngSubmit)="performOperation()">
            <div class="modal-body">
              <div *ngIf="errorMessage" class="alert alert-danger">
                {{ errorMessage }}
              </div>

              <div class="mb-3">
                <label for="accountId" class="form-label">Account ID *</label>
                <input
                  type="text"
                  class="form-control"
                  id="accountId"
                  formControlName="accountId"
                  placeholder="Enter account ID"
                />
                <div
                  *ngIf="
                    operationForm.get('accountId')?.invalid &&
                    operationForm.get('accountId')?.touched
                  "
                  class="text-danger small mt-1"
                >
                  Account ID is required
                </div>
              </div>
              <div class="mb-3">
                <label for="amount" class="form-label">Amount *</label>
                <input
                  type="number"
                  class="form-control"
                  id="amount"
                  formControlName="amount"
                  placeholder="Enter amount"
                  min="0.01"
                  step="0.01"
                />
                <div
                  *ngIf="
                    operationForm.get('amount')?.invalid &&
                    operationForm.get('amount')?.touched
                  "
                  class="text-danger small mt-1"
                >
                  Valid amount is required
                </div>
              </div>
              <div class="mb-3">
                <label for="description" class="form-label"
                  >Description *</label
                >
                <input
                  type="text"
                  class="form-control"
                  id="description"
                  formControlName="description"
                  placeholder="Enter description"
                />
                <div
                  *ngIf="
                    operationForm.get('description')?.invalid &&
                    operationForm.get('description')?.touched
                  "
                  class="text-danger small mt-1"
                >
                  Description is required
                </div>
              </div>
            </div>
            <div class="modal-footer">
              <button
                type="button"
                class="btn btn-secondary"
                (click)="closeModal()"
              >
                Cancel
              </button>
              <button
                type="submit"
                class="btn"
                [class]="getOperationButtonClass()"
                [disabled]="operationForm.invalid || operationLoading"
              >
                <span
                  *ngIf="operationLoading"
                  class="spinner-border spinner-border-sm me-2"
                ></span>
                {{ getOperationTitle() }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      .table th {
        border-top: none;
        font-weight: 600;
        color: var(--bs-gray-700);
      }

      .badge {
        font-size: 0.75rem;
        padding: 0.375rem 0.75rem;
      }

      code {
        font-size: 0.875rem;
        color: var(--bs-gray-700);
        background-color: var(--bs-gray-100);
        padding: 0.25rem 0.5rem;
        border-radius: 0.25rem;
      }

      .pagination .page-link {
        color: var(--bs-primary);
      }

      .pagination .page-item.active .page-link {
        background-color: var(--bs-primary);
        border-color: var(--bs-primary);
      }
    `,
  ],
})
export class AdminTransactionsComponent implements OnInit {
  transactions: any[] = [];
  pagedResponse: PagedResponse<any> | null = null;
  loading = false;
  error = '';
  successMessage = '';
  errorMessage = '';

  // Operation modal
  currentOperation: 'credit' | 'debit' = 'credit';
  operationLoading = false;
  operationForm: FormGroup;
  showModal = false;

  filter: TransactionFilter = {
    page: 0,
    size: 20,
    sortBy: 'operationDate',
    sortDirection: 'desc',
  };

  Math = Math;

  constructor(
    private accountService: AccountService,
    private adminAccountService: AdminAccountService,
    private bankingApiService: BankingApiService,
    private fb: FormBuilder
  ) {
    this.operationForm = this.fb.group({
      accountId: ['', [Validators.required]],
      amount: ['', [Validators.required, Validators.min(0.01)]],
      description: ['', [Validators.required]],
    });
  }

  ngOnInit(): void {
    this.loadTransactions();
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

  getPageNumbers(): number[] {
    if (!this.pagedResponse) return [];
    const totalPages = this.pagedResponse.totalPages;
    const currentPage = this.pagedResponse.number;
    const pages: number[] = [];

    // Show max 5 pages around current page
    const start = Math.max(0, currentPage - 2);
    const end = Math.min(totalPages - 1, currentPage + 2);

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    return pages;
  }

  // Banking Operations
  openOperationModal(operation: 'credit' | 'debit'): void {
    this.currentOperation = operation;
    this.operationForm.reset();
    this.errorMessage = '';
    this.successMessage = '';
    this.showModal = true;
  }

  closeModal(): void {
    this.showModal = false;
    this.operationForm.reset();
    this.errorMessage = '';
  }

  performOperation(): void {
    if (this.operationForm.invalid) return;

    this.operationLoading = true;
    this.errorMessage = '';

    const { accountId, amount, description } = this.operationForm.value;

    let operation$;
    switch (this.currentOperation) {
      case 'credit':
        operation$ = this.bankingApiService.credit(
          accountId,
          amount,
          description
        );
        break;
      case 'debit':
        operation$ = this.bankingApiService.debit(
          accountId,
          amount,
          description
        );
        break;
    }

    operation$.subscribe({
      next: () => {
        this.operationLoading = false;
        this.successMessage = `${this.getOperationTitle()} completed successfully!`;

        // Close modal
        this.closeModal();

        // Reload transactions
        this.loadTransactions();
      },
      error: (error) => {
        this.operationLoading = false;
        this.errorMessage =
          error.error?.message ||
          `${this.getOperationTitle()} failed. Please try again.`;
        console.error('Operation error:', error);
      },
    });
  }

  getOperationTitle(): string {
    switch (this.currentOperation) {
      case 'credit':
        return 'Credit Account';
      case 'debit':
        return 'Debit Account';
      default:
        return 'Banking Operation';
    }
  }

  getOperationButtonClass(): string {
    switch (this.currentOperation) {
      case 'credit':
        return 'btn-success';
      case 'debit':
        return 'btn-warning';
      default:
        return 'btn-primary';
    }
  }

  // Helper methods for display
  getCustomerName(transaction: any): string {
    if (transaction.customer && transaction.customer.username) {
      return transaction.customer.username;
    }
    if (transaction.customer && transaction.customer.name) {
      return transaction.customer.name;
    }
    if (transaction.performedBy) {
      return transaction.performedBy;
    }
    return 'Unknown Customer';
  }

  getTransactionTypeBadge(type: string): string {
    switch (type?.toUpperCase()) {
      case 'DEPOSIT':
      case 'CREDIT':
        return 'bg-success';
      case 'WITHDRAWAL':
      case 'DEBIT':
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
      case 'CREDIT':
        return 'text-success';
      case 'WITHDRAWAL':
      case 'DEBIT':
        return 'text-danger';
      case 'TRANSFER':
        return 'text-primary';
      default:
        return '';
    }
  }
}
