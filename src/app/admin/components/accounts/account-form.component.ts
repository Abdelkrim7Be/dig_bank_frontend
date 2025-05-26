import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';
import { AdminCustomerService } from '../../services/customer.service';
import {
  AdminAccountService,
  CreateAccountRequest,
  BankAccount,
} from '../../services/account.service';
import { User } from '../../../auth/models/auth.model';

@Component({
  selector: 'app-admin-account-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  template: `
    <div class="container-fluid mt-4">
      <div class="row justify-content-center">
        <div class="col-md-8">
          <div class="card shadow-sm">
            <div class="card-header bg-light">
              <div class="d-flex justify-content-between align-items-center">
                <h5 class="mb-0">
                  {{
                    isEditMode ? 'Edit Bank Account' : 'Create New Bank Account'
                  }}
                </h5>
                <a
                  routerLink="/admin/accounts"
                  class="btn btn-outline-secondary"
                >
                  <i class="bi bi-arrow-left me-1"></i> Back to Accounts
                </a>
              </div>
            </div>
            <div class="card-body">
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

              <!-- Success Alert -->
              @if (success) {
              <div
                class="alert alert-success alert-dismissible fade show"
                role="alert"
              >
                {{ success }}
                <button
                  type="button"
                  class="btn-close"
                  (click)="success = null"
                ></button>
              </div>
              }

              <!-- Loading Spinner -->
              @if (loading) {
              <div class="text-center py-4">
                <div class="spinner-border text-primary" role="status">
                  <span class="visually-hidden">Loading...</span>
                </div>
              </div>
              }

              <!-- Account Form -->
              @if (!loading) {
              <form [formGroup]="accountForm" (ngSubmit)="onSubmit()">
                <!-- Customer Selection -->
                <div class="mb-3">
                  <label for="customerId" class="form-label">Customer *</label>
                  <select
                    id="customerId"
                    formControlName="customerId"
                    class="form-select"
                    [class.is-invalid]="
                      accountForm.get('customerId')?.invalid &&
                      accountForm.get('customerId')?.touched
                    "
                  >
                    <option value="">Select a customer</option>
                    <option
                      *ngFor="let customer of customers"
                      [value]="customer.id"
                    >
                      {{ customer.firstName }} {{ customer.lastName }} ({{
                        customer.email
                      }})
                    </option>
                  </select>
                  @if (accountForm.get('customerId')?.invalid &&
                  accountForm.get('customerId')?.touched) {
                  <div class="invalid-feedback">Please select a customer</div>
                  }
                </div>

                <!-- Account Type -->
                <div class="mb-3">
                  <label for="accountType" class="form-label"
                    >Account Type *</label
                  >
                  <select
                    id="accountType"
                    formControlName="accountType"
                    class="form-select"
                    [class.is-invalid]="
                      accountForm.get('accountType')?.invalid &&
                      accountForm.get('accountType')?.touched
                    "
                    (change)="onAccountTypeChange()"
                  >
                    <option value="">Select account type</option>
                    <option value="CURRENT">Current Account</option>
                    <option value="SAVING">Savings Account</option>
                  </select>
                  @if (accountForm.get('accountType')?.invalid &&
                  accountForm.get('accountType')?.touched) {
                  <div class="invalid-feedback">
                    Please select an account type
                  </div>
                  }
                </div>

                <!-- Initial Balance -->
                <div class="mb-3">
                  <label for="initialBalance" class="form-label"
                    >Initial Balance *</label
                  >
                  <div class="input-group">
                    <span class="input-group-text">$</span>
                    <input
                      type="number"
                      id="initialBalance"
                      formControlName="initialBalance"
                      class="form-control"
                      [class.is-invalid]="
                        accountForm.get('initialBalance')?.invalid &&
                        accountForm.get('initialBalance')?.touched
                      "
                      placeholder="0.00"
                      step="0.01"
                      min="0"
                    />
                  </div>
                  @if (accountForm.get('initialBalance')?.invalid &&
                  accountForm.get('initialBalance')?.touched) {
                  <div class="invalid-feedback">
                    @if
                    (accountForm.get('initialBalance')?.errors?.['required']) {
                    <div>Initial balance is required</div>
                    } @if (accountForm.get('initialBalance')?.errors?.['min']) {
                    <div>Initial balance must be at least $0</div>
                    }
                  </div>
                  }
                </div>

                <!-- Current Account Specific Fields -->
                @if (accountForm.get('accountType')?.value === 'CURRENT') {
                <div class="mb-3">
                  <label for="overdraft" class="form-label"
                    >Overdraft Limit</label
                  >
                  <div class="input-group">
                    <span class="input-group-text">$</span>
                    <input
                      type="number"
                      id="overdraft"
                      formControlName="overdraft"
                      class="form-control"
                      placeholder="0.00"
                      step="0.01"
                      min="0"
                    />
                  </div>
                  <div class="form-text">
                    Maximum amount that can be withdrawn beyond the account
                    balance
                  </div>
                </div>
                }

                <!-- Savings Account Specific Fields -->
                @if (accountForm.get('accountType')?.value === 'SAVING') {
                <div class="mb-3">
                  <label for="interestRate" class="form-label"
                    >Interest Rate (%)</label
                  >
                  <div class="input-group">
                    <input
                      type="number"
                      id="interestRate"
                      formControlName="interestRate"
                      class="form-control"
                      placeholder="0.00"
                      step="0.01"
                      min="0"
                      max="100"
                    />
                    <span class="input-group-text">%</span>
                  </div>
                  <div class="form-text">
                    Annual interest rate for the savings account
                  </div>
                </div>
                }

                <!-- Description -->
                <div class="mb-3">
                  <label for="description" class="form-label"
                    >Description</label
                  >
                  <textarea
                    id="description"
                    formControlName="description"
                    class="form-control"
                    rows="3"
                    placeholder="Optional description for the account"
                  ></textarea>
                </div>

                <!-- Form Actions -->
                <div class="d-flex justify-content-end gap-2">
                  <button
                    type="button"
                    class="btn btn-outline-secondary"
                    routerLink="/admin/accounts"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    class="btn btn-primary"
                    [disabled]="accountForm.invalid || submitting"
                  >
                    @if (submitting) {
                    <span
                      class="spinner-border spinner-border-sm me-2"
                      role="status"
                    ></span>
                    } {{ isEditMode ? 'Update Account' : 'Create Account' }}
                  </button>
                </div>
              </form>
              }
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
        box-shadow: 0 0.125rem 0.25rem rgba(0, 0, 0, 0.075);
      }

      .form-label {
        font-weight: 500;
        color: #495057;
      }

      .btn {
        border-radius: 0.375rem;
      }

      .alert {
        border-radius: 0.5rem;
      }

      .input-group-text {
        background-color: #f8f9fa;
        border-color: #dee2e6;
      }
    `,
  ],
})
export class AdminAccountFormComponent implements OnInit {
  accountForm!: FormGroup;
  customers: User[] = [];
  loading = false;
  submitting = false;
  error: string | null = null;
  success: string | null = null;
  isEditMode = false;
  accountId: string | null = null;
  currentAccount: BankAccount | null = null;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    private customerService: AdminCustomerService,
    private accountService: AdminAccountService
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.checkEditMode();
    this.loadCustomers();
  }

  private initForm(): void {
    this.accountForm = this.fb.group({
      customerId: ['', [Validators.required]],
      accountType: ['', [Validators.required]],
      initialBalance: [0, [Validators.required, Validators.min(0)]],
      overdraft: [0],
      interestRate: [0],
      description: [''],
    });
  }

  private checkEditMode(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEditMode = true;
      this.accountId = id;
      this.loadAccount();
    }
  }

  private loadAccount(): void {
    if (!this.accountId) return;

    this.loading = true;
    this.accountService.getAccountById(this.accountId).subscribe({
      next: (account) => {
        this.currentAccount = account;
        this.populateForm(account);
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Failed to load account details';
        console.error('Error loading account:', err);
        this.loading = false;
      },
    });
  }

  private populateForm(account: BankAccount): void {
    this.accountForm.patchValue({
      customerId: account.customerDTO?.id || '',
      accountType: account.type,
      initialBalance: account.balance,
      overdraft: 0, // These might not be available in the account object
      interestRate: 0,
      description: '',
    });

    // Disable customer selection in edit mode
    this.accountForm.get('customerId')?.disable();
    this.accountForm.get('accountType')?.disable();
  }

  private loadCustomers(): void {
    this.loading = true;
    this.customerService.getCustomers().subscribe({
      next: (response) => {
        this.customers = response.content || [];
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Failed to load customers';
        console.error('Error loading customers:', err);
        this.loading = false;
      },
    });
  }

  onAccountTypeChange(): void {
    const accountType = this.accountForm.get('accountType')?.value;

    if (accountType === 'CURRENT') {
      this.accountForm.get('overdraft')?.setValidators([Validators.min(0)]);
      this.accountForm.get('interestRate')?.clearValidators();
    } else if (accountType === 'SAVING') {
      this.accountForm
        .get('interestRate')
        ?.setValidators([Validators.min(0), Validators.max(100)]);
      this.accountForm.get('overdraft')?.clearValidators();
    }

    this.accountForm.get('overdraft')?.updateValueAndValidity();
    this.accountForm.get('interestRate')?.updateValueAndValidity();
  }

  onSubmit(): void {
    if (this.accountForm.invalid) {
      this.accountForm.markAllAsTouched();
      return;
    }

    this.submitting = true;
    this.error = null;

    const formData = this.accountForm.value;

    const accountRequest: CreateAccountRequest = {
      customerId: formData.customerId,
      accountType: formData.accountType,
      initialBalance: formData.initialBalance,
      overdraft: formData.overdraft || 0,
      interestRate: formData.interestRate || 0,
      description: formData.description,
    };

    console.log('AccountFormComponent.onSubmit() - Form data:', formData);
    console.log(
      'AccountFormComponent.onSubmit() - Account request:',
      accountRequest
    );
    console.log(
      'AccountFormComponent.onSubmit() - Current user:',
      localStorage.getItem('current_user')
    );
    console.log(
      'AccountFormComponent.onSubmit() - Token:',
      localStorage.getItem('digital-banking-token')
    );

    if (this.isEditMode && this.accountId) {
      // Update existing account (limited functionality)
      this.accountService
        .updateAccountStatus(this.accountId, 'ACTIVATED')
        .subscribe({
          next: () => {
            this.success = 'Account updated successfully!';
            this.submitting = false;
            setTimeout(() => {
              this.router.navigate(['/admin/accounts']);
            }, 1500);
          },
          error: (err) => {
            this.error = 'Failed to update account. Please try again.';
            console.error('Error updating account:', err);
            this.submitting = false;
          },
        });
    } else {
      // Create new account
      this.accountService.createAccount(accountRequest).subscribe({
        next: () => {
          this.success = 'Bank account created successfully!';
          this.submitting = false;
          setTimeout(() => {
            this.router.navigate(['/admin/accounts']);
          }, 1500);
        },
        error: (err) => {
          this.error = 'Failed to create account. Please try again.';
          console.error(
            'AccountFormComponent.onSubmit() - Error creating account:',
            err
          );
          console.error('AccountFormComponent.onSubmit() - Error details:', {
            status: err.status,
            statusText: err.statusText,
            url: err.url,
            message: err.message,
            error: err.error,
          });
          this.submitting = false;
        },
      });
    }
  }
}
