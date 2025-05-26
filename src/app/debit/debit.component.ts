import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { BankingApiService } from '../core/services/banking-api.service';
import {
  AccountSelectionDTO,
  DebitRequest,
} from '../shared/models/banking-dtos.model';

import { InlineAlertComponent } from '../shared/components/inline-alert/inline-alert.component';

@Component({
  selector: 'app-debit',
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
              <li class="breadcrumb-item active">Debit Money</li>
            </ol>
          </nav>
          <h2 class="mb-1">Debit Money</h2>
          <p class="text-muted mb-0">Debit funds from an account</p>
        </div>
      </div>

      <div class="row justify-content-center">
        <div class="col-lg-6">
          <!-- Debit Form -->
          <div class="card">
            <div class="card-header">
              <h5 class="mb-0">
                <i class="bi bi-dash-circle me-2 text-warning"></i>
                Debit Details
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

              <form [formGroup]="debitForm" (ngSubmit)="onSubmit()">
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
                    <option value="">Choose account to debit from</option>
                    <option
                      *ngFor="let account of accounts"
                      [value]="account.accountId"
                    >
                      {{ account.customerUsername }} -
                      {{ account.customerName }} ({{ account.accountType }}:
                      Available:
                      {{
                        account.balance | currency : 'USD' : 'symbol' : '1.2-2'
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
                  <label for="amount" class="form-label">Debit Amount *</label>
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
                      Amount exceeds available balance
                    </div>
                  </div>
                  <div class="form-text" *ngIf="getSelectedAccount()">
                    Available balance:
                    {{
                      getSelectedAccount()?.balance
                        | currency : 'USD' : 'symbol' : '1.2-2'
                    }}
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
                    placeholder="Enter debit description"
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

                <!-- Debit Summary -->
                <div class="card bg-light mb-4" *ngIf="debitForm.valid">
                  <div class="card-body">
                    <h6 class="card-title">Debit Summary</h6>
                    <div class="row">
                      <div class="col-md-6">
                        <strong>Account:</strong>
                        {{ getSelectedAccount()?.customerUsername }} -
                        {{ getSelectedAccount()?.customerName }}<br />
                        <strong>Current Balance:</strong>
                        {{
                          getSelectedAccount()?.balance
                            | currency : 'USD' : 'symbol' : '1.2-2'
                        }}<br />
                      </div>
                      <div class="col-md-6">
                        <strong>Debit Amount:</strong>
                        {{
                          amount?.value | currency : 'USD' : 'symbol' : '1.2-2'
                        }}<br />
                        <strong>Remaining Balance:</strong>
                        {{
                          getRemainingBalance()
                            | currency : 'USD' : 'symbol' : '1.2-2'
                        }}<br />
                      </div>
                    </div>
                    <hr />
                    <strong>Description:</strong> {{ description?.value }}
                  </div>
                </div>

                <!-- Warning for Low Balance -->
                <div class="alert alert-warning" *ngIf="isLowBalance()">
                  <i class="bi bi-exclamation-triangle me-2"></i>
                  <strong>Warning:</strong> This debit will leave the account
                  with a low balance.
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
                    class="btn btn-warning"
                    [disabled]="debitForm.invalid || loading"
                  >
                    <span
                      *ngIf="loading"
                      class="spinner-border spinner-border-sm me-2"
                    ></span>
                    <i class="bi bi-dash-circle me-2" *ngIf="!loading"></i>
                    {{ loading ? 'Processing...' : 'Debit Money' }}
                  </button>
                </div>
              </form>
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
        border-color: var(--warning-yellow);
        box-shadow: 0 0 0 0.2rem rgba(233, 196, 106, 0.25);
      }

      .btn-warning {
        background-color: var(--warning-yellow);
        border-color: var(--warning-yellow);
        color: var(--dark-gray);
      }

      .btn-warning:hover {
        background-color: #e6b800;
        border-color: #e6b800;
        color: var(--dark-gray);
      }

      .bg-light {
        background-color: var(--primary-white) !important;
      }

      .text-warning {
        color: var(--warning-yellow) !important;
      }

      .alert-warning {
        background-color: rgba(233, 196, 106, 0.1);
        border-color: var(--warning-yellow);
        color: var(--dark-gray);
      }
    `,
  ],
})
export class DebitComponent implements OnInit {
  debitForm!: FormGroup;
  accounts: AccountSelectionDTO[] = [];
  loading = false;
  successMessage = '';
  errorMessage = '';
  preselectedAccountId: string | null = null;

  constructor(
    private fb: FormBuilder,
    private bankingApiService: BankingApiService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.initializeForm();
    this.loadAccounts();

    // Check if account ID is provided in route params
    this.route.params.subscribe((params) => {
      if (params['accountId']) {
        this.preselectedAccountId = params['accountId'];
      }
    });
  }

  initializeForm(): void {
    this.debitForm = this.fb.group({
      accountId: ['', [Validators.required]],
      amount: ['', [Validators.required, Validators.min(0.01)]],
      description: ['', [Validators.required, Validators.minLength(3)]],
    });

    // Add custom validators
    this.debitForm.get('amount')?.valueChanges.subscribe(() => {
      this.validateAmount();
    });

    this.debitForm.get('accountId')?.valueChanges.subscribe(() => {
      this.validateAmount();
    });
  }

  validateAmount(): void {
    const amountControl = this.debitForm.get('amount');
    const accountId = this.debitForm.get('accountId')?.value;

    if (amountControl && accountId) {
      const account = this.accounts.find((acc) => acc.accountId == accountId);
      const amount = amountControl.value;

      if (account && amount > account.balance) {
        amountControl.setErrors({ max: true });
      } else if (amountControl.errors?.['max']) {
        delete amountControl.errors['max'];
        if (Object.keys(amountControl.errors).length === 0) {
          amountControl.setErrors(null);
        }
      }
    }
  }

  loadAccounts(): void {
    this.bankingApiService.getActiveAccountsForSelection().subscribe({
      next: (accounts) => {
        this.accounts = accounts.filter(
          (acc) => acc.status === 'ACTIVATED' && acc.balance > 0
        );

        // Set preselected account if provided
        if (this.preselectedAccountId) {
          const account = this.accounts.find(
            (acc) => acc.accountId === this.preselectedAccountId
          );
          if (account) {
            this.debitForm.patchValue({ accountId: account.accountId });
          }
        }
      },
      error: (error) => {
        this.errorMessage = 'Failed to load accounts. Please try again.';
        console.error('Error loading accounts:', error);
      },
    });
  }

  getSelectedAccount(): AccountSelectionDTO | undefined {
    const accountId = this.debitForm.get('accountId')?.value;
    return this.accounts.find((account) => account.accountId == accountId);
  }

  getRemainingBalance(): number {
    const selectedAccount = this.getSelectedAccount();
    const amount = this.debitForm.get('amount')?.value || 0;
    return selectedAccount ? selectedAccount.balance - amount : 0;
  }

  isLowBalance(): boolean {
    const remainingBalance = this.getRemainingBalance();
    return remainingBalance < 100 && remainingBalance >= 0;
  }

  onSubmit(): void {
    if (this.debitForm.invalid) {
      this.debitForm.markAllAsTouched();
      return;
    }

    this.loading = true;
    this.errorMessage = '';
    this.successMessage = '';

    const debitRequest: DebitRequest = {
      amount: this.debitForm.value.amount,
      description: this.debitForm.value.description,
    };

    this.bankingApiService
      .debit(
        this.debitForm.value.accountId,
        debitRequest.amount,
        debitRequest.description
      )
      .subscribe({
        next: () => {
          this.loading = false;
          this.successMessage = `Debit completed successfully!`;
          this.debitForm.reset();

          // Redirect to accounts page after 3 seconds
          setTimeout(() => {
            this.router.navigate(['/accounts']);
          }, 3000);
        },
        error: (error) => {
          this.loading = false;
          this.errorMessage =
            error.error?.message || 'Debit failed. Please try again.';
          console.error('Debit error:', error);
        },
      });
  }

  goBack(): void {
    this.router.navigate(['/accounts']);
  }

  // Getter methods for form controls
  get accountId() {
    return this.debitForm.get('accountId');
  }
  get amount() {
    return this.debitForm.get('amount');
  }
  get description() {
    return this.debitForm.get('description');
  }
}
