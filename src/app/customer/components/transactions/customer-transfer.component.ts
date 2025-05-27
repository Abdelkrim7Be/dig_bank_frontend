import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
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

interface TransferRequest {
  sourceAccountId: string;
  destinationAccountId: string;
  amount: number;
  description: string;
}

@Component({
  selector: 'app-customer-transfer',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule],
  template: `
    <div class="customer-transfer">
      <!-- Header -->
      <div class="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 class="h4 mb-1">Transfer Funds</h2>
          <p class="text-muted mb-0">Transfer money between accounts</p>
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

      <!-- Transfer Form -->
      <div *ngIf="!loading || accounts.length" class="row">
        <div class="col-lg-8 mx-auto">
          <div class="card border-0 shadow-sm">
            <div class="card-header bg-primary text-white">
              <h5 class="card-title mb-0">
                <i class="bi bi-arrow-left-right me-2"></i>
                Transfer Funds
              </h5>
            </div>
            <div class="card-body">
              <form [formGroup]="transferForm" (ngSubmit)="onSubmit()">
                <!-- From Account Selection -->
                <div class="mb-3">
                  <label for="fromAccountId" class="form-label"
                    >From Account</label
                  >
                  <select
                    class="form-select"
                    id="fromAccountId"
                    formControlName="fromAccountId"
                    [class.is-invalid]="
                      fromAccountId?.invalid && fromAccountId?.touched
                    "
                  >
                    <option value="">Choose source account...</option>
                    <option
                      *ngFor="let account of accounts"
                      [value]="account.id"
                    >
                      {{ formatAccountDisplay(account) }}
                    </option>
                  </select>
                  <div
                    *ngIf="fromAccountId?.invalid && fromAccountId?.touched"
                    class="invalid-feedback"
                  >
                    Please select a source account.
                  </div>
                </div>

                <!-- To Account ID Input -->
                <div class="mb-3">
                  <label for="toAccountId" class="form-label"
                    >To Account ID</label
                  >
                  <input
                    type="text"
                    class="form-control"
                    id="toAccountId"
                    formControlName="toAccountId"
                    placeholder="Enter destination account ID..."
                    [class.is-invalid]="
                      toAccountId?.invalid && toAccountId?.touched
                    "
                  />
                  <div
                    *ngIf="toAccountId?.invalid && toAccountId?.touched"
                    class="invalid-feedback"
                  >
                    <div *ngIf="toAccountId?.errors?.['required']">
                      Destination account ID is required.
                    </div>
                    <div *ngIf="toAccountId?.errors?.['sameAccount']">
                      Cannot transfer to the same account.
                    </div>
                  </div>
                  <div class="form-text">
                    Enter the account ID of the recipient account
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
                    placeholder="Enter a description for this transfer..."
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

                <!-- Transfer Summary -->
                <div
                  class="card bg-light mb-4"
                  *ngIf="transferForm.valid && !hasInsufficientFunds()"
                >
                  <div class="card-body">
                    <h6 class="card-title">Transfer Summary</h6>
                    <div class="row">
                      <div class="col-md-6">
                        <strong>From Account:</strong>
                        {{ getSelectedAccount()?.id }}<br />
                        <strong>Current Balance:</strong>
                        {{
                          getSelectedAccount()?.balance
                            | currency : 'USD' : 'symbol' : '1.2-2'
                        }}<br />
                      </div>
                      <div class="col-md-6">
                        <strong>To Account:</strong>
                        {{ toAccountId?.value }}<br />
                        <strong>Transfer Amount:</strong>
                        {{
                          amount?.value | currency : 'USD' : 'symbol' : '1.2-2'
                        }}<br />
                      </div>
                    </div>
                    <hr />
                    <div class="row">
                      <div class="col-md-6">
                        <strong>Remaining Balance:</strong>
                        {{
                          getRemainingBalance()
                            | currency : 'USD' : 'symbol' : '1.2-2'
                        }}
                      </div>
                      <div class="col-md-6">
                        <strong>Description:</strong> {{ description?.value }}
                      </div>
                    </div>
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
                    class="btn btn-primary"
                    [disabled]="
                      transferForm.invalid || loading || hasInsufficientFunds()
                    "
                  >
                    <span
                      *ngIf="loading"
                      class="spinner-border spinner-border-sm me-2"
                      role="status"
                      aria-hidden="true"
                    ></span>
                    <i *ngIf="!loading" class="bi bi-arrow-left-right me-2"></i>
                    {{ loading ? 'Processing...' : 'Transfer Funds' }}
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
      .customer-transfer {
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
        .customer-transfer {
          padding: 1rem;
        }
      }
    `,
  ],
})
export class CustomerTransferComponent implements OnInit {
  transferForm: FormGroup;
  loading = false;
  errorMessage = '';
  successMessage = '';
  accounts: BankAccount[] = [];

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private bankingApiService: BankingApiService,
    private accountService: AccountService,
    private authService: AuthService
  ) {
    this.transferForm = this.initializeForm();
  }

  ngOnInit(): void {
    this.loadCustomerAccounts();
  }

  private initializeForm(): FormGroup {
    const form = this.fb.group({
      fromAccountId: ['', [Validators.required]],
      toAccountId: ['', [Validators.required]],
      amount: ['', [Validators.required, Validators.min(0.01)]],
      description: ['', [Validators.required, Validators.minLength(3)]],
    });

    // Add custom validators
    form.get('amount')?.valueChanges.subscribe(() => {
      this.validateAmount();
    });

    form.get('fromAccountId')?.valueChanges.subscribe(() => {
      this.validateAmount();
      this.validateSameAccount();
    });

    form.get('toAccountId')?.valueChanges.subscribe(() => {
      this.validateSameAccount();
    });

    return form;
  }

  private validateAmount(): void {
    const amountControl = this.transferForm.get('amount');
    const fromAccountId = this.transferForm.get('fromAccountId')?.value;
    const amount = amountControl?.value;

    if (amountControl && fromAccountId && amount) {
      const selectedAccount = this.accounts.find(
        (acc) => acc.id === fromAccountId
      );
      if (selectedAccount && amount > selectedAccount.balance) {
        amountControl.setErrors({ insufficientFunds: true });
      } else if (amountControl.errors?.['insufficientFunds']) {
        const errors = { ...amountControl.errors };
        delete errors['insufficientFunds'];
        amountControl.setErrors(Object.keys(errors).length ? errors : null);
      }
    }
  }

  private validateSameAccount(): void {
    const toAccountControl = this.transferForm.get('toAccountId');
    const fromAccountId = this.transferForm.get('fromAccountId')?.value;
    const toAccountId = toAccountControl?.value;

    if (
      toAccountControl &&
      fromAccountId &&
      toAccountId &&
      fromAccountId === toAccountId
    ) {
      toAccountControl.setErrors({ sameAccount: true });
    } else if (toAccountControl?.errors?.['sameAccount']) {
      const errors = { ...toAccountControl.errors };
      delete errors['sameAccount'];
      toAccountControl.setErrors(Object.keys(errors).length ? errors : null);
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
    const accountId = this.transferForm.get('fromAccountId')?.value;
    return this.accounts.find((account) => account.id === accountId);
  }

  getRemainingBalance(): number {
    const selectedAccount = this.getSelectedAccount();
    const amount = this.transferForm.get('amount')?.value || 0;
    return selectedAccount ? selectedAccount.balance - amount : 0;
  }

  hasInsufficientFunds(): boolean {
    return (
      this.transferForm.get('amount')?.errors?.['insufficientFunds'] || false
    );
  }

  onSubmit(): void {
    if (this.transferForm.invalid || this.hasInsufficientFunds()) {
      this.transferForm.markAllAsTouched();
      return;
    }

    this.loading = true;
    this.errorMessage = '';
    this.successMessage = '';

    const transferRequest: TransferRequest = {
      sourceAccountId: this.transferForm.value.fromAccountId,
      destinationAccountId: this.transferForm.value.toAccountId,
      amount: this.transferForm.value.amount,
      description: this.transferForm.value.description,
    };

    this.bankingApiService.transfer(transferRequest).subscribe({
      next: () => {
        this.loading = false;
        this.successMessage = `Transfer completed successfully!`;
        this.transferForm.reset();

        // Redirect to accounts page after 3 seconds
        setTimeout(() => {
          this.router.navigate(['/customer/accounts']);
        }, 3000);
      },
      error: (error) => {
        this.loading = false;
        this.errorMessage =
          error.error?.message || 'Transfer failed. Please try again.';
        console.error('Transfer error:', error);
      },
    });
  }

  goBack(): void {
    this.router.navigate(['/customer/dashboard']);
  }

  // Getter methods for form controls
  get fromAccountId() {
    return this.transferForm.get('fromAccountId');
  }
  get toAccountId() {
    return this.transferForm.get('toAccountId');
  }
  get amount() {
    return this.transferForm.get('amount');
  }
  get description() {
    return this.transferForm.get('description');
  }
}
