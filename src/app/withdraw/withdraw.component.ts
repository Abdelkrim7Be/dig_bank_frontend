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
import { Account, WithdrawalRequest } from '../shared/models/account.model';

import { InlineAlertComponent } from '../shared/components/inline-alert/inline-alert.component';

@Component({
  selector: 'app-withdraw',
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
              <li class="breadcrumb-item active">Withdraw Money</li>
            </ol>
          </nav>
          <h2 class="mb-1">Withdraw Money</h2>
          <p class="text-muted mb-0">Withdraw funds from your account</p>
        </div>
      </div>

      <div class="row justify-content-center">
        <div class="col-lg-6">
          <!-- Withdrawal Form -->
          <div class="card">
            <div class="card-header">
              <h5 class="mb-0">
                <i class="bi bi-dash-circle me-2 text-warning"></i>
                Withdrawal Details
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

              <form [formGroup]="withdrawForm" (ngSubmit)="onSubmit()">
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
                    <option value="">Choose account to withdraw from</option>
                    <option
                      *ngFor="let account of accounts"
                      [value]="account.id"
                    >
                      {{ account.accountNumber }} -
                      {{ getAccountTypeDisplay(account.accountType) }}
                      (Available:
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
                    >Withdrawal Amount *</label
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
                      Amount exceeds available balance
                    </div>
                    <div *ngIf="amount?.errors?.['dailyLimit']">
                      Amount exceeds daily withdrawal limit
                    </div>
                  </div>
                  <div class="form-text" *ngIf="getSelectedAccount()">
                    Available balance:
                    {{
                      getSelectedAccount()?.balance
                        | currency : 'USD' : 'symbol' : '1.2-2'
                    }}
                    | Daily limit: $1,000.00
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
                    placeholder="Enter withdrawal description"
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

                <!-- Withdrawal Summary -->
                <div class="card bg-light mb-4" *ngIf="withdrawForm.valid">
                  <div class="card-body">
                    <h6 class="card-title">Withdrawal Summary</h6>
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
                        <strong>Withdrawal Amount:</strong>
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
                  <strong>Warning:</strong> This withdrawal will leave your
                  account with a low balance.
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
                    [disabled]="withdrawForm.invalid || loading"
                  >
                    <span
                      *ngIf="loading"
                      class="spinner-border spinner-border-sm me-2"
                    ></span>
                    <i class="bi bi-dash-circle me-2" *ngIf="!loading"></i>
                    {{ loading ? 'Processing...' : 'Withdraw Money' }}
                  </button>
                </div>
              </form>
            </div>
          </div>

          <!-- Withdrawal Methods Info -->
          <div class="card mt-4">
            <div class="card-header">
              <h6 class="mb-0">
                <i class="bi bi-info-circle me-2"></i>
                Withdrawal Methods
              </h6>
            </div>
            <div class="card-body">
              <div class="row">
                <div class="col-md-6">
                  <h6><i class="bi bi-credit-card me-2"></i>ATM Withdrawal</h6>
                  <p class="small text-muted">Use your debit card at any ATM</p>
                </div>
                <div class="col-md-6">
                  <h6><i class="bi bi-bank me-2"></i>Branch Withdrawal</h6>
                  <p class="small text-muted">Visit any branch location</p>
                </div>
                <div class="col-md-6">
                  <h6><i class="bi bi-phone me-2"></i>Mobile Withdrawal</h6>
                  <p class="small text-muted">
                    Cardless withdrawal using mobile app
                  </p>
                </div>
                <div class="col-md-6">
                  <h6><i class="bi bi-check-circle me-2"></i>Check Request</h6>
                  <p class="small text-muted">Request a cashier's check</p>
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
export class WithdrawComponent implements OnInit {
  withdrawForm!: FormGroup;
  accounts: Account[] = [];
  loading = false;
  successMessage = '';
  errorMessage = '';
  preselectedAccountId: number | null = null;
  dailyWithdrawalLimit = 1000;

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
    this.withdrawForm = this.fb.group({
      accountId: ['', [Validators.required]],
      amount: ['', [Validators.required, Validators.min(0.01)]],
      description: ['', [Validators.required, Validators.minLength(3)]],
      reference: [''],
    });

    // Add custom validators
    this.withdrawForm.get('amount')?.valueChanges.subscribe(() => {
      this.validateAmount();
    });

    this.withdrawForm.get('accountId')?.valueChanges.subscribe(() => {
      this.validateAmount();
    });
  }

  validateAmount(): void {
    const amountControl = this.withdrawForm.get('amount');
    const accountId = this.withdrawForm.get('accountId')?.value;

    if (amountControl && accountId) {
      const account = this.accounts.find((acc) => acc.id == accountId);
      const amount = amountControl.value;

      if (account && amount > account.balance) {
        amountControl.setErrors({ max: true });
      } else if (amount > this.dailyWithdrawalLimit) {
        amountControl.setErrors({ dailyLimit: true });
      } else if (
        amountControl.errors?.['max'] ||
        amountControl.errors?.['dailyLimit']
      ) {
        delete amountControl.errors['max'];
        delete amountControl.errors['dailyLimit'];
        if (Object.keys(amountControl.errors).length === 0) {
          amountControl.setErrors(null);
        }
      }
    }
  }

  loadAccounts(): void {
    this.accountService.getAccounts().subscribe({
      next: (accounts) => {
        this.accounts = accounts.filter(
          (acc) => acc.status === 'ACTIVE' && acc.balance > 0
        );

        // Set preselected account if provided
        if (this.preselectedAccountId) {
          const account = this.accounts.find(
            (acc) => acc.id === this.preselectedAccountId
          );
          if (account) {
            this.withdrawForm.patchValue({ accountId: account.id });
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
    const accountId = this.withdrawForm.get('accountId')?.value;
    return this.accounts.find((account) => account.id == accountId);
  }

  getRemainingBalance(): number {
    const selectedAccount = this.getSelectedAccount();
    const amount = this.withdrawForm.get('amount')?.value || 0;
    return selectedAccount ? selectedAccount.balance - amount : 0;
  }

  isLowBalance(): boolean {
    const remainingBalance = this.getRemainingBalance();
    return remainingBalance < 100 && remainingBalance >= 0;
  }

  getAccountTypeDisplay(type: string): string {
    return type.charAt(0) + type.slice(1).toLowerCase();
  }

  onSubmit(): void {
    if (this.withdrawForm.invalid) {
      this.withdrawForm.markAllAsTouched();
      return;
    }

    this.loading = true;
    this.errorMessage = '';
    this.successMessage = '';

    const withdrawalRequest: WithdrawalRequest = {
      accountId: this.withdrawForm.value.accountId,
      amount: this.withdrawForm.value.amount,
      description: this.withdrawForm.value.description,
      reference: this.withdrawForm.value.reference,
    };

    this.accountService.withdraw(withdrawalRequest).subscribe({
      next: (transaction) => {
        this.loading = false;
        this.successMessage = `Withdrawal completed successfully! Transaction ID: ${transaction.id}`;
        this.withdrawForm.reset();

        // Redirect to accounts page after 3 seconds
        setTimeout(() => {
          this.router.navigate(['/accounts']);
        }, 3000);
      },
      error: (error) => {
        this.loading = false;
        this.errorMessage =
          error.error?.message || 'Withdrawal failed. Please try again.';
        console.error('Withdrawal error:', error);
      },
    });
  }

  goBack(): void {
    this.router.navigate(['/accounts']);
  }

  // Getter methods for form controls
  get accountId() {
    return this.withdrawForm.get('accountId');
  }
  get amount() {
    return this.withdrawForm.get('amount');
  }
  get description() {
    return this.withdrawForm.get('description');
  }
  get reference() {
    return this.withdrawForm.get('reference');
  }
}
