import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { AccountService } from '../../../shared/services/account.service';
import {
  Transaction,
  TransactionFilter,
  PagedResponse,
  TransactionType,
  TransactionStatus,
} from '../../../shared/models/account.model';
import { AuthService } from '../../../auth/services/auth.service';

@Component({
  selector: 'app-customer-transactions',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  template: `
    <div class="customer-transactions">
      <!-- Header -->
      <div class="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 class="h4 mb-1">Transaction History</h2>
          <p class="text-muted mb-0">View all your transaction history</p>
        </div>
        <div class="d-flex gap-2">
          <button
            class="btn btn-outline-primary"
            (click)="exportTransactions()"
          >
            <i class="bi bi-download me-2"></i>Export
          </button>
          <button class="btn btn-primary" routerLink="/customer/transfer">
            <i class="bi bi-plus-circle me-2"></i>New Transaction
          </button>
        </div>
      </div>

      <!-- Filters -->
      <div class="card border-0 shadow-sm mb-4">
        <div class="card-header bg-white">
          <h6 class="card-title mb-0">
            <i class="bi bi-funnel me-2"></i>Filter Transactions
          </h6>
        </div>
        <div class="card-body">
          <div class="row g-3">
            <div class="col-md-3">
              <label class="form-label">Transaction Type</label>
              <select
                class="form-select"
                [(ngModel)]="filter.type"
                (change)="applyFilters()"
              >
                <option value="">All Types</option>
                <option value="DEPOSIT">Deposits</option>
                <option value="WITHDRAWAL">Withdrawals</option>
                <option value="TRANSFER">Transfers</option>
              </select>
            </div>
            <div class="col-md-3">
              <label class="form-label">Start Date</label>
              <input
                type="date"
                class="form-control"
                [(ngModel)]="filter.startDate"
                (change)="applyFilters()"
              />
            </div>
            <div class="col-md-3">
              <label class="form-label">End Date</label>
              <input
                type="date"
                class="form-control"
                [(ngModel)]="filter.endDate"
                (change)="applyFilters()"
              />
            </div>
            <div class="col-md-3">
              <label class="form-label">Amount Range</label>
              <div class="input-group">
                <input
                  type="number"
                  class="form-control"
                  placeholder="Min"
                  [(ngModel)]="filter.minAmount"
                  (change)="applyFilters()"
                />
                <span class="input-group-text">-</span>
                <input
                  type="number"
                  class="form-control"
                  placeholder="Max"
                  [(ngModel)]="filter.maxAmount"
                  (change)="applyFilters()"
                />
              </div>
            </div>
          </div>
          <div class="row mt-3">
            <div class="col-12">
              <button
                class="btn btn-outline-secondary btn-sm me-2"
                (click)="clearFilters()"
              >
                <i class="bi bi-x-circle me-1"></i>Clear Filters
              </button>
              <button class="btn btn-primary btn-sm" (click)="applyFilters()">
                <i class="bi bi-search me-1"></i>Apply Filters
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Loading State -->
      <div *ngIf="loading" class="text-center py-5">
        <div class="spinner-border text-primary" role="status">
          <span class="visually-hidden">Loading...</span>
        </div>
        <p class="mt-3 text-muted">Loading transactions...</p>
      </div>

      <!-- Error State -->
      <div *ngIf="error && !loading" class="alert alert-danger">
        <i class="bi bi-exclamation-triangle me-2"></i>
        {{ error }}
        <button
          class="btn btn-outline-danger btn-sm ms-2"
          (click)="loadTransactions()"
        >
          <i class="bi bi-arrow-clockwise me-1"></i>Retry
        </button>
      </div>

      <!-- Success Message -->
      <div
        *ngIf="successMessage"
        class="alert alert-success alert-dismissible fade show"
      >
        <i class="bi bi-check-circle me-2"></i>
        {{ successMessage }}
        <button
          type="button"
          class="btn-close"
          (click)="successMessage = ''"
        ></button>
      </div>

      <!-- Transactions Table -->
      <div *ngIf="!loading && !error" class="card border-0 shadow-sm">
        <div
          class="card-header bg-white d-flex justify-content-between align-items-center"
        >
          <h6 class="card-title mb-0">
            Transactions
            <span class="badge bg-primary ms-2">{{
              pagedResponse?.totalElements || 0
            }}</span>
          </h6>
          <div class="d-flex align-items-center gap-2">
            <small class="text-muted">Sort by:</small>
            <select
              class="form-select form-select-sm"
              style="width: auto;"
              [(ngModel)]="filter.sortBy"
              (change)="applyFilters()"
            >
              <option value="operationDate">Date</option>
              <option value="amount">Amount</option>
              <option value="type">Type</option>
            </select>
            <button
              class="btn btn-outline-secondary btn-sm"
              (click)="toggleSortDirection()"
            >
              <i
                class="bi"
                [class.bi-sort-down]="filter.sortDirection === 'desc'"
                [class.bi-sort-up]="filter.sortDirection === 'asc'"
              ></i>
            </button>
          </div>
        </div>
        <div class="card-body p-0">
          <div class="table-responsive">
            <table class="table table-hover mb-0">
              <thead class="table-light">
                <tr>
                  <th>Date & Time</th>
                  <th>Type</th>
                  <th>Description</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let transaction of transactions">
                  <td>
                    <div class="fw-semibold">
                      {{ transaction.operationDate | date : 'shortDate' }}
                    </div>
                    <small class="text-muted">{{
                      transaction.operationDate | date : 'shortTime'
                    }}</small>
                  </td>
                  <td>
                    <span
                      class="badge"
                      [class]="getTransactionTypeBadge(transaction.type)"
                    >
                      <i
                        class="bi"
                        [class]="getTransactionTypeIcon(transaction.type)"
                      ></i>
                      {{ transaction.type }}
                    </span>
                  </td>
                  <td>
                    <div class="fw-semibold">
                      {{
                        transaction.description ||
                          getTransactionDescription(transaction.type)
                      }}
                    </div>
                    <small class="text-muted" *ngIf="transaction.accountId">
                      Account: ****{{
                        getAccountIdSuffix(transaction.accountId)
                      }}
                    </small>
                  </td>
                  <td>
                    <span
                      class="fw-bold"
                      [class]="getAmountClass(transaction.type)"
                    >
                      {{ getAmountPrefix(transaction.type)
                      }}{{ transaction.amount | currency }}
                    </span>
                  </td>
                  <td>
                    <span
                      class="badge"
                      [class]="getTransactionStatusBadge(transaction.status)"
                    >
                      {{ transaction.status }}
                    </span>
                  </td>
                  <td>
                    <button
                      class="btn btn-outline-primary btn-sm"
                      (click)="viewTransactionDetails(transaction)"
                    >
                      <i class="bi bi-eye"></i>
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Empty State -->
          <div
            *ngIf="
              !loading && !error && transactions && transactions.length === 0
            "
            class="text-center py-5"
          >
            <i class="bi bi-inbox display-1 text-muted mb-3"></i>
            <h5>No Transactions Found</h5>
            <p class="text-muted mb-4">
              No transactions match your current filters.
            </p>
            <button class="btn btn-outline-primary" (click)="clearFilters()">
              <i class="bi bi-funnel me-2"></i>Clear Filters
            </button>
          </div>
        </div>

        <!-- Enhanced Pagination -->
        <div
          *ngIf="pagedResponse && pagedResponse.totalPages > 1"
          class="card-footer bg-white"
        >
          <div class="row align-items-center">
            <!-- Pagination Info -->
            <div class="col-md-6 mb-2 mb-md-0">
              <div class="pagination-info">
                <small class="text-muted">
                  Showing {{ getStartRecord() }} to {{ getEndRecord() }} of
                  {{ pagedResponse.totalElements }} transactions
                </small>
              </div>
            </div>

            <!-- Pagination Controls -->
            <div class="col-md-6">
              <nav aria-label="Transaction pagination">
                <ul
                  class="pagination pagination-sm justify-content-md-end justify-content-center mb-0"
                >
                  <!-- First Page -->
                  <li class="page-item" [class.disabled]="pagedResponse.first">
                    <button
                      class="page-link"
                      (click)="goToPage(0)"
                      [disabled]="pagedResponse.first"
                      title="First page"
                    >
                      <i class="bi bi-chevron-double-left"></i>
                    </button>
                  </li>

                  <!-- Previous Page -->
                  <li class="page-item" [class.disabled]="pagedResponse.first">
                    <button
                      class="page-link"
                      (click)="goToPage(pagedResponse.number - 1)"
                      [disabled]="pagedResponse.first"
                      title="Previous page"
                    >
                      <i class="bi bi-chevron-left"></i>
                    </button>
                  </li>

                  <!-- Page Numbers -->
                  <li
                    *ngFor="let page of getVisiblePages()"
                    class="page-item"
                    [class.active]="page === pagedResponse.number + 1"
                  >
                    <button
                      *ngIf="page !== '...'; else ellipsis"
                      class="page-link"
                      (click)="goToPage(+page - 1)"
                      [disabled]="page === pagedResponse.number + 1"
                    >
                      {{ page }}
                    </button>
                    <ng-template #ellipsis>
                      <span class="page-link">...</span>
                    </ng-template>
                  </li>

                  <!-- Next Page -->
                  <li class="page-item" [class.disabled]="pagedResponse.last">
                    <button
                      class="page-link"
                      (click)="goToPage(pagedResponse.number + 1)"
                      [disabled]="pagedResponse.last"
                      title="Next page"
                    >
                      <i class="bi bi-chevron-right"></i>
                    </button>
                  </li>

                  <!-- Last Page -->
                  <li class="page-item" [class.disabled]="pagedResponse.last">
                    <button
                      class="page-link"
                      (click)="goToPage(pagedResponse.totalPages - 1)"
                      [disabled]="pagedResponse.last"
                      title="Last page"
                    >
                      <i class="bi bi-chevron-double-right"></i>
                    </button>
                  </li>
                </ul>
              </nav>
            </div>
          </div>

          <!-- Page Size Selector -->
          <div class="row mt-3">
            <div class="col-md-6">
              <div class="d-flex align-items-center">
                <label class="form-label me-2 mb-0">Items per page:</label>
                <select
                  class="form-select form-select-sm"
                  style="width: auto;"
                  [(ngModel)]="filter.size"
                  (change)="changePageSize()"
                >
                  <option value="10">10</option>
                  <option value="20">20</option>
                  <option value="50">50</option>
                  <option value="100">100</option>
                </select>
              </div>
            </div>

            <!-- Quick Jump -->
            <div class="col-md-6">
              <div class="d-flex align-items-center justify-content-md-end">
                <label class="form-label me-2 mb-0">Go to page:</label>
                <div class="input-group" style="width: 120px;">
                  <input
                    type="number"
                    class="form-control form-control-sm"
                    [value]="pagedResponse.number + 1"
                    (keyup.enter)="jumpToPage($event)"
                    [min]="1"
                    [max]="pagedResponse.totalPages"
                    placeholder="Page"
                  />
                  <button
                    class="btn btn-outline-secondary btn-sm"
                    type="button"
                    (click)="jumpToPage($event)"
                    title="Go to page"
                  >
                    <i class="bi bi-arrow-right"></i>
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
      .customer-transactions {
        padding: 1.5rem;
      }

      .table th {
        border-top: none;
        font-weight: 600;
        color: #495057;
      }

      .table td {
        vertical-align: middle;
      }

      .badge {
        font-size: 0.75rem;
      }

      @media (max-width: 768px) {
        .customer-transactions {
          padding: 1rem;
        }

        .table-responsive {
          font-size: 0.875rem;
        }
      }
    `,
  ],
})
export class CustomerTransactionsComponent implements OnInit {
  transactions: Transaction[] = [];
  pagedResponse: PagedResponse<Transaction> | null = null;
  loading = true;
  error: string | null = null;
  successMessage = '';

  filter: TransactionFilter = {
    page: 0,
    size: 20,
    sortBy: 'operationDate',
    sortDirection: 'desc' as 'desc',
  };

  constructor(
    private accountService: AccountService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.loadTransactions();
  }

  loadTransactions(): void {
    this.loading = true;
    this.error = null;

    console.log(
      '=== CustomerTransactionsComponent.loadTransactions() START ==='
    );
    console.log('Filter:', this.filter);
    console.log('Current user:', this.authService.getCurrentUser());
    console.log('Token available:', !!this.authService.getToken());
    console.log(
      'Token preview:',
      this.authService.getToken()?.substring(0, 20) + '...'
    );

    // Try the customer-specific method first, then fallback to general method
    this.accountService.getCustomerTransactions(this.filter).subscribe({
      next: (response) => {
        console.log('✅ CustomerTransactions SUCCESS:', response);
        console.log('Response type:', typeof response);
        console.log('Response content:', response.content);
        console.log('Content length:', response.content?.length);
        console.log('Total elements:', response.totalElements);

        this.pagedResponse = response;
        this.transactions = response.content || []; // Ensure it's always an array
        this.loading = false;

        console.log('Final transactions array:', this.transactions);
        console.log('Final transactions length:', this.transactions.length);
        console.log(
          '=== CustomerTransactionsComponent.loadTransactions() SUCCESS END ==='
        );
      },
      error: (error) => {
        console.error('❌ CustomerTransactions FAILED:', error);
        console.error('Error status:', error.status);
        console.error('Error message:', error.message);
        console.error('Error URL:', error.url);
        console.log('🔄 Trying general transactions method as fallback...');

        // Fallback to the general getTransactions method
        this.accountService.getTransactions(this.filter).subscribe({
          next: (response) => {
            console.log('✅ General Transactions SUCCESS:', response);
            console.log('Fallback response content:', response.content);
            console.log('Fallback content length:', response.content?.length);

            this.pagedResponse = response;
            this.transactions = response.content || [];
            this.loading = false;

            console.log('Final transactions from fallback:', this.transactions);
            console.log(
              '=== CustomerTransactionsComponent.loadTransactions() FALLBACK SUCCESS END ==='
            );
          },
          error: (generalError) => {
            console.error('❌ ALL TRANSACTION METHODS FAILED:');
            console.error('Customer method error:', error);
            console.error('General method error:', generalError);

            // Load demo data as last resort
            console.log('🎭 Loading demo data as final fallback...');
            this.loadDemoTransactions();
          },
        });
      },
    });
  }

  applyFilters(): void {
    this.filter.page = 0; // Reset to first page when applying filters
    this.loadTransactions();
  }

  clearFilters(): void {
    this.filter = {
      page: 0,
      size: 20,
      sortBy: 'operationDate',
      sortDirection: 'desc' as 'desc',
    };
    this.loadTransactions();
  }

  toggleSortDirection(): void {
    this.filter.sortDirection =
      this.filter.sortDirection === 'asc' ? 'desc' : 'asc';
    this.applyFilters();
  }

  goToPage(page: number): void {
    if (page >= 0 && page < (this.pagedResponse?.totalPages || 0)) {
      this.filter.page = page;
      this.loadTransactions();
    }
  }

  getStartRecord(): number {
    if (!this.pagedResponse) return 0;
    return this.pagedResponse.number * this.pagedResponse.size + 1;
  }

  getEndRecord(): number {
    if (!this.pagedResponse) return 0;
    const start = this.getStartRecord();
    const remaining = this.pagedResponse.totalElements - (start - 1);
    return start - 1 + Math.min(this.pagedResponse.size, remaining);
  }

  getVisiblePages(): (number | string)[] {
    if (!this.pagedResponse) return [];

    const totalPages = this.pagedResponse.totalPages;
    const currentPage = this.pagedResponse.number + 1; // Convert to 1-based
    const visiblePages: (number | string)[] = [];

    if (totalPages <= 7) {
      // Show all pages if 7 or fewer
      for (let i = 1; i <= totalPages; i++) {
        visiblePages.push(i);
      }
    } else {
      // Always show first page
      visiblePages.push(1);

      if (currentPage > 4) {
        visiblePages.push('...');
      }

      // Show pages around current page
      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);

      for (let i = start; i <= end; i++) {
        visiblePages.push(i);
      }

      if (currentPage < totalPages - 3) {
        visiblePages.push('...');
      }

      // Always show last page
      if (totalPages > 1) {
        visiblePages.push(totalPages);
      }
    }

    return visiblePages;
  }

  changePageSize(): void {
    this.filter.page = 0; // Reset to first page when changing page size
    this.loadTransactions();
  }

  jumpToPage(event: any): void {
    const target = event.target || event.currentTarget;
    const pageNumber = parseInt(
      target.value || target.previousElementSibling?.value,
      10
    );

    if (
      pageNumber &&
      pageNumber >= 1 &&
      pageNumber <= (this.pagedResponse?.totalPages || 0)
    ) {
      this.goToPage(pageNumber - 1); // Convert to 0-based
    }
  }

  exportTransactions(): void {
    // Placeholder for export functionality
    this.successMessage = 'Export functionality will be implemented soon.';
    setTimeout(() => {
      this.successMessage = '';
    }, 3000);
  }

  viewTransactionDetails(transaction: Transaction): void {
    // Placeholder for transaction details modal
    alert(
      `Transaction Details:\n\nID: ${transaction.id}\nType: ${transaction.type}\nAmount: ${transaction.amount}\nDate: ${transaction.operationDate}\nStatus: ${transaction.status}`
    );
  }

  getTransactionTypeBadge(type: string): string {
    const badges = {
      DEPOSIT: 'bg-success',
      WITHDRAWAL: 'bg-warning',
      TRANSFER: 'bg-primary',
    };
    return badges[type as keyof typeof badges] || 'bg-secondary';
  }

  getTransactionTypeIcon(type: string): string {
    const icons = {
      DEPOSIT: 'bi-arrow-down-circle',
      WITHDRAWAL: 'bi-arrow-up-circle',
      TRANSFER: 'bi-arrow-left-right',
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

  getAccountIdSuffix(accountId: string | number): string {
    const accountIdStr = accountId.toString();
    return accountIdStr.length >= 4 ? accountIdStr.slice(-4) : accountIdStr;
  }

  private loadDemoTransactions(): void {
    console.log('Loading demo transaction data...');

    // Create demo transactions
    const demoTransactions: Transaction[] = [
      {
        id: 1,
        accountId: 'demo-account-1',
        type: TransactionType.DEPOSIT,
        amount: 1000,
        balance: 5000,
        description: 'Initial Deposit',
        status: TransactionStatus.COMPLETED,
        operationDate: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
      },
      {
        id: 2,
        accountId: 'demo-account-1',
        type: TransactionType.WITHDRAWAL,
        amount: 200,
        balance: 4800,
        description: 'ATM Withdrawal',
        status: TransactionStatus.COMPLETED,
        operationDate: new Date(Date.now() - 172800000).toISOString(), // 2 days ago
      },
      {
        id: 3,
        accountId: 'demo-account-1',
        type: TransactionType.TRANSFER,
        amount: 500,
        balance: 4300,
        description: 'Transfer to Savings',
        status: TransactionStatus.COMPLETED,
        operationDate: new Date(Date.now() - 259200000).toISOString(), // 3 days ago
      },
      {
        id: 4,
        accountId: 'demo-account-1',
        type: TransactionType.DEPOSIT,
        amount: 2000,
        balance: 6300,
        description: 'Salary Deposit',
        status: TransactionStatus.COMPLETED,
        operationDate: new Date(Date.now() - 604800000).toISOString(), // 1 week ago
      },
    ];

    // Create demo paged response
    this.pagedResponse = {
      content: demoTransactions,
      totalElements: demoTransactions.length,
      totalPages: 1,
      size: 20,
      number: 0,
      first: true,
      last: true,
    };

    this.transactions = demoTransactions;
    this.error = 'Showing demo data - API endpoints not available';
    this.loading = false;

    console.log('Demo transaction data loaded:', this.transactions);
  }
}
