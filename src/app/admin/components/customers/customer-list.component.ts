import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AdminCustomerService } from '../../services/customer.service';
import { User, UserStatus } from '../../../auth/models/auth.model';

@Component({
  selector: 'app-customer-list',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  template: `
    <div class="customer-list">
      <!-- Header -->
      <div class="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h1 class="h3 mb-0">Customer Management</h1>
          <p class="text-muted mb-0">
            Manage customer accounts and information
          </p>
        </div>
        <div class="d-flex gap-2">
          <button class="btn btn-outline-primary" (click)="exportCustomers()">
            <i class="bi bi-download me-2"></i>Export
          </button>
          <button class="btn btn-primary" routerLink="/admin/customers/new">
            <i class="bi bi-person-plus me-2"></i>Add Customer
          </button>
        </div>
      </div>

      <!-- Filters and Search -->
      <div class="card border-0 shadow-sm mb-4">
        <div class="card-body">
          <div class="row g-3">
            <div class="col-md-4">
              <label class="form-label">Search</label>
              <div class="input-group">
                <span class="input-group-text">
                  <i class="bi bi-search"></i>
                </span>
                <input
                  type="text"
                  class="form-control"
                  placeholder="Search customers..."
                  [(ngModel)]="searchTerm"
                  (input)="filterCustomers()"
                />
              </div>
            </div>
            <div class="col-md-3">
              <label class="form-label">Status</label>
              <select
                class="form-select"
                [(ngModel)]="selectedStatus"
                (change)="filterCustomers()"
              >
                <option value="">All Statuses</option>
                <option value="ACTIVE">Active</option>
                <option value="INACTIVE">Inactive</option>
                <option value="SUSPENDED">Suspended</option>
              </select>
            </div>
            <div class="col-md-3">
              <label class="form-label">Sort By</label>
              <select
                class="form-select"
                [(ngModel)]="sortBy"
                (change)="sortCustomers()"
              >
                <option value="firstName">First Name</option>
                <option value="lastName">Last Name</option>
                <option value="email">Email</option>
                <option value="createdAt">Date Created</option>
              </select>
            </div>
            <div class="col-md-2">
              <label class="form-label">Order</label>
              <select
                class="form-select"
                [(ngModel)]="sortOrder"
                (change)="sortCustomers()"
              >
                <option value="asc">Ascending</option>
                <option value="desc">Descending</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <!-- Customer Table -->
      <div class="card border-0 shadow-sm">
        <div class="card-header bg-white">
          <div class="d-flex justify-content-between align-items-center">
            <h5 class="card-title mb-0">
              Customers ({{ filteredCustomers.length }} of
              {{ customers.length }})
            </h5>
            <div class="d-flex gap-2">
              <button
                class="btn btn-sm btn-outline-secondary"
                (click)="refreshCustomers()"
              >
                <i class="bi bi-arrow-clockwise me-1"></i>Refresh
              </button>
            </div>
          </div>
        </div>
        <div class="card-body p-0">
          <div class="table-responsive">
            <table class="table table-hover mb-0">
              <thead class="table-light">
                <tr>
                  <th>
                    <input
                      type="checkbox"
                      class="form-check-input"
                      [checked]="allSelected"
                      (change)="toggleSelectAll()"
                    />
                  </th>
                  <th>Customer</th>
                  <th>Email</th>
                  <th>Status</th>
                  <th>Accounts</th>
                  <th>Total Balance</th>
                  <th>Created</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr
                  *ngFor="
                    let customer of paginatedCustomers;
                    trackBy: trackByCustomerId
                  "
                >
                  <td>
                    <input
                      type="checkbox"
                      class="form-check-input"
                      [checked]="customer.selected"
                      (change)="toggleCustomerSelection(customer)"
                    />
                  </td>
                  <td>
                    <div class="d-flex align-items-center">
                      <div class="user-avatar me-3">
                        <i class="bi bi-person-circle text-muted fs-4"></i>
                      </div>
                      <div>
                        <div class="fw-semibold">
                          {{ customer.firstName }} {{ customer.lastName }}
                        </div>
                        <small class="text-muted">{{
                          customer.username
                        }}</small>
                      </div>
                    </div>
                  </td>
                  <td>{{ customer.email }}</td>
                  <td>
                    <span
                      class="badge"
                      [class]="getStatusBadge(customer.status)"
                    >
                      {{ customer.status }}
                    </span>
                  </td>
                  <td>
                    <span class="badge bg-info">{{
                      customer.accountCount || 0
                    }}</span>
                  </td>
                  <td class="fw-semibold">
                    {{ customer.totalBalance | currency }}
                  </td>
                  <td class="text-muted">
                    {{ customer.createdAt | date : 'short' }}
                  </td>
                  <td>
                    <div class="btn-group btn-group-sm">
                      <button
                        class="btn btn-outline-primary"
                        [routerLink]="['/admin/customers', customer.id]"
                        title="View Details"
                      >
                        <i class="bi bi-eye"></i>
                      </button>
                      <button
                        class="btn btn-outline-secondary"
                        [routerLink]="['/admin/customers', customer.id, 'edit']"
                        title="Edit Customer"
                      >
                        <i class="bi bi-pencil"></i>
                      </button>
                      <button
                        class="btn"
                        [class]="
                          customer.status === 'ACTIVE'
                            ? 'btn-outline-warning'
                            : 'btn-outline-success'
                        "
                        (click)="toggleCustomerStatus(customer)"
                        [title]="
                          customer.status === 'ACTIVE'
                            ? 'Suspend Customer'
                            : 'Activate Customer'
                        "
                      >
                        <i
                          class="bi"
                          [class]="
                            customer.status === 'ACTIVE'
                              ? 'bi-pause'
                              : 'bi-play'
                          "
                        ></i>
                      </button>
                      <button
                        class="btn btn-outline-danger"
                        (click)="deleteCustomer(customer)"
                        title="Delete Customer"
                      >
                        <i class="bi bi-trash"></i>
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Pagination -->
        <div class="card-footer bg-white" *ngIf="totalPages > 1">
          <nav>
            <ul class="pagination pagination-sm mb-0 justify-content-center">
              <li class="page-item" [class.disabled]="currentPage === 1">
                <button class="page-link" (click)="goToPage(currentPage - 1)">
                  <i class="bi bi-chevron-left"></i>
                </button>
              </li>
              <li
                class="page-item"
                *ngFor="let page of getPageNumbers()"
                [class.active]="page === currentPage"
              >
                <button class="page-link" (click)="goToPage(page)">
                  {{ page }}
                </button>
              </li>
              <li
                class="page-item"
                [class.disabled]="currentPage === totalPages"
              >
                <button class="page-link" (click)="goToPage(currentPage + 1)">
                  <i class="bi bi-chevron-right"></i>
                </button>
              </li>
            </ul>
          </nav>
        </div>
      </div>

      <!-- Bulk Actions -->
      <div class="mt-3" *ngIf="selectedCustomers.length > 0">
        <div class="alert alert-info">
          <div class="d-flex justify-content-between align-items-center">
            <span>
              <i class="bi bi-info-circle me-2"></i>
              {{ selectedCustomers.length }} customer(s) selected
            </span>
            <div class="btn-group btn-group-sm">
              <button class="btn btn-warning" (click)="bulkSuspend()">
                <i class="bi bi-pause me-1"></i>Suspend
              </button>
              <button class="btn btn-success" (click)="bulkActivate()">
                <i class="bi bi-play me-1"></i>Activate
              </button>
              <button class="btn btn-danger" (click)="bulkDelete()">
                <i class="bi bi-trash me-1"></i>Delete
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      .customer-list {
        padding: 1.5rem;
      }

      .user-avatar {
        font-size: 2rem;
      }

      .table th {
        border-top: none;
        font-weight: 600;
        color: var(--dark-gray);
      }

      .btn-group-sm .btn {
        padding: 0.25rem 0.5rem;
      }

      .pagination .page-link {
        color: var(--primary-red);
        border-color: var(--border-color);
      }

      .pagination .page-item.active .page-link {
        background-color: var(--primary-red);
        border-color: var(--primary-red);
      }

      .pagination .page-link:hover {
        background-color: rgba(230, 57, 70, 0.1);
        border-color: var(--primary-red);
      }

      @media (max-width: 768px) {
        .customer-list {
          padding: 1rem;
        }

        .d-flex.justify-content-between {
          flex-direction: column;
          gap: 1rem;
        }

        .table-responsive {
          font-size: 0.875rem;
        }
      }
    `,
  ],
})
export class CustomerListComponent implements OnInit {
  customers: User[] = [];
  filteredCustomers: User[] = [];
  paginatedCustomers: User[] = [];

  searchTerm = '';
  selectedStatus = '';
  sortBy = 'firstName';
  sortOrder: 'asc' | 'desc' = 'asc';

  currentPage = 1;
  pageSize = 10;
  totalPages = 1;

  selectedCustomers: User[] = [];
  allSelected = false;

  constructor(private customerService: AdminCustomerService) {}

  ngOnInit(): void {
    this.loadCustomers();
  }

  loadCustomers(): void {
    this.customerService
      .getCustomers({
        page: this.currentPage - 1,
        size: this.pageSize,
        sortBy: this.sortBy,
        sortOrder: this.sortOrder,
        search: this.searchTerm,
        status: this.selectedStatus as UserStatus,
      })
      .subscribe({
        next: (response) => {
          this.customers = response.content.map((customer) => ({
            ...customer,
            status: customer.enabled ? UserStatus.ACTIVE : UserStatus.INACTIVE,
            accountCount: 0,
            totalBalance: 0,
            selected: false,
          }));

          // Load account information for each customer
          this.loadCustomerAccountInfo();

          this.filteredCustomers = this.customers;
          this.totalPages = response.totalPages;
          this.updatePagination();
        },
        error: (err) => {
          console.error('Error loading customers:', err);
          this.customers = [];
          this.filterCustomers();
        },
      });
  }

  private loadCustomerAccountInfo(): void {
    this.customers.forEach((customer) => {
      this.customerService.getCustomerAccounts(customer.id).subscribe({
        next: (accounts) => {
          customer.accountCount = accounts.length;
          customer.totalBalance = accounts.reduce(
            (sum, account) => sum + (account.balance || 0),
            0
          );
        },
        error: (err) => {
          console.error(
            `Error loading accounts for customer ${customer.id}:`,
            err
          );
          customer.accountCount = 0;
          customer.totalBalance = 0;
        },
      });
    });
  }

  filterCustomers(): void {
    this.filteredCustomers = this.customers.filter((customer) => {
      const matchesSearch =
        !this.searchTerm ||
        (customer.firstName || '')
          .toLowerCase()
          .includes(this.searchTerm.toLowerCase()) ||
        (customer.lastName || '')
          .toLowerCase()
          .includes(this.searchTerm.toLowerCase()) ||
        customer.email.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        customer.username.toLowerCase().includes(this.searchTerm.toLowerCase());

      const matchesStatus =
        !this.selectedStatus || customer.status === this.selectedStatus;

      return matchesSearch && matchesStatus;
    });

    this.sortCustomers();
  }

  sortCustomers(): void {
    this.filteredCustomers.sort((a, b) => {
      const aValue = a[this.sortBy as keyof User];
      const bValue = b[this.sortBy as keyof User];

      let comparison = 0;

      // Handle null/undefined values
      if (aValue == null && bValue == null) {
        comparison = 0;
      } else if (aValue == null) {
        comparison = -1;
      } else if (bValue == null) {
        comparison = 1;
      } else {
        // Both values exist, compare them
        if (aValue < bValue) comparison = -1;
        else if (aValue > bValue) comparison = 1;
        else comparison = 0;
      }

      return this.sortOrder === 'desc' ? -comparison : comparison;
    });

    this.updatePagination();
  }

  updatePagination(): void {
    this.totalPages = Math.ceil(this.filteredCustomers.length / this.pageSize);
    this.currentPage = Math.min(this.currentPage, this.totalPages || 1);

    const startIndex = (this.currentPage - 1) * this.pageSize;
    const endIndex = startIndex + this.pageSize;
    this.paginatedCustomers = this.filteredCustomers.slice(
      startIndex,
      endIndex
    );
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.updatePagination();
    }
  }

  getPageNumbers(): number[] {
    const pages = [];
    const maxVisible = 5;
    let start = Math.max(1, this.currentPage - Math.floor(maxVisible / 2));
    let end = Math.min(this.totalPages, start + maxVisible - 1);

    if (end - start + 1 < maxVisible) {
      start = Math.max(1, end - maxVisible + 1);
    }

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    return pages;
  }

  toggleSelectAll(): void {
    this.allSelected = !this.allSelected;
    this.paginatedCustomers.forEach((customer) => {
      customer.selected = this.allSelected;
    });
    this.updateSelectedCustomers();
  }

  toggleCustomerSelection(customer: any): void {
    customer.selected = !customer.selected;
    this.updateSelectedCustomers();
  }

  updateSelectedCustomers(): void {
    this.selectedCustomers = this.customers.filter(
      (customer) => customer.selected
    );
    this.allSelected =
      this.paginatedCustomers.length > 0 &&
      this.paginatedCustomers.every((customer) => customer.selected);
  }

  getStatusBadge(status: string): string {
    const badges = {
      ACTIVE: 'bg-success',
      INACTIVE: 'bg-warning',
      SUSPENDED: 'bg-danger',
    };
    return badges[status as keyof typeof badges] || 'bg-secondary';
  }

  toggleCustomerStatus(customer: any): void {
    const newEnabled = !customer.enabled;
    this.customerService
      .updateCustomerStatus(customer.id, newEnabled)
      .subscribe({
        next: (updatedCustomer) => {
          customer.enabled = updatedCustomer.enabled;
          customer.status = updatedCustomer.enabled
            ? UserStatus.ACTIVE
            : UserStatus.INACTIVE;
        },
        error: (err) => {
          console.error('Error updating customer status:', err);
        },
      });
  }

  deleteCustomer(customer: User): void {
    const customerName =
      `${customer.firstName || ''} ${customer.lastName || ''}`.trim() ||
      customer.username;

    if (
      confirm(
        `Are you sure you want to delete customer "${customerName}"? This action cannot be undone.`
      )
    ) {
      this.customerService.deleteCustomer(customer.id).subscribe({
        next: () => {
          this.customers = this.customers.filter((c) => c.id !== customer.id);
          this.filterCustomers();
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

  bulkSuspend(): void {
    if (confirm(`Suspend ${this.selectedCustomers.length} customer(s)?`)) {
      const customerIds = this.selectedCustomers.map((c) => c.id);
      this.customerService.bulkUpdateStatus(customerIds, false).subscribe({
        next: (updatedCustomers) => {
          this.selectedCustomers.forEach((customer) => {
            customer.enabled = false;
            customer.status = UserStatus.INACTIVE;
            customer.selected = false;
          });
          this.updateSelectedCustomers();
        },
        error: (err) => {
          console.error('Error suspending customers:', err);
        },
      });
    }
  }

  bulkActivate(): void {
    if (confirm(`Activate ${this.selectedCustomers.length} customer(s)?`)) {
      const customerIds = this.selectedCustomers.map((c) => c.id);
      this.customerService.bulkUpdateStatus(customerIds, true).subscribe({
        next: (updatedCustomers) => {
          this.selectedCustomers.forEach((customer) => {
            customer.enabled = true;
            customer.status = UserStatus.ACTIVE;
            customer.selected = false;
          });
          this.updateSelectedCustomers();
        },
        error: (err) => {
          console.error('Error activating customers:', err);
        },
      });
    }
  }

  bulkDelete(): void {
    if (
      confirm(
        `Delete ${this.selectedCustomers.length} customer(s)? This action cannot be undone.`
      )
    ) {
      const selectedIds = this.selectedCustomers.map((c) => c.id);
      this.customerService.bulkDeleteCustomers(selectedIds).subscribe({
        next: () => {
          this.customers = this.customers.filter(
            (c) => !selectedIds.includes(c.id)
          );
          this.filterCustomers();
          this.selectedCustomers = [];
        },
        error: (err) => {
          console.error('Error deleting customers:', err);
        },
      });
    }
  }

  refreshCustomers(): void {
    this.loadCustomers();
  }

  exportCustomers(): void {
    console.log('Exporting customers...');
    this.customerService
      .exportCustomers({
        search: this.searchTerm,
        status: this.selectedStatus as UserStatus,
        sortBy: this.sortBy,
        sortOrder: this.sortOrder,
      })
      .subscribe({
        next: (blob) => {
          const url = window.URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = `customers-${
            new Date().toISOString().split('T')[0]
          }.csv`;
          link.click();
          window.URL.revokeObjectURL(url);
        },
        error: (err) => {
          console.error('Error exporting customers:', err);
          // You could show a notification here
        },
      });
  }

  trackByCustomerId(index: number, customer: User): number {
    return customer.id;
  }
}
