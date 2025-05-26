import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import {
  AdminAccountService,
  BankAccount,
} from '../../services/account.service';

@Component({
  selector: 'app-admin-account-details',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="container-fluid py-4">
      <div class="row">
        <div class="col-12">
          <!-- Header -->
          <div class="d-flex justify-content-between align-items-center mb-4">
            <div>
              <h1 class="h3 mb-0">Account Details</h1>
              <p class="text-muted mb-0">View and manage account information</p>
            </div>
            <div class="d-flex gap-2">
              <button
                class="btn btn-outline-secondary"
                routerLink="/admin/accounts"
              >
                <i class="bi bi-arrow-left me-2"></i>Back to Accounts
              </button>
              @if (account) {
              <button class="btn btn-primary" (click)="editAccount()">
                <i class="bi bi-pencil me-2"></i>Edit Account
              </button>
              <div class="dropdown">
                <button
                  class="btn btn-outline-secondary dropdown-toggle"
                  type="button"
                  (click)="toggleDropdown()"
                  title="Change Status"
                  #dropdownButton
                >
                  <i class="bi bi-gear me-2"></i>Actions
                </button>
                <ul
                  class="dropdown-menu"
                  [class.show]="dropdownOpen"
                  #dropdownMenu
                >
                  <li>
                    <button
                      class="dropdown-item"
                      (click)="
                        updateAccountStatus('ACTIVATED'); dropdownOpen = false
                      "
                      [disabled]="account.status === 'ACTIVATED'"
                    >
                      <i class="bi bi-check-circle text-success me-2"></i>
                      Activate
                    </button>
                  </li>
                  <li>
                    <button
                      class="dropdown-item"
                      (click)="
                        updateAccountStatus('SUSPENDED'); dropdownOpen = false
                      "
                      [disabled]="account.status === 'SUSPENDED'"
                    >
                      <i class="bi bi-pause-circle text-warning me-2"></i>
                      Suspend
                    </button>
                  </li>
                  <li>
                    <button
                      class="dropdown-item"
                      (click)="closeAccount(); dropdownOpen = false"
                      [disabled]="account.status === 'CLOSED'"
                    >
                      <i class="bi bi-x-circle text-danger me-2"></i>
                      Close Account
                    </button>
                  </li>
                  <li><hr class="dropdown-divider" /></li>
                  <li>
                    <button
                      class="dropdown-item text-danger"
                      (click)="deleteAccount(); dropdownOpen = false"
                      [disabled]="account.status !== 'CLOSED'"
                    >
                      <i class="bi bi-trash me-2"></i>
                      Delete Account
                    </button>
                  </li>
                </ul>
              </div>
              }
            </div>
          </div>

          <!-- Error Alert -->
          @if (error) {
          <div
            class="alert alert-danger alert-dismissible fade show"
            role="alert"
          >
            {{ error }}
            <button
              type="button"
              class="btn-close"
              (click)="error = null"
            ></button>
          </div>
          }

          <!-- Loading Spinner -->
          @if (loading) {
          <div class="text-center py-5">
            <div class="spinner-border text-primary" role="status">
              <span class="visually-hidden">Loading...</span>
            </div>
            <p class="mt-3 text-muted">Loading account details...</p>
          </div>
          }

          <!-- Account Details -->
          @if (account && !loading) {
          <div class="row">
            <!-- Account Information Card -->
            <div class="col-lg-8 mb-4">
              <div class="card border-0 shadow-sm">
                <div class="card-header bg-white">
                  <h5 class="card-title mb-0">Account Information</h5>
                </div>
                <div class="card-body">
                  <div class="row">
                    <div class="col-md-6 mb-3">
                      <label class="form-label text-muted">Account ID</label>
                      <p class="fw-semibold font-monospace">{{ account.id }}</p>
                    </div>
                    <div class="col-md-6 mb-3">
                      <label class="form-label text-muted">Account Type</label>
                      <span
                        class="badge"
                        [class]="getAccountTypeBadge(account.type)"
                      >
                        {{ account.type }}
                      </span>
                    </div>
                    <div class="col-md-6 mb-3">
                      <label class="form-label text-muted"
                        >Current Balance</label
                      >
                      <p
                        class="fw-bold fs-4"
                        [class]="
                          account.balance >= 0 ? 'text-success' : 'text-danger'
                        "
                      >
                        {{ account.balance | currency : 'USD' : 'symbol' }}
                      </p>
                    </div>
                    <div class="col-md-6 mb-3">
                      <label class="form-label text-muted">Status</label>
                      <span
                        class="badge"
                        [class]="getStatusBadgeClass(account.status)"
                      >
                        {{ account.status }}
                      </span>
                    </div>
                    <div class="col-md-6 mb-3">
                      <label class="form-label text-muted">Created Date</label>
                      <p class="fw-semibold">
                        {{ account.createDate | date : 'medium' }}
                      </p>
                    </div>
                    @if (account.customerDTO) {
                    <div class="col-md-6 mb-3">
                      <label class="form-label text-muted"
                        >Account Holder</label
                      >
                      <div>
                        <strong>{{ account.customerDTO.name }}</strong>
                        <br />
                        <small class="text-muted">{{
                          account.customerDTO.email
                        }}</small>
                      </div>
                    </div>
                    }
                  </div>
                </div>
              </div>
            </div>

            <!-- Quick Actions Card -->
            <div class="col-lg-4 mb-4">
              <div class="card border-0 shadow-sm">
                <div class="card-header bg-white">
                  <h5 class="card-title mb-0">Quick Actions</h5>
                </div>
                <div class="card-body">
                  <div class="d-grid gap-2">
                    <button
                      class="btn btn-success btn-sm"
                      routerLink="/admin/transactions"
                      [queryParams]="{
                        operation: 'credit',
                        accountId: account.id
                      }"
                    >
                      <i class="bi bi-plus-circle me-2"></i>Add Money
                    </button>
                    <button
                      class="btn btn-warning btn-sm"
                      routerLink="/admin/transactions"
                      [queryParams]="{
                        operation: 'debit',
                        accountId: account.id
                      }"
                    >
                      <i class="bi bi-dash-circle me-2"></i>Debit
                    </button>
                    <button
                      class="btn btn-info btn-sm"
                      routerLink="/admin/transfer"
                      [queryParams]="{ fromAccountId: account.id }"
                    >
                      <i class="bi bi-arrow-left-right me-2"></i>Transfer
                    </button>
                    <hr />
                    <button
                      class="btn btn-outline-primary btn-sm"
                      routerLink="/admin/transactions"
                      [queryParams]="{ accountId: account.id }"
                    >
                      <i class="bi bi-clock-history me-2"></i>Transaction
                      History
                    </button>
                    @if (account.customerDTO) {
                    <button
                      class="btn btn-outline-secondary btn-sm"
                      [routerLink]="[
                        '/admin/customers',
                        account.customerDTO.id
                      ]"
                    >
                      <i class="bi bi-person me-2"></i>View Customer
                    </button>
                    }
                  </div>
                </div>
              </div>
            </div>
          </div>
          }
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

      .form-label {
        font-weight: 500;
        font-size: 0.875rem;
        margin-bottom: 0.25rem;
      }

      .btn {
        border-radius: 0.375rem;
      }

      .badge {
        font-size: 0.75rem;
      }

      .font-monospace {
        font-family: 'Courier New', monospace;
      }
    `,
  ],
})
export class AdminAccountDetailsComponent implements OnInit {
  account: BankAccount | null = null;
  loading = false;
  error: string | null = null;
  accountId: string | null = null;
  dropdownOpen = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private accountService: AdminAccountService
  ) {}

  ngOnInit(): void {
    this.loadAccountDetails();
  }

  private loadAccountDetails(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      this.error = 'Invalid account ID';
      return;
    }

    this.accountId = id;
    this.loading = true;

    this.accountService.getAccountById(this.accountId).subscribe({
      next: (account) => {
        this.account = account;
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Failed to load account details';
        console.error('Error loading account:', err);
        this.loading = false;
      },
    });
  }

  editAccount(): void {
    if (this.account) {
      this.router.navigate(['/admin/accounts', this.account.id, 'edit']);
    }
  }

  toggleDropdown(): void {
    this.dropdownOpen = !this.dropdownOpen;
  }

  updateAccountStatus(status: string): void {
    if (!this.account || !this.accountId) return;

    if (confirm(`Change account status to ${status}?`)) {
      this.accountService
        .updateAccountStatus(this.accountId, status)
        .subscribe({
          next: (updatedAccount) => {
            if (this.account) {
              this.account.status = updatedAccount.status;
            }
          },
          error: (err) => {
            console.error('Error updating account status:', err);
            console.error('Error details:', {
              status: err.status,
              statusText: err.statusText,
              url: err.url,
              error: err.error,
            });

            // Log validation errors specifically
            if (err.error && err.error.errors) {
              console.error('Validation errors:', err.error.errors);
            }

            let errorMessage =
              'Failed to update account status. Please try again.';

            if (err.status === 0) {
              errorMessage =
                'Connection error. The backend server may not be running or there may be a CORS issue. Please check the server status.';
            } else if (err.status === 400) {
              if (err.error && err.error.errors) {
                // Format validation errors
                const validationErrors = err.error.errors;
                let errorMessages: string[] = [];

                Object.keys(validationErrors).forEach((field) => {
                  const fieldErrors = validationErrors[field];
                  if (Array.isArray(fieldErrors)) {
                    fieldErrors.forEach((error) => {
                      errorMessages.push(
                        `• ${this.formatFieldName(field)}: ${error}`
                      );
                    });
                  } else {
                    errorMessages.push(
                      `• ${this.formatFieldName(field)}: ${fieldErrors}`
                    );
                  }
                });

                if (errorMessages.length > 0) {
                  errorMessage = `Validation errors:\n${errorMessages.join(
                    '\n'
                  )}`;
                } else {
                  errorMessage =
                    err.error.message ||
                    'Invalid request. Please check the account data.';
                }
              } else if (err.error && err.error.message) {
                errorMessage = `Bad request: ${err.error.message}`;
              } else {
                errorMessage =
                  'Invalid request. Please check the account data.';
              }
            } else if (err.status === 403) {
              errorMessage =
                'You do not have permission to update account status.';
            } else if (err.status === 404) {
              errorMessage = 'Account not found or endpoint not available.';
            } else if (err.status === 500) {
              errorMessage = 'Server error. Please try again later.';
            }

            // Check for enhanced error message from service
            if (err.userMessage) {
              errorMessage = err.userMessage;
            }

            alert(errorMessage);
          },
        });
    }
  }

  getAccountTypeBadge(type: string): string {
    switch (type?.toLowerCase()) {
      case 'currentaccount':
        return 'bg-primary';
      case 'savingaccount':
        return 'bg-success';
      default:
        return 'bg-secondary';
    }
  }

  getStatusBadgeClass(status: string): string {
    switch (status?.toUpperCase()) {
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

  closeAccount(): void {
    if (!this.account || !this.accountId) return;

    const confirmMessage = `Are you sure you want to close this account?

Account: ${this.account.id}
Current Balance: ${this.account.balance}

⚠️ Warning: This action will:
• Set the account status to CLOSED
• Prevent all future transactions
• Allow the customer to be deleted

This action can be reversed by reactivating the account.`;

    if (confirm(confirmMessage)) {
      this.updateAccountStatus('CLOSED');
    }
  }

  deleteAccount(): void {
    if (!this.account || !this.accountId) return;

    if (this.account.status !== 'CLOSED') {
      alert(
        'Account must be closed before it can be deleted. Please close the account first.'
      );
      return;
    }

    const confirmMessage = `⚠️ DANGER: Delete Account ${this.account.id}?

This will PERMANENTLY DELETE the account and cannot be undone!

Current Balance: ${this.account.balance}

Are you absolutely sure you want to delete this account?`;

    if (confirm(confirmMessage)) {
      this.accountService.deleteAccount(this.accountId).subscribe({
        next: () => {
          alert('Account deleted successfully');
          this.router.navigate(['/admin/accounts']);
        },
        error: (err: any) => {
          console.error('Error deleting account:', err);
          let errorMessage = 'Failed to delete account. Please try again.';

          if (err.status === 400) {
            errorMessage =
              'Cannot delete account. It may have pending transactions or other dependencies.';
          } else if (err.status === 403) {
            errorMessage = 'You do not have permission to delete this account.';
          }

          alert(errorMessage);
        },
      });
    }
  }

  private formatFieldName(field: string): string {
    // Convert camelCase to readable format
    return field
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, (str) => str.toUpperCase())
      .trim();
  }
}
