import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { AdminAccountService, BankAccount, AccountSearchParams } from '../../services/account.service';

@Component({
  selector: 'app-admin-account-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="container-fluid py-4">
      <div class="row">
        <div class="col-12">
          <div class="card">
            <div class="card-header d-flex justify-content-between align-items-center">
              <h5 class="mb-0">Account Management</h5>
              <button
                type="button"
                class="btn btn-primary"
                routerLink="/admin/accounts/new"
              >
                <i class="fas fa-plus me-2"></i>Create Account
              </button>
            </div>

            <div class="card-body">
              <!-- Search and Filter Controls -->
              <div class="row mb-4">
                <div class="col-md-4">
                  <div class="input-group">
                    <span class="input-group-text">
                      <i class="fas fa-search"></i>
                    </span>
                    <input
                      type="text"
                      class="form-control"
                      placeholder="Search accounts..."
                      [(ngModel)]="searchTerm"
                      (input)="onSearch()"
                    />
                  </div>
                </div>

                <div class="col-md-3">
                  <select
                    class="form-select"
                    [(ngModel)]="selectedStatus"
                    (change)="onFilterChange()"
                  >
                    <option value="">All Status</option>
                    <option value="CREATED">Created</option>
                    <option value="ACTIVATED">Activated</option>
                    <option value="SUSPENDED">Suspended</option>
                    <option value="CLOSED">Closed</option>
                  </select>
                </div>

                <div class="col-md-3">
                  <select
                    class="form-select"
                    [(ngModel)]="selectedType"
                    (change)="onFilterChange()"
                  >
                    <option value="">All Types</option>
                    <option value="CurrentAccount">Current Account</option>
                    <option value="SavingAccount">Saving Account</option>
                  </select>
                </div>

                <div class="col-md-2">
                  <button
                    type="button"
                    class="btn btn-outline-secondary w-100"
                    (click)="refreshAccounts()"
                  >
                    <i class="fas fa-sync-alt me-2"></i>Refresh
                  </button>
                </div>
              </div>

              <!-- Accounts Table -->
              <div class="table-responsive">
                <table class="table table-hover">
                  <thead class="table-light">
                    <tr>
                      <th>Account ID</th>
                      <th>Customer</th>
                      <th>Type</th>
                      <th>Balance</th>
                      <th>Status</th>
                      <th>Created Date</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    @if (loading) {
                    <tr>
                      <td colspan="7" class="text-center py-4">
                        <div class="spinner-border text-primary" role="status">
                          <span class="visually-hidden">Loading...</span>
                        </div>
                      </td>
                    </tr>
                    } @else if (filteredAccounts.length === 0) {
                    <tr>
                      <td colspan="7" class="text-center py-4 text-muted">
                        No accounts found
                      </td>
                    </tr>
                    } @else {
                    @for (account of paginatedAccounts; track account.id) {
                    <tr>
                      <td>
                        <code class="text-primary">{{ account.id }}</code>
                      </td>
                      <td>
                        @if (account.customerDTO) {
                        <div>
                          <strong>{{ account.customerDTO.name }}</strong>
                          <br />
                          <small class="text-muted">{{
                            account.customerDTO.email
                          }}</small>
                        </div>
                        } @else {
                        <span class="text-muted">N/A</span>
                        }
                      </td>
                      <td>
                        <span
                          class="badge"
                          [class]="
                            account.type === 'CurrentAccount'
                              ? 'bg-info'
                              : 'bg-success'
                          "
                        >
                          {{
                            account.type === 'CurrentAccount'
                              ? 'Current'
                              : 'Saving'
                          }}
                        </span>
                      </td>
                      <td>
                        <strong
                          [class]="
                            account.balance >= 0
                              ? 'text-success'
                              : 'text-danger'
                          "
                        >
                          {{ account.balance | currency : 'USD' : 'symbol' }}
                        </strong>
                      </td>
                      <td>
                        <span
                          class="badge"
                          [class]="getStatusBadgeClass(account.status)"
                        >
                          {{ account.status }}
                        </span>
                      </td>
                      <td>
                        {{ account.createDate | date : 'short' }}
                      </td>
                      <td>
                        <div class="btn-group btn-group-sm">
                          <button
                            type="button"
                            class="btn btn-outline-primary"
                            [routerLink]="['/admin/accounts', account.id]"
                            title="View Details"
                          >
                            <i class="fas fa-eye"></i>
                          </button>
                          <div class="dropdown">
                            <button
                              class="btn btn-outline-secondary dropdown-toggle"
                              type="button"
                              [id]="'statusDropdown' + account.id"
                              data-bs-toggle="dropdown"
                              title="Change Status"
                            >
                              <i class="fas fa-cog"></i>
                            </button>
                            <ul
                              class="dropdown-menu"
                              [attr.aria-labelledby]="'statusDropdown' + account.id"
                            >
                              <li>
                                <button
                                  class="dropdown-item"
                                  (click)="updateAccountStatus(account, 'ACTIVATED')"
                                  [disabled]="account.status === 'ACTIVATED'"
                                >
                                  <i class="fas fa-check-circle text-success me-2"></i>
                                  Activate
                                </button>
                              </li>
                              <li>
                                <button
                                  class="dropdown-item"
                                  (click)="updateAccountStatus(account, 'SUSPENDED')"
                                  [disabled]="account.status === 'SUSPENDED'"
                                >
                                  <i class="fas fa-pause-circle text-warning me-2"></i>
                                  Suspend
                                </button>
                              </li>
                              <li>
                                <button
                                  class="dropdown-item"
                                  (click)="updateAccountStatus(account, 'CLOSED')"
                                  [disabled]="account.status === 'CLOSED'"
                                >
                                  <i class="fas fa-times-circle text-danger me-2"></i>
                                  Close
                                </button>
                              </li>
                            </ul>
                          </div>
                        </div>
                      </td>
                    </tr>
                    }
                    }
                  </tbody>
                </table>
              </div>

              <!-- Pagination -->
              @if (totalPages > 1) {
              <nav aria-label="Accounts pagination">
                <ul class="pagination justify-content-center">
                  <li class="page-item" [class.disabled]="currentPage === 1">
                    <button
                      class="page-link"
                      (click)="goToPage(currentPage - 1)"
                      [disabled]="currentPage === 1"
                    >
                      Previous
                    </button>
                  </li>

                  @for (page of getVisiblePages(); track page) {
                  <li
                    class="page-item"
                    [class.active]="page === currentPage"
                  >
                    <button class="page-link" (click)="goToPage(page)">
                      {{ page }}
                    </button>
                  </li>
                  }

                  <li
                    class="page-item"
                    [class.disabled]="currentPage === totalPages"
                  >
                    <button
                      class="page-link"
                      (click)="goToPage(currentPage + 1)"
                      [disabled]="currentPage === totalPages"
                    >
                      Next
                    </button>
                  </li>
                </ul>
              </nav>
              }

              <!-- Summary -->
              <div class="row mt-4">
                <div class="col-md-6">
                  <small class="text-muted">
                    Showing {{ (currentPage - 1) * pageSize + 1 }} to
                    {{ Math.min(currentPage * pageSize, totalElements) }} of
                    {{ totalElements }} accounts
                  </small>
                </div>
                <div class="col-md-6 text-end">
                  <button
                    type="button"
                    class="btn btn-outline-success btn-sm"
                    (click)="exportAccounts()"
                  >
                    <i class="fas fa-download me-2"></i>Export CSV
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
      .card {
        border: none;
        box-shadow: 0 0.125rem 0.25rem rgba(0, 0, 0, 0.075);
      }

      .table th {
        border-top: none;
        font-weight: 600;
        color: #495057;
      }

      .badge {
        font-size: 0.75rem;
      }

      .btn-group-sm .btn {
        padding: 0.25rem 0.5rem;
      }

      code {
        font-size: 0.875rem;
      }
    `,
  ],
})
export class AdminAccountListComponent implements OnInit {
  accounts: BankAccount[] = [];
  filteredAccounts: BankAccount[] = [];
  paginatedAccounts: BankAccount[] = [];
  loading = false;

  // Search and filter
  searchTerm = '';
  selectedStatus = '';
  selectedType = '';

  // Pagination
  currentPage = 1;
  pageSize = 10;
  totalPages = 0;
  totalElements = 0;

  // Expose Math to template
  Math = Math;

  constructor(private accountService: AdminAccountService) {}

  ngOnInit(): void {
    this.loadAccounts();
  }

  loadAccounts(): void {
    this.loading = true;
    const params: AccountSearchParams = {
      page: this.currentPage - 1,
      size: this.pageSize,
      search: this.searchTerm || undefined,
      status: this.selectedStatus || undefined,
    };

    this.accountService.getAccounts(params).subscribe({
      next: (response) => {
        this.accounts = response.content;
        this.filteredAccounts = this.accounts;
        this.paginatedAccounts = this.accounts;
        this.totalElements = response.totalElements;
        this.totalPages = response.totalPages;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading accounts:', err);
        this.loading = false;
      },
    });
  }

  onSearch(): void {
    this.currentPage = 1;
    this.loadAccounts();
  }

  onFilterChange(): void {
    this.currentPage = 1;
    this.loadAccounts();
  }

  updateAccountStatus(account: BankAccount, status: string): void {
    if (confirm(`Change account status to ${status}?`)) {
      this.accountService.updateAccountStatus(account.id, status).subscribe({
        next: (updatedAccount) => {
          account.status = updatedAccount.status;
        },
        error: (err) => {
          console.error('Error updating account status:', err);
        },
      });
    }
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.loadAccounts();
    }
  }

  getVisiblePages(): number[] {
    const pages: number[] = [];
    const start = Math.max(1, this.currentPage - 2);
    const end = Math.min(this.totalPages, this.currentPage + 2);

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    return pages;
  }

  getStatusBadgeClass(status: string): string {
    switch (status) {
      case 'ACTIVATED':
        return 'bg-success';
      case 'SUSPENDED':
        return 'bg-warning';
      case 'CLOSED':
        return 'bg-danger';
      case 'CREATED':
        return 'bg-secondary';
      default:
        return 'bg-secondary';
    }
  }

  refreshAccounts(): void {
    this.loadAccounts();
  }

  exportAccounts(): void {
    const params: AccountSearchParams = {
      search: this.searchTerm || undefined,
      status: this.selectedStatus || undefined,
    };

    this.accountService.exportAccounts(params).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'accounts.csv';
        link.click();
        window.URL.revokeObjectURL(url);
      },
      error: (err) => {
        console.error('Error exporting accounts:', err);
      },
    });
  }
}
