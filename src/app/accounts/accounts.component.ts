import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AccountService } from '../shared/services/account.service';
import {
  Account,
  AccountType,
  AccountStatus,
} from '../shared/models/account.model';
import { LoaderComponent } from '../shared/components/loader/loader.component';
import { InlineAlertComponent } from '../shared/components/inline-alert/inline-alert.component';

@Component({
  selector: 'app-accounts',
  standalone: true,
  imports: [CommonModule, RouterLink, LoaderComponent, InlineAlertComponent],
  template: `
    <div class="container-fluid">
      <!-- Page Header -->
      <div class="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 class="mb-1">My Accounts</h2>
          <p class="text-muted mb-0">
            Manage your bank accounts and view balances
          </p>
        </div>
        <button class="btn btn-primary" routerLink="/accounts/new">
          <i class="bi bi-plus-circle me-2"></i>
          Open New Account
        </button>
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

      <!-- Accounts Grid -->
      <div class="row" *ngIf="!loading && !error">
        <div class="col-lg-4 col-md-6 mb-4" *ngFor="let account of accounts">
          <div class="card h-100 account-card">
            <div
              class="card-header d-flex justify-content-between align-items-center"
            >
              <div>
                <h6 class="mb-0">
                  {{ getAccountTypeDisplay(account.accountType) }}
                </h6>
                <small class="text-muted">{{ account.accountNumber }}</small>
              </div>
              <span
                class="badge"
                [ngClass]="getStatusBadgeClass(account.status)"
              >
                {{ account.status }}
              </span>
            </div>
            <div class="card-body">
              <div class="mb-3">
                <h4 class="text-primary mb-0">
                  {{
                    account.balance
                      | currency : account.currency : 'symbol' : '1.2-2'
                  }}
                </h4>
                <small class="text-muted">Available Balance</small>
              </div>

              <div class="row text-center mb-3">
                <div class="col-4">
                  <button
                    class="btn btn-success btn-sm w-100"
                    [routerLink]="['/customer/deposit', account.id]"
                  >
                    <i class="bi bi-plus-circle"></i>
                    <div class="small">Add</div>
                  </button>
                </div>
                <div class="col-4">
                  <button
                    class="btn btn-warning btn-sm w-100"
                    [routerLink]="['/customer/debit', account.id]"
                  >
                    <i class="bi bi-dash-circle"></i>
                    <div class="small">Debit</div>
                  </button>
                </div>
                <div class="col-4">
                  <button
                    class="btn btn-info btn-sm w-100"
                    [routerLink]="['/customer/transfer']"
                  >
                    <i class="bi bi-arrow-left-right"></i>
                    <div class="small">Transfer</div>
                  </button>
                </div>
              </div>
            </div>
            <div class="card-footer bg-transparent">
              <div class="d-flex justify-content-between">
                <button
                  class="btn btn-outline-primary btn-sm"
                  [routerLink]="['/accounts', account.id, 'transactions']"
                >
                  <i class="bi bi-list-ul me-1"></i>
                  Transactions
                </button>
                <button
                  class="btn btn-outline-secondary btn-sm"
                  [routerLink]="['/accounts', account.id, 'details']"
                >
                  <i class="bi bi-eye me-1"></i>
                  Details
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Empty State -->
        <div class="col-12" *ngIf="accounts.length === 0">
          <div class="text-center py-5">
            <i class="bi bi-wallet2 display-1 text-muted"></i>
            <h4 class="mt-3">No Accounts Found</h4>
            <p class="text-muted">
              You don't have any bank accounts yet. Open your first account to
              get started.
            </p>
            <button class="btn btn-primary" routerLink="/accounts/new">
              <i class="bi bi-plus-circle me-2"></i>
              Open Your First Account
            </button>
          </div>
        </div>
      </div>

      <!-- Account Summary -->
      <div class="row mt-4" *ngIf="accounts.length > 0">
        <div class="col-12">
          <div class="card">
            <div class="card-header">
              <h5 class="mb-0">Account Summary</h5>
            </div>
            <div class="card-body">
              <div class="row">
                <div class="col-md-3 text-center">
                  <h4 class="text-primary">{{ accounts.length }}</h4>
                  <small class="text-muted">Total Accounts</small>
                </div>
                <div class="col-md-3 text-center">
                  <h4 class="text-success">
                    {{
                      getTotalBalance() | currency : 'USD' : 'symbol' : '1.2-2'
                    }}
                  </h4>
                  <small class="text-muted">Total Balance</small>
                </div>
                <div class="col-md-3 text-center">
                  <h4 class="text-info">{{ getActiveAccounts() }}</h4>
                  <small class="text-muted">Active Accounts</small>
                </div>
                <div class="col-md-3 text-center">
                  <h4 class="text-warning">{{ getAccountTypes().length }}</h4>
                  <small class="text-muted">Account Types</small>
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
      .account-card {
        transition: transform 0.2s ease-in-out;
        border: none;
        box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
      }

      .account-card:hover {
        transform: translateY(-5px);
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
      }

      .btn-sm {
        font-size: 0.75rem;
      }

      .card-header {
        background-color: var(--primary-white);
        border-bottom: 1px solid rgba(0, 0, 0, 0.1);
      }
    `,
  ],
})
export class AccountsComponent implements OnInit {
  accounts: Account[] = [];
  loading = false;
  error = '';

  constructor(private accountService: AccountService) {}

  ngOnInit(): void {
    this.loadAccounts();
  }

  loadAccounts(): void {
    this.loading = true;
    this.error = '';

    this.accountService.getAccounts().subscribe({
      next: (accounts) => {
        this.accounts = accounts;
        this.loading = false;
      },
      error: (error) => {
        this.error = 'Failed to load accounts. Please try again.';
        this.loading = false;
        console.error('Error loading accounts:', error);
      },
    });
  }

  getAccountTypeDisplay(type: AccountType): string {
    switch (type) {
      case AccountType.SAVINGS:
        return 'Savings Account';
      case AccountType.CHECKING:
        return 'Checking Account';
      case AccountType.BUSINESS:
        return 'Business Account';
      case AccountType.INVESTMENT:
        return 'Investment Account';
      default:
        return type;
    }
  }

  getStatusBadgeClass(status: AccountStatus): string {
    switch (status) {
      case AccountStatus.ACTIVE:
        return 'badge-success';
      case AccountStatus.INACTIVE:
        return 'badge-warning';
      case AccountStatus.SUSPENDED:
        return 'badge-danger';
      case AccountStatus.CLOSED:
        return 'badge-secondary';
      default:
        return 'badge-secondary';
    }
  }

  getTotalBalance(): number {
    return this.accounts.reduce((total, account) => total + account.balance, 0);
  }

  getActiveAccounts(): number {
    return this.accounts.filter(
      (account) => account.status === AccountStatus.ACTIVE
    ).length;
  }

  getAccountTypes(): AccountType[] {
    const types = new Set(this.accounts.map((account) => account.accountType));
    return Array.from(types);
  }
}
