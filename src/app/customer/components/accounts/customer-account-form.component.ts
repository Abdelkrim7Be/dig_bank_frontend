import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { Observable } from 'rxjs';
import { BankingApiService } from '../../../core/services/banking-api.service';
import { AuthService } from '../../../auth/services/auth.service';
import { AccountService } from '../../../shared/services/account.service';
import {
  CurrentBankAccountDTO,
  SavingBankAccountDTO,
} from '../../../shared/models/banking-dtos.model';

@Component({
  selector: 'app-customer-account-form',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule],
  template: `
    <div class="customer-account-form">
      <!-- Header -->
      <div class="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 class="h4 mb-1">Open New Account</h2>
          <p class="text-muted mb-0">Create a new bank account</p>
        </div>
        <button class="btn btn-outline-secondary" (click)="goBack()">
          <i class="bi bi-arrow-left me-2"></i>Back
        </button>
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

      <!-- Account Form -->
      <div class="row">
        <div class="col-lg-8 mx-auto">
          <div class="card border-0 shadow-sm">
            <div class="card-header bg-primary text-white">
              <h5 class="card-title mb-0">
                <i class="bi bi-plus-circle me-2"></i>
                Account Information
              </h5>
            </div>
            <div class="card-body">
              <form [formGroup]="accountForm" (ngSubmit)="onSubmit()">
                <!-- Account Type -->
                <div class="mb-3">
                  <label for="accountType" class="form-label"
                    >Account Type</label
                  >
                  <select
                    class="form-select"
                    id="accountType"
                    formControlName="accountType"
                    [class.is-invalid]="
                      accountType?.invalid && accountType?.touched
                    "
                  >
                    <option value="">Choose account type...</option>
                    <option value="CURRENT">Checking Account</option>
                    <option value="SAVING">Savings Account</option>
                  </select>
                  <div
                    *ngIf="accountType?.invalid && accountType?.touched"
                    class="invalid-feedback"
                  >
                    Please select an account type.
                  </div>
                </div>

                <!-- Initial Balance -->
                <div class="mb-3">
                  <label for="initialBalance" class="form-label"
                    >Initial Balance</label
                  >
                  <div class="input-group">
                    <span class="input-group-text">$</span>
                    <input
                      type="number"
                      class="form-control"
                      id="initialBalance"
                      formControlName="initialBalance"
                      placeholder="0.00"
                      step="0.01"
                      min="0"
                      [class.is-invalid]="
                        initialBalance?.invalid && initialBalance?.touched
                      "
                    />
                  </div>
                  <div
                    *ngIf="initialBalance?.invalid && initialBalance?.touched"
                    class="invalid-feedback"
                  >
                    <div *ngIf="initialBalance?.errors?.['required']">
                      Initial balance is required.
                    </div>
                    <div *ngIf="initialBalance?.errors?.['min']">
                      Initial balance must be at least $0.00.
                    </div>
                  </div>
                  <div class="form-text">Minimum initial balance: $0.00</div>
                </div>

                <!-- Overdraft (for Current Account) -->
                <div class="mb-3" *ngIf="accountType?.value === 'CURRENT'">
                  <label for="overdraft" class="form-label"
                    >Overdraft Limit</label
                  >
                  <div class="input-group">
                    <span class="input-group-text">$</span>
                    <input
                      type="number"
                      class="form-control"
                      id="overdraft"
                      formControlName="overdraft"
                      placeholder="0.00"
                      step="0.01"
                      min="0"
                      [class.is-invalid]="
                        overdraft?.invalid && overdraft?.touched
                      "
                    />
                  </div>
                  <div
                    *ngIf="overdraft?.invalid && overdraft?.touched"
                    class="invalid-feedback"
                  >
                    <div *ngIf="overdraft?.errors?.['min']">
                      Overdraft limit must be at least $0.00.
                    </div>
                  </div>
                  <div class="form-text">
                    Optional overdraft protection for checking accounts
                  </div>
                </div>

                <!-- Interest Rate (for Savings Account) -->
                <div class="mb-3" *ngIf="accountType?.value === 'SAVING'">
                  <label for="interestRate" class="form-label"
                    >Interest Rate (%)</label
                  >
                  <div class="input-group">
                    <input
                      type="number"
                      class="form-control"
                      id="interestRate"
                      formControlName="interestRate"
                      placeholder="2.5"
                      step="0.01"
                      min="0"
                      max="10"
                      [class.is-invalid]="
                        interestRate?.invalid && interestRate?.touched
                      "
                    />
                    <span class="input-group-text">%</span>
                  </div>
                  <div
                    *ngIf="interestRate?.invalid && interestRate?.touched"
                    class="invalid-feedback"
                  >
                    <div *ngIf="interestRate?.errors?.['min']">
                      Interest rate must be at least 0%.
                    </div>
                    <div *ngIf="interestRate?.errors?.['max']">
                      Interest rate cannot exceed 10%.
                    </div>
                  </div>
                  <div class="form-text">
                    Annual interest rate for savings accounts (0% - 10%)
                  </div>
                </div>

                <!-- Account Summary -->
                <div class="card bg-light mb-4" *ngIf="accountForm.valid">
                  <div class="card-body">
                    <h6 class="card-title">Account Summary</h6>
                    <div class="row">
                      <div class="col-md-6">
                        <strong>Account Type:</strong>
                        {{ getAccountTypeDisplay() }}<br />
                        <strong>Initial Balance:</strong>
                        {{
                          initialBalance?.value
                            | currency : 'USD' : 'symbol' : '1.2-2'
                        }}<br />
                      </div>
                      <div class="col-md-6">
                        <div *ngIf="accountType?.value === 'CURRENT'">
                          <strong>Overdraft Limit:</strong>
                          {{
                            overdraft?.value
                              | currency : 'USD' : 'symbol' : '1.2-2'
                          }}
                        </div>
                        <div *ngIf="accountType?.value === 'SAVING'">
                          <strong>Interest Rate:</strong>
                          {{ interestRate?.value }}% per year
                        </div>
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
                    [disabled]="accountForm.invalid || loading"
                  >
                    <span
                      *ngIf="loading"
                      class="spinner-border spinner-border-sm me-2"
                      role="status"
                      aria-hidden="true"
                    ></span>
                    <i *ngIf="!loading" class="bi bi-plus-circle me-2"></i>
                    {{ loading ? 'Creating...' : 'Create Account' }}
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
      .customer-account-form {
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
        .customer-account-form {
          padding: 1rem;
        }
      }
    `,
  ],
})
export class CustomerAccountFormComponent implements OnInit {
  accountForm: FormGroup;
  loading = false;
  errorMessage = '';
  successMessage = '';

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private bankingApiService: BankingApiService,
    private authService: AuthService,
    private accountService: AccountService
  ) {
    this.accountForm = this.initializeForm();
  }

  ngOnInit(): void {
    // Get customer information when component loads
    this.loadCustomerInfo();
  }

  private loadCustomerInfo(): void {
    // Use the account service to get customer accounts, which will give us the customer ID
    this.accountService.getCustomerAccounts().subscribe({
      next: (accounts) => {
        console.log(
          '✅ [ACCOUNT CREATION] Customer accounts loaded:',
          accounts
        );
        console.log(
          '✅ [ACCOUNT CREATION] Number of accounts:',
          accounts?.length || 0
        );

        if (accounts && accounts.length > 0) {
          // Extract customer ID from the first account
          const firstAccount = accounts[0];
          console.log(
            '✅ [ACCOUNT CREATION] First account structure:',
            firstAccount
          );
          console.log(
            '✅ [ACCOUNT CREATION] Available properties:',
            Object.keys(firstAccount)
          );

          // Try to get customer ID from the account
          let foundCustomerId = null;
          if (firstAccount.customerDTO?.id) {
            foundCustomerId = firstAccount.customerDTO.id;
            console.log(
              '✅ [ACCOUNT CREATION] Found customerDTO.id:',
              foundCustomerId
            );
          } else if (firstAccount.customerId) {
            foundCustomerId = firstAccount.customerId;
            console.log(
              '✅ [ACCOUNT CREATION] Found customerId:',
              foundCustomerId
            );
          } else {
            // Let's check what customer-related fields exist
            console.log(
              '🔍 [ACCOUNT CREATION] Checking for customer fields...'
            );
            console.log(
              '🔍 [ACCOUNT CREATION] customerId:',
              firstAccount.customerId
            );
            console.log(
              '🔍 [ACCOUNT CREATION] customerDTO:',
              firstAccount.customerDTO
            );
            console.log(
              '🔍 [ACCOUNT CREATION] customerName:',
              firstAccount.customerName
            );

            // Check if there's any field that contains customer info
            Object.keys(firstAccount).forEach((key) => {
              if (key.toLowerCase().includes('customer')) {
                console.log(
                  `🔍 [ACCOUNT CREATION] Found customer field ${key}:`,
                  (firstAccount as any)[key]
                );
              }
            });
          }

          if (foundCustomerId) {
            console.log(
              '✅ [ACCOUNT CREATION] Storing customer ID:',
              foundCustomerId
            );
            // Store the customer ID for later use
            (this as any).customerIdFromAccounts = foundCustomerId;
          } else {
            console.log(
              '❌ [ACCOUNT CREATION] No customer ID found in account object'
            );
          }
        } else {
          console.log('❌ [ACCOUNT CREATION] No accounts found for customer');
        }
      },
      error: (error) => {
        console.error(
          '❌ [ACCOUNT CREATION] Error loading customer info:',
          error
        );
        // This is not critical, we'll try other methods during account creation
      },
    });
  }

  private initializeForm(): FormGroup {
    return this.fb.group({
      accountType: ['', [Validators.required]],
      initialBalance: [0, [Validators.required, Validators.min(0)]],
      overdraft: [0, [Validators.min(0)]],
      interestRate: [2.5, [Validators.min(0), Validators.max(10)]],
    });
  }

  getAccountTypeDisplay(): string {
    const type = this.accountForm.get('accountType')?.value;
    switch (type) {
      case 'CURRENT':
        return 'Checking Account';
      case 'SAVING':
        return 'Savings Account';
      default:
        return '';
    }
  }

  onSubmit(): void {
    if (this.accountForm.invalid) {
      this.accountForm.markAllAsTouched();
      return;
    }

    this.loading = true;
    this.errorMessage = '';
    this.successMessage = '';

    const currentUser = this.authService.getCurrentUser();
    console.log('🔍 [ACCOUNT CREATION] Current user:', currentUser);

    if (!currentUser) {
      this.errorMessage = 'User not authenticated. Please login again.';
      this.loading = false;
      return;
    }

    // Get customer ID from the user object
    let customerId = currentUser.id;

    // If the user ID is 0 or undefined, try to get it from the customer relationship
    if (!customerId || customerId === 0) {
      console.log(
        '⚠️ [ACCOUNT CREATION] User ID is 0 or undefined, trying alternative methods'
      );

      // Try to get customer ID from existing accounts first
      if ((this as any).customerIdFromAccounts) {
        customerId = (this as any).customerIdFromAccounts;
        console.log(
          '✅ [ACCOUNT CREATION] Found customer ID from existing accounts:',
          customerId
        );
      } else {
        // If still no customer ID, show error
        this.errorMessage =
          'Customer information not found. Please contact support or try logging in again.';
        this.loading = false;
        return;
      }
    }

    console.log('✅ [ACCOUNT CREATION] Using customer ID:', customerId);

    const formValue = this.accountForm.value;
    const initialBalance = formValue.initialBalance;

    let createAccount$: Observable<
      CurrentBankAccountDTO | SavingBankAccountDTO
    >;
    if (formValue.accountType === 'CURRENT') {
      const overdraft = formValue.overdraft || 0;
      createAccount$ = this.bankingApiService.createCurrentAccount(
        initialBalance,
        overdraft,
        customerId
      );
    } else {
      const interestRate = formValue.interestRate || 2.5;
      createAccount$ = this.bankingApiService.createSavingAccount(
        initialBalance,
        interestRate,
        customerId
      );
    }

    createAccount$.subscribe({
      next: () => {
        this.loading = false;
        this.successMessage = `${this.getAccountTypeDisplay()} created successfully!`;
        this.accountForm.reset();

        // Redirect to accounts page after 3 seconds
        setTimeout(() => {
          this.router.navigate(['/customer/accounts']);
        }, 3000);
      },
      error: (error: any) => {
        this.loading = false;
        this.errorMessage =
          error.error?.message || 'Failed to create account. Please try again.';
        console.error('Account creation error:', error);
      },
    });
  }

  goBack(): void {
    this.router.navigate(['/customer/accounts']);
  }

  // Getter methods for form controls
  get accountType() {
    return this.accountForm.get('accountType');
  }
  get initialBalance() {
    return this.accountForm.get('initialBalance');
  }
  get overdraft() {
    return this.accountForm.get('overdraft');
  }
  get interestRate() {
    return this.accountForm.get('interestRate');
  }
}
