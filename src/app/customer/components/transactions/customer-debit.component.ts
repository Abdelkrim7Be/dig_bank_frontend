import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, ActivatedRoute } from '@angular/router';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { BankingApiService } from '../../../core/services/banking-api.service';
import { AccountService } from '../../../shared/services/account.service';
import { BankAccount } from '../../../shared/models/account.model';
import { AuthService } from '../../../auth/services/auth.service';

interface DebitRequest {
  amount: number;
  description: string;
}

@Component({
  selector: 'app-customer-debit',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule],
  template: `
    <div class="customer-debit">
      <!-- Header -->
      <div class="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 class="h4 mb-1">Debit Account</h2>
          <p class="text-muted mb-0">Withdraw money from your account</p>
        </div>
        <button class="btn btn-outline-secondary" (click)="goBack()">
          <i class="bi bi-arrow-left me-2"></i>Back
        </button>
      </div>

      <!-- Loading State -->
      <div *ngIf="loading && !accounts.length" class="text-center py-5">
        <div class="spinner-border text-primary" role="status">
          <span class="visually-hidden">Loading...</span>
        </div>
        <p class="mt-3 text-muted">Loading your accounts...</p>
      </div>

      <!-- Error State -->
      <div *ngIf="errorMessage" class="alert alert-danger" role="alert">
        <i class="bi bi-exclamation-triangle me-2"></i>
        {{ errorMessage }}
      </div>

      <!-- Success State -->
      <div *ngIf="successMessage" class="alert alert-success" role="alert">
        <i class="bi bi-check-circle me-2"></i>
        {{ successMessage }}
      </div>

      <!-- Debit Form -->
      <div *ngIf="!loading || accounts.length" class="row">
        <div class="col-lg-8 mx-auto">
          <div class="card border-0 shadow-sm">
            <div class="card-header bg-warning text-dark">
              <h5 class="card-title mb-0">
                <i class="bi bi-dash-circle me-2"></i>
                Debit Account
              </h5>
            </div>
            <div class="card-body">
              <form [formGroup]="debitForm" (ngSubmit)="onSubmit()">
                <!-- Account Selection -->
                <div class="mb-3">
                  <label for="accountId" class="form-label"
                    >Select Account</label
                  >
                  <select
                    class="form-select"
                    id="accountId"
                    formControlName="accountId"
                    [class.is-invalid]="
                      accountId?.invalid && accountId?.touched
                    "
                  >
                    <option value="">Choose an account...</option>
                    <option
                      *ngFor="let account of accounts"
                      [value]="account.id"
                    >
                      {{ formatAccountDisplay(account) }}
                    </option>
                  </select>
                  <div
                    *ngIf="accountId?.invalid && accountId?.touched"
                    class="invalid-feedback"
                  >
                    Please select an account.
                  </div>
                </div>

                <!-- Amount -->
                <div class="mb-3">
                  <label for="amount" class="form-label">Amount</label>
                  <div class="input-group">
                    <span class="input-group-text">$</span>
                    <input
                      type="number"
                      class="form-control"
                      id="amount"
                      formControlName="amount"
                      placeholder="0.00"
                      step="0.01"
                      min="0.01"
                      [class.is-invalid]="amount?.invalid && amount?.touched"
                    />
                  </div>
                  <div
                    *ngIf="amount?.invalid && amount?.touched"
                    class="invalid-feedback"
                  >
                    <div *ngIf="amount?.errors?.['required']">
                      Amount is required.
                    </div>
                    <div *ngIf="amount?.errors?.['min']">
                      Amount must be at least $0.01.
                    </div>
                    <div *ngIf="amount?.errors?.['insufficientFunds']">
                      Insufficient funds. Available balance:
                      {{ getSelectedAccount()?.balance | currency }}
                    </div>
                  </div>
                  <div *ngIf="getSelectedAccount()" class="form-text">
                    Available balance:
                    {{ getSelectedAccount()?.balance | currency }}
                  </div>
                </div>

                <!-- Description -->
                <div class="mb-3">
                  <label for="description" class="form-label"
                    >Description</label
                  >
                  <textarea
                    class="form-control"
                    id="description"
                    formControlName="description"
                    rows="3"
                    placeholder="Enter a description for this debit..."
                    [class.is-invalid]="
                      description?.invalid && description?.touched
                    "
                  ></textarea>
                  <div
                    *ngIf="description?.invalid && description?.touched"
                    class="invalid-feedback"
                  >
                    <div *ngIf="description?.errors?.['required']">
                      Description is required.
                    </div>
                    <div *ngIf="description?.errors?.['minlength']">
                      Description must be at least 3 characters long.
                    </div>
                  </div>
                </div>

                <!-- Debit Summary -->
                <div
                  class="card bg-light mb-4"
                  *ngIf="debitForm.valid && !hasInsufficientFunds()"
                >
                  <div class="card-body">
                    <h6 class="card-title">Debit Summary</h6>
                    <div class="row">
                      <div class="col-md-6">
                        <strong>Account:</strong>
                        {{ getSelectedAccount()?.id }}<br />
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

                <!-- Submit Button -->
                <div class="d-grid gap-2 d-md-flex justify-content-md-end">
                  <button
                    type="button"
                    class="btn btn-outline-secondary me-md-2"
                    (click)="goBack()"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    class="btn btn-warning"
                    [disabled]="
                      debitForm.invalid || loading || hasInsufficientFunds()
                    "
                  >
                    <span
                      *ngIf="loading"
                      class="spinner-border spinner-border-sm me-2"
                      role="status"
                      aria-hidden="true"
                    ></span>
                    <i *ngIf="!loading" class="bi bi-dash-circle me-2"></i>
                    {{ loading ? 'Processing...' : 'Debit Account' }}
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
      .customer-debit {
        padding: 1.5rem;
      }

      .card {
        border: none;
        box-shadow: 0 0.125rem 0.25rem rgba(0, 0, 0, 0.075);
      }

      .form-label {
        font-weight: 500;
        margin-bottom: 0.5rem;
      }

      .btn {
        border-radius: 0.375rem;
      }

      .input-group-text {
        background-color: #f8f9fa;
        border-color: #dee2e6;
      }

      @media (max-width: 768px) {
        .customer-debit {
          padding: 1rem;
        }
      }
    `,
  ],
})
export class CustomerDebitComponent implements OnInit {
  debitForm: FormGroup;
  loading = false;
  errorMessage = '';
  successMessage = '';
  accounts: BankAccount[] = [];
  preSelectedAccountId: string | null = null;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    private bankingApiService: BankingApiService,
    private accountService: AccountService,
    private authService: AuthService
  ) {
    this.debitForm = this.initializeForm();
  }

  ngOnInit(): void {
    this.preSelectedAccountId = this.route.snapshot.paramMap.get('accountId');
    this.loadCustomerAccounts();
  }

  private initializeForm(): FormGroup {
    const form = this.fb.group({
      accountId: ['', [Validators.required]],
      amount: ['', [Validators.required, Validators.min(0.01)]],
      description: ['', [Validators.required, Validators.minLength(3)]],
    });

    // Add custom validator for insufficient funds
    form.get('amount')?.valueChanges.subscribe(() => {
      this.validateAmount();
    });

    form.get('accountId')?.valueChanges.subscribe(() => {
      this.validateAmount();
    });

    return form;
  }

  private validateAmount(): void {
    const amountControl = this.debitForm.get('amount');
    const accountId = this.debitForm.get('accountId')?.value;
    const amount = amountControl?.value;

    if (amountControl && accountId && amount) {
      const selectedAccount = this.accounts.find((acc) => acc.id === accountId);
      if (selectedAccount && amount > selectedAccount.balance) {
        amountControl.setErrors({ insufficientFunds: true });
      } else if (amountControl.errors?.['insufficientFunds']) {
        // Remove insufficient funds error if amount is now valid
        const errors = { ...amountControl.errors };
        delete errors['insufficientFunds'];
        amountControl.setErrors(Object.keys(errors).length ? errors : null);
      }
    }
  }

  private loadCustomerAccounts(): void {
    this.loading = true;
    this.errorMessage = '';

    this.accountService.getCustomerAccounts().subscribe({
      next: (accounts) => {
        this.accounts = accounts.filter(
          (account) => account.status === 'ACTIVATED'
        );

        // Pre-select account if provided in route
        if (this.preSelectedAccountId && this.accounts.length > 0) {
          const account = this.accounts.find(
            (acc) => acc.id === this.preSelectedAccountId
          );
          if (account) {
            this.debitForm.patchValue({ accountId: account.id });
          }
        }

        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading customer accounts:', error);
        this.errorMessage = 'Failed to load your accounts. Please try again.';
        this.loading = false;
      },
    });
  }

  formatAccountDisplay(account: BankAccount): string {
    const accountType = this.formatAccountType(account.type || '');
    const balance = account.balance || 0;
    const maskedId = this.maskAccountNumber(account.id);
    return `${accountType} (${maskedId}) - ${balance.toLocaleString('en-US', {
      style: 'currency',
      currency: 'USD',
    })}`;
  }

  private formatAccountType(type: string): string {
    switch (type?.toUpperCase()) {
      case 'CURRENTACCOUNT':
        return 'Checking';
      case 'SAVINGACCOUNT':
        return 'Savings';
      default:
        return type || 'Account';
    }
  }

  private maskAccountNumber(accountId: string | number): string {
    const accountIdStr = accountId?.toString() || '';
    if (!accountIdStr || accountIdStr.length < 4) return '****';
    return '****' + accountIdStr.slice(-4);
  }

  getSelectedAccount(): BankAccount | undefined {
    const accountId = this.debitForm.get('accountId')?.value;
    return this.accounts.find((account) => account.id === accountId);
  }

  getRemainingBalance(): number {
    const selectedAccount = this.getSelectedAccount();
    const amount = this.debitForm.get('amount')?.value || 0;
    return selectedAccount ? selectedAccount.balance - amount : 0;
  }

  hasInsufficientFunds(): boolean {
    return this.debitForm.get('amount')?.errors?.['insufficientFunds'] || false;
  }

  onSubmit(): void {
    if (this.debitForm.invalid || this.hasInsufficientFunds()) {
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
            this.router.navigate(['/customer/accounts']);
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
    this.router.navigate(['/customer/dashboard']);
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
