import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { AccountService } from '../shared/services/account.service';
import { Account, DepositRequest } from '../shared/models/account.model';

import { InlineAlertComponent } from '../shared/components/inline-alert/inline-alert.component';

@Component({
  selector: 'app-deposit',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, InlineAlertComponent],
  template: `
    <div class="container-fluid">
      <!-- Page Header -->
      <div class="row mb-4">
        <div class="col-12">
          <nav aria-label="breadcrumb">
            <ol class="breadcrumb">
              <li class="breadcrumb-item">
                <a routerLink="/dashboard">Dashboard</a>
              </li>
              <li class="breadcrumb-item">
                <a routerLink="/accounts">Accounts</a>
              </li>
              <li class="breadcrumb-item active">Deposit Money</li>
            </ol>
          </nav>
          <h2 class="mb-1">Deposit Money</h2>
          <p class="text-muted mb-0">Add funds to your account</p>
        </div>
      </div>

      <div class="row justify-content-center">
        <div class="col-lg-6">
          <!-- Deposit Form -->
          <div class="card">
            <div class="card-header">
              <h5 class="mb-0">
                <i class="bi bi-plus-circle me-2 text-success"></i>
                Deposit Details
              </h5>
            </div>
            <div class="card-body">
              <!-- Success Message -->
              <app-inline-alert
                *ngIf="successMessage"
                type="success"
                [message]="successMessage"
                [dismissible]="true"
                (dismissed)="successMessage = ''"
              >
              </app-inline-alert>

              <!-- Error Message -->
              <app-inline-alert
                *ngIf="errorMessage"
                type="danger"
                [message]="errorMessage"
                [dismissible]="true"
                (dismissed)="errorMessage = ''"
              >
              </app-inline-alert>

              <form [formGroup]="depositForm" (ngSubmit)="onSubmit()">
                <!-- Account Selection -->
                <div class="mb-3">
                  <label for="account" class="form-label"
                    >Select Account *</label
                  >
                  <select
                    id="account"
                    class="form-select"
                    formControlName="accountId"
                    [class.is-invalid]="
                      accountId?.invalid &&
                      (accountId?.dirty || accountId?.touched)
                    "
                  >
                    <option value="">Choose account to deposit to</option>
                    <option
                      *ngFor="let account of accounts"
                      [value]="account.id"
                    >
                      {{ account.accountNumber }} -
                      {{ getAccountTypeDisplay(account.accountType) }} (Current:
                      {{
                        account.balance
                          | currency : account.currency : 'symbol' : '1.2-2'
                      }})
                    </option>
                  </select>
                  <div
                    class="invalid-feedback"
                    *ngIf="
                      accountId?.invalid &&
                      (accountId?.dirty || accountId?.touched)
                    "
                  >
                    <div *ngIf="accountId?.errors?.['required']">
                      Please select an account
                    </div>
                  </div>
                </div>

                <!-- Amount -->
                <div class="mb-3">
                  <label for="amount" class="form-label"
                    >Deposit Amount *</label
                  >
                  <div class="input-group">
                    <span class="input-group-text">$</span>
                    <input
                      type="number"
                      id="amount"
                      class="form-control"
                      formControlName="amount"
                      [class.is-invalid]="
                        amount?.invalid && (amount?.dirty || amount?.touched)
                      "
                      placeholder="0.00"
                      step="0.01"
                      min="0.01"
                    />
                  </div>
                  <div
                    class="invalid-feedback"
                    *ngIf="
                      amount?.invalid && (amount?.dirty || amount?.touched)
                    "
                  >
                    <div *ngIf="amount?.errors?.['required']">
                      Amount is required
                    </div>
                    <div *ngIf="amount?.errors?.['min']">
                      Amount must be greater than 0
                    </div>
                    <div *ngIf="amount?.errors?.['max']">
                      Amount exceeds maximum deposit limit
                    </div>
                  </div>
                  <div class="form-text">
                    Minimum deposit: $0.01 | Maximum deposit: $10,000.00
                  </div>
                </div>

                <!-- Description -->
                <div class="mb-3">
                  <label for="description" class="form-label"
                    >Description *</label
                  >
                  <input
                    type="text"
                    id="description"
                    class="form-control"
                    formControlName="description"
                    [class.is-invalid]="
                      description?.invalid &&
                      (description?.dirty || description?.touched)
                    "
                    placeholder="Enter deposit description"
                  />
                  <div
                    class="invalid-feedback"
                    *ngIf="
                      description?.invalid &&
                      (description?.dirty || description?.touched)
                    "
                  >
                    <div *ngIf="description?.errors?.['required']">
                      Description is required
                    </div>
                    <div *ngIf="description?.errors?.['minlength']">
                      Description must be at least 3 characters
                    </div>
                  </div>
                </div>

                <!-- Reference (Optional) -->
                <div class="mb-4">
                  <label for="reference" class="form-label"
                    >Reference (Optional)</label
                  >
                  <input
                    type="text"
                    id="reference"
                    class="form-control"
                    formControlName="reference"
                    placeholder="Enter reference number or note"
                  />
                </div>

                <!-- Deposit Summary -->
                <div class="card bg-light mb-4" *ngIf="depositForm.valid">
                  <div class="card-body">
                    <h6 class="card-title">Deposit Summary</h6>
                    <div class="row">
                      <div class="col-md-6">
                        <strong>Account:</strong>
                        {{ getSelectedAccount()?.accountNumber }}<br />
                        <strong>Current Balance:</strong>
                        {{
                          getSelectedAccount()?.balance
                            | currency : 'USD' : 'symbol' : '1.2-2'
                        }}<br />
                      </div>
                      <div class="col-md-6">
                        <strong>Deposit Amount:</strong>
                        {{
                          amount?.value | currency : 'USD' : 'symbol' : '1.2-2'
                        }}<br />
                        <strong>New Balance:</strong>
                        {{
                          getNewBalance()
                            | currency : 'USD' : 'symbol' : '1.2-2'
                        }}<br />
                      </div>
                    </div>
                    <hr />
                    <strong>Description:</strong> {{ description?.value }}
                  </div>
                </div>

                <!-- Action Buttons -->
                <div class="d-flex justify-content-between">
                  <button
                    type="button"
                    class="btn btn-outline-secondary"
                    (click)="goBack()"
                  >
                    <i class="bi bi-arrow-left me-2"></i>
                    Cancel
                  </button>
                  <button
                    type="submit"
                    class="btn btn-success"
                    [disabled]="depositForm.invalid || loading"
                  >
                    <span
                      *ngIf="loading"
                      class="spinner-border spinner-border-sm me-2"
                    ></span>
                    <i class="bi bi-plus-circle me-2" *ngIf="!loading"></i>
                    {{ loading ? 'Processing...' : 'Deposit Money' }}
                  </button>
                </div>
              </form>
            </div>
          </div>

          <!-- Deposit Methods Info -->
          <div class="card mt-4">
            <div class="card-header">
              <h6 class="mb-0">
                <i class="bi bi-info-circle me-2"></i>
                Deposit Methods
              </h6>
            </div>
            <div class="card-body">
              <div class="row">
                <div class="col-md-6">
                  <h6><i class="bi bi-bank me-2"></i>Bank Transfer</h6>
                  <p class="small text-muted">
                    Transfer from external bank account
                  </p>
                </div>
                <div class="col-md-6">
                  <h6><i class="bi bi-credit-card me-2"></i>Debit Card</h6>
                  <p class="small text-muted">
                    Instant deposit using debit card
                  </p>
                </div>
                <div class="col-md-6">
                  <h6><i class="bi bi-cash me-2"></i>Cash Deposit</h6>
                  <p class="small text-muted">Deposit cash at ATM or branch</p>
                </div>
                <div class="col-md-6">
                  <h6><i class="bi bi-phone me-2"></i>Mobile Check</h6>
                  <p class="small text-muted">
                    Deposit checks using mobile app
                  </p>
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
        box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
      }

      .form-control:focus,
      .form-select:focus {
        border-color: var(--success-green);
        box-shadow: 0 0 0 0.2rem rgba(42, 157, 143, 0.25);
      }

      .btn-success {
        background-color: var(--success-green);
        border-color: var(--success-green);
      }

      .btn-success:hover {
        background-color: #238276;
        border-color: #238276;
      }

      .bg-light {
        background-color: var(--primary-white) !important;
      }

      .text-success {
        color: var(--success-green) !important;
      }
    `,
  ],
})
export class DepositComponent implements OnInit {
  depositForm!: FormGroup;
  accounts: Account[] = [];
  loading = false;
  successMessage = '';
  errorMessage = '';
  preselectedAccountId: number | null = null;

  constructor(
    private fb: FormBuilder,
    private accountService: AccountService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.initializeForm();
    this.loadAccounts();

    // Check if account ID is provided in route params
    this.route.params.subscribe((params) => {
      if (params['accountId']) {
        this.preselectedAccountId = +params['accountId'];
      }
    });
  }

  initializeForm(): void {
    this.depositForm = this.fb.group({
      accountId: ['', [Validators.required]],
      amount: [
        '',
        [Validators.required, Validators.min(0.01), Validators.max(10000)],
      ],
      description: ['', [Validators.required, Validators.minLength(3)]],
      reference: [''],
    });
  }

  loadAccounts(): void {
    this.accountService.getAccounts().subscribe({
      next: (accounts) => {
        this.accounts = accounts.filter((acc) => acc.status === 'ACTIVE');

        // Set preselected account if provided
        if (this.preselectedAccountId) {
          const account = this.accounts.find(
            (acc) => acc.id === this.preselectedAccountId
          );
          if (account) {
            this.depositForm.patchValue({ accountId: account.id });
          }
        }
      },
      error: (error) => {
        this.errorMessage = 'Failed to load accounts. Please try again.';
        console.error('Error loading accounts:', error);
      },
    });
  }

  getSelectedAccount(): Account | undefined {
    const accountId = this.depositForm.get('accountId')?.value;
    return this.accounts.find((account) => account.id == accountId);
  }

  getNewBalance(): number {
    const selectedAccount = this.getSelectedAccount();
    const amount = this.depositForm.get('amount')?.value || 0;
    return selectedAccount ? selectedAccount.balance + amount : 0;
  }

  getAccountTypeDisplay(type: string): string {
    return type.charAt(0) + type.slice(1).toLowerCase();
  }

  onSubmit(): void {
    if (this.depositForm.invalid) {
      this.depositForm.markAllAsTouched();
      return;
    }

    this.loading = true;
    this.errorMessage = '';
    this.successMessage = '';

    const depositRequest: DepositRequest = {
      accountId: this.depositForm.value.accountId,
      amount: this.depositForm.value.amount,
      description: this.depositForm.value.description,
      reference: this.depositForm.value.reference,
    };

    this.accountService.deposit(depositRequest).subscribe({
      next: (transaction) => {
        this.loading = false;
        this.successMessage = `Deposit completed successfully! Transaction ID: ${transaction.id}`;
        this.depositForm.reset();

        // Redirect to accounts page after 3 seconds
        setTimeout(() => {
          this.router.navigate(['/accounts']);
        }, 3000);
      },
      error: (error) => {
        this.loading = false;
        this.errorMessage =
          error.error?.message || 'Deposit failed. Please try again.';
        console.error('Deposit error:', error);
      },
    });
  }

  goBack(): void {
    this.router.navigate(['/accounts']);
  }

  // Getter methods for form controls
  get accountId() {
    return this.depositForm.get('accountId');
  }
  get amount() {
    return this.depositForm.get('amount');
  }
  get description() {
    return this.depositForm.get('description');
  }
  get reference() {
    return this.depositForm.get('reference');
  }
}
