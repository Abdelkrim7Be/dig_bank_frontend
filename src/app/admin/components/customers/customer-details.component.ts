import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { AdminCustomerService } from '../../services/customer.service';
import { User } from '../../../auth/models/auth.model';

@Component({
  selector: 'app-admin-customer-details',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="container-fluid mt-4">
      <div class="row">
        <div class="col-12">
          <!-- Header -->
          <div class="d-flex justify-content-between align-items-center mb-4">
            <div>
              <h1 class="h3 mb-0">Customer Details</h1>
              <p class="text-muted mb-0">
                View and manage customer information
              </p>
            </div>
            <div class="d-flex gap-2">
              <button
                class="btn btn-outline-secondary"
                routerLink="/admin/customers"
              >
                <i class="bi bi-arrow-left me-2"></i>Back to Customers
              </button>
              @if (customer) {
              <button
                class="btn btn-primary me-2"
                [routerLink]="['/admin/customers', customer.id, 'edit']"
              >
                <i class="bi bi-pencil me-2"></i>Edit Customer
              </button>
              <button
                class="btn me-2"
                [class]="customer.enabled ? 'btn-warning' : 'btn-success'"
                (click)="toggleCustomerStatus()"
              >
                <i
                  class="bi"
                  [class]="
                    customer.enabled ? 'bi-pause-circle' : 'bi-play-circle'
                  "
                ></i>
                {{ customer.enabled ? ' Suspend' : ' Activate' }}
              </button>
              <button class="btn btn-danger" (click)="deleteCustomer()">
                <i class="bi bi-trash me-2"></i>Delete Customer
              </button>
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
            <p class="mt-3 text-muted">Loading customer details...</p>
          </div>
          }

          <!-- Customer Details -->
          @if (customer && !loading) {
          <div class="row">
            <!-- Customer Information Card -->
            <div class="col-lg-8 mb-4">
              <div class="card border-0 shadow-sm">
                <div class="card-header bg-white">
                  <h5 class="card-title mb-0">Customer Information</h5>
                </div>
                <div class="card-body">
                  <div class="row">
                    <div class="col-md-6 mb-3">
                      <label class="form-label text-muted">Username</label>
                      <p class="fw-semibold">{{ customer.username }}</p>
                    </div>
                    <div class="col-md-6 mb-3">
                      <label class="form-label text-muted">Email</label>
                      <p class="fw-semibold">{{ customer.email }}</p>
                    </div>
                    <div class="col-md-6 mb-3">
                      <label class="form-label text-muted">Full Name</label>
                      <p class="fw-semibold">
                        {{ customer.firstName }} {{ customer.lastName }}
                      </p>
                    </div>
                    <div class="col-md-6 mb-3">
                      <label class="form-label text-muted">Role</label>
                      <span class="badge bg-info">{{ customer.role }}</span>
                    </div>
                    <div class="col-md-6 mb-3">
                      <label class="form-label text-muted">Status</label>
                      <span
                        class="badge"
                        [class]="getStatusBadge(customer.status)"
                      >
                        {{ customer.status }}
                      </span>
                    </div>
                    <div class="col-md-6 mb-3">
                      <label class="form-label text-muted">Created Date</label>
                      <p class="fw-semibold">
                        {{ customer.createdAt | date : 'medium' }}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Quick Stats Card -->
            <div class="col-lg-4 mb-4">
              <div class="card border-0 shadow-sm">
                <div class="card-header bg-white">
                  <h5 class="card-title mb-0">Quick Stats</h5>
                </div>
                <div class="card-body">
                  <div class="mb-3">
                    <div
                      class="d-flex justify-content-between align-items-center"
                    >
                      <span class="text-muted">Total Accounts</span>
                      <span class="badge bg-primary">{{
                        customer.accountCount || 0
                      }}</span>
                    </div>
                  </div>
                  <div class="mb-3">
                    <div
                      class="d-flex justify-content-between align-items-center"
                    >
                      <span class="text-muted">Total Balance</span>
                      <span class="fw-bold text-success">{{
                        customer.totalBalance | currency
                      }}</span>
                    </div>
                  </div>
                  <hr />
                  <div class="d-grid gap-2">
                    <button class="btn btn-outline-primary btn-sm">
                      <i class="bi bi-credit-card me-2"></i>View Accounts
                    </button>
                    <button class="btn btn-outline-info btn-sm">
                      <i class="bi bi-clock-history me-2"></i>Transaction
                      History
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Account Information -->
          <div class="row">
            <div class="col-12">
              <div class="card border-0 shadow-sm">
                <div class="card-header bg-white">
                  <div
                    class="d-flex justify-content-between align-items-center"
                  >
                    <h5 class="card-title mb-0">Bank Accounts</h5>
                    <button class="btn btn-primary btn-sm">
                      <i class="bi bi-plus-circle me-2"></i>Add Account
                    </button>
                  </div>
                </div>
                <div class="card-body">
                  @if (accounts && accounts.length > 0) {
                  <div class="table-responsive">
                    <table class="table table-hover">
                      <thead class="table-light">
                        <tr>
                          <th>Account ID</th>
                          <th>Type</th>
                          <th>Balance</th>
                          <th>Status</th>
                          <th>Created</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr *ngFor="let account of accounts">
                          <td class="font-monospace">{{ account.id }}</td>
                          <td>
                            <span
                              class="badge"
                              [class]="getAccountTypeBadge(account.type)"
                              >{{ account.type }}</span
                            >
                          </td>
                          <td class="fw-semibold">
                            {{ account.balance | currency }}
                          </td>
                          <td>
                            <span
                              class="badge"
                              [class]="getAccountStatusBadge(account.status)"
                              >{{ account.status }}</span
                            >
                          </td>
                          <td>{{ account.createdDate | date : 'short' }}</td>
                          <td>
                            <div class="btn-group btn-group-sm">
                              <button
                                class="btn btn-outline-primary"
                                title="View Details"
                              >
                                <i class="bi bi-eye"></i>
                              </button>
                              <button
                                class="btn btn-outline-secondary"
                                title="Edit"
                              >
                                <i class="bi bi-pencil"></i>
                              </button>
                            </div>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                  } @else {
                  <div class="text-center py-4">
                    <i
                      class="bi bi-credit-card text-muted"
                      style="font-size: 3rem;"
                    ></i>
                    <p class="text-muted mt-3">
                      No bank accounts found for this customer.
                    </p>
                    <button class="btn btn-primary">
                      <i class="bi bi-plus-circle me-2"></i>Create First Account
                    </button>
                  </div>
                  }
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
    `,
  ],
})
export class AdminCustomerDetailsComponent implements OnInit {
  customer: User | null = null;
  accounts: any[] = [];
  loading = false;
  error: string | null = null;
  customerId: number | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private customerService: AdminCustomerService
  ) {}

  ngOnInit(): void {
    this.loadCustomerDetails();
  }

  private loadCustomerDetails(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      this.error = 'Invalid customer ID';
      return;
    }

    this.customerId = parseInt(id, 10);
    this.loading = true;

    this.customerService.getCustomerById(this.customerId).subscribe({
      next: (customer) => {
        this.customer = {
          ...customer,
          accountCount: 0,
          totalBalance: 0,
        };
        this.loadCustomerAccounts();
      },
      error: (err) => {
        this.error = 'Failed to load customer details';
        console.error('Error loading customer:', err);
        this.loading = false;
      },
    });
  }

  private loadCustomerAccounts(): void {
    if (!this.customerId) return;

    this.customerService.getCustomerAccounts(this.customerId).subscribe({
      next: (accounts) => {
        this.accounts = accounts;
        if (this.customer) {
          this.customer.accountCount = accounts.length;
          this.customer.totalBalance = accounts.reduce(
            (sum, account) => sum + (account.balance || 0),
            0
          );
        }
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading customer accounts:', err);
        this.accounts = [];
        this.loading = false;
      },
    });
  }

  deleteCustomer(): void {
    if (!this.customer || !this.customerId) return;

    const customerName =
      `${this.customer.firstName || ''} ${
        this.customer.lastName || ''
      }`.trim() || this.customer.username;

    if (
      confirm(
        `Are you sure you want to delete customer "${customerName}"? This action cannot be undone.`
      )
    ) {
      this.customerService.deleteCustomer(this.customerId).subscribe({
        next: () => {
          alert('Customer deleted successfully');
          this.router.navigate(['/admin/customers']);
        },
        error: (err) => {
          console.error('Error deleting customer:', err);
          if (err.status === 400) {
            alert(
              'Cannot delete customer with existing accounts. Please close all accounts first.'
            );
          } else {
            alert('Failed to delete customer. Please try again.');
          }
        },
      });
    }
  }

  toggleCustomerStatus(): void {
    if (!this.customer || !this.customerId) return;

    const newEnabled = !this.customer.enabled;
    this.customerService
      .updateCustomerStatus(this.customerId, newEnabled)
      .subscribe({
        next: (updatedCustomer) => {
          if (this.customer) {
            this.customer.enabled = updatedCustomer.enabled;
          }
        },
        error: (err) => {
          console.error('Error updating customer status:', err);
          alert('Failed to update customer status. Please try again.');
        },
      });
  }

  getStatusBadge(status: string): string {
    switch (status?.toUpperCase()) {
      case 'ACTIVE':
        return 'bg-success';
      case 'SUSPENDED':
        return 'bg-warning';
      case 'INACTIVE':
        return 'bg-secondary';
      default:
        return 'bg-secondary';
    }
  }

  getAccountTypeBadge(type: string): string {
    switch (type?.toUpperCase()) {
      case 'CURRENT':
        return 'bg-primary';
      case 'SAVING':
        return 'bg-success';
      default:
        return 'bg-secondary';
    }
  }

  getAccountStatusBadge(status: string): string {
    switch (status?.toUpperCase()) {
      case 'CREATED':
      case 'ACTIVE':
        return 'bg-success';
      case 'SUSPENDED':
        return 'bg-warning';
      case 'CLOSED':
        return 'bg-danger';
      default:
        return 'bg-secondary';
    }
  }
}
