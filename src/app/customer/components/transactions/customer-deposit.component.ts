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

interface CreditRequest {
  amount: number;
  description: string;
}

@Component({
  selector: 'app-customer-deposit',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule],
  template: `
    <div class="customer-deposit">
      <!-- Header -->
      <div class="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 class="h4 mb-1">Credit Account</h2>
          <p class="text-muted mb-0">Add money to your account</p>
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

      <!-- Credit Form -->
      <div *ngIf="!loading || accounts.length" class="row">
        <div class="col-lg-8 mx-auto">
          <div class="card border-0 shadow-sm">
            <div class="card-header bg-success text-white">
              <h5 class="card-title mb-0">
                <i class="bi bi-plus-circle me-2"></i>
                Credit Account
              </h5>
            </div>
            <div class="card-body">
              <form [formGroup]="creditForm" (ngSubmit)="onSubmit()">
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
                    placeholder="Enter a description for this credit..."
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

                <!-- Credit Summary -->
                <div class="card bg-light mb-4" *ngIf="creditForm.valid">
                  <div class="card-body">
                    <h6 class="card-title">Credit Summary</h6>
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
                        <strong>Credit Amount:</strong>
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
                    class="btn btn-success"
                    [disabled]="creditForm.invalid || loading"
                  >
                    <span
                      *ngIf="loading"
                      class="spinner-border spinner-border-sm me-2"
                      role="status"
                      aria-hidden="true"
                    ></span>
                    <i *ngIf="!loading" class="bi bi-plus-circle me-2"></i>
                    {{ loading ? 'Processing...' : 'Credit Account' }}
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
      .customer-deposit {
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
        .customer-deposit {
          padding: 1rem;
        }
      }
    `,
  ],
})
export class CustomerDepositComponent implements OnInit {
  creditForm: FormGroup;
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
    this.creditForm = this.initializeForm();
  }

  ngOnInit(): void {
    this.preSelectedAccountId = this.route.snapshot.paramMap.get('accountId');
    this.loadCustomerAccounts();
  }

  private initializeForm(): FormGroup {
    return this.fb.group({
      accountId: ['', [Validators.required]],
      amount: ['', [Validators.required, Validators.min(0.01)]],
      description: ['', [Validators.required, Validators.minLength(3)]],
    });
  }

  private loadCustomerAccounts(): void {
    this.loading = true;
    this.errorMessage = '';

    console.log('🔍 Loading customer accounts...');
    console.log('🔍 Current user:', this.authService.getCurrentUser());
    console.log('🔍 Is authenticated:', this.authService.isAuthenticated());

    this.accountService.getCustomerAccounts().subscribe({
      next: (accounts) => {
        console.log('✅ Received accounts:', accounts);
        console.log('✅ Number of accounts:', accounts?.length || 0);

        this.accounts = accounts.filter(
          (account) =>
            account.status === 'ACTIVATED' || account.status === 'CREATED'
        );

        console.log('✅ Filtered activated accounts:', this.accounts);
        console.log('✅ Number of activated accounts:', this.accounts.length);

        if (this.accounts.length === 0) {
          this.errorMessage =
            'No active accounts found. Please contact support to create an account.';
        }

        // Pre-select account if provided in route
        if (this.preSelectedAccountId && this.accounts.length > 0) {
          const account = this.accounts.find(
            (acc) => acc.id === this.preSelectedAccountId
          );
          if (account) {
            this.creditForm.patchValue({ accountId: account.id });
          }
        }

        this.loading = false;
      },
      error: (error) => {
        console.error('❌ Error loading customer accounts:', error);
        console.error('❌ Error status:', error.status);
        console.error('❌ Error message:', error.message);
        console.error('❌ Error details:', error.error);

        if (error.status === 401) {
          this.errorMessage = 'Authentication failed. Please login again.';
        } else if (error.status === 403) {
          this.errorMessage = 'Access denied. Please check your permissions.';
        } else {
          this.errorMessage = 'Failed to load your accounts. Please try again.';
        }
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
    const accountId = this.creditForm.get('accountId')?.value;
    return this.accounts.find((account) => account.id === accountId);
  }

  getNewBalance(): number {
    const selectedAccount = this.getSelectedAccount();
    const amount = this.creditForm.get('amount')?.value || 0;
    return selectedAccount ? selectedAccount.balance + amount : 0;
  }

  onSubmit(): void {
    if (this.creditForm.invalid) {
      this.creditForm.markAllAsTouched();
      return;
    }

    this.loading = true;
    this.errorMessage = '';
    this.successMessage = '';

    const creditRequest: CreditRequest = {
      amount: this.creditForm.value.amount,
      description: this.creditForm.value.description,
    };

    this.bankingApiService
      .credit(
        this.creditForm.value.accountId,
        creditRequest.amount,
        creditRequest.description
      )
      .subscribe({
        next: () => {
          this.loading = false;
          this.successMessage = `Credit completed successfully!`;
          this.creditForm.reset();

          // Redirect to accounts page after 3 seconds
          setTimeout(() => {
            this.router.navigate(['/customer/accounts']);
          }, 3000);
        },
        error: (error) => {
          this.loading = false;
          this.errorMessage =
            error.error?.message || 'Credit failed. Please try again.';
          console.error('Credit error:', error);
        },
      });
  }

  goBack(): void {
    this.router.navigate(['/customer/dashboard']);
  }

  // Getter methods for form controls
  get accountId() {
    return this.creditForm.get('accountId');
  }
  get amount() {
    return this.creditForm.get('amount');
  }
  get description() {
    return this.creditForm.get('description');
  }
}
