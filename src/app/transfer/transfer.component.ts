import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { Router } from '@angular/router';
import { BankingApiService } from '../core/services/banking-api.service';
import {
  AccountSelectionDTO,
  TransferRequestDTO,
} from '../shared/models/banking-dtos.model';

import { InlineAlertComponent } from '../shared/components/inline-alert/inline-alert.component';

@Component({
  selector: 'app-transfer',
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
              <li class="breadcrumb-item active">Transfer Money</li>
            </ol>
          </nav>
          <h2 class="mb-1">Transfer Money</h2>
          <p class="text-muted mb-0">
            Transfer funds between your accounts or to other accounts
          </p>
        </div>
      </div>

      <div class="row justify-content-center">
        <div class="col-lg-8">
          <!-- Transfer Form -->
          <div class="card">
            <div class="card-header">
              <h5 class="mb-0">
                <i class="bi bi-arrow-left-right me-2"></i>
                Transfer Details
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

              <form [formGroup]="transferForm" (ngSubmit)="onSubmit()">
                <div class="row">
                  <!-- From Account -->
                  <div class="col-md-6 mb-3">
                    <label for="fromAccount" class="form-label"
                      >From Account *</label
                    >
                    <select
                      id="fromAccount"
                      class="form-select"
                      formControlName="fromAccountId"
                      [class.is-invalid]="
                        fromAccountId?.invalid &&
                        (fromAccountId?.dirty || fromAccountId?.touched)
                      "
                    >
                      <option value="">Select source account</option>
                      <option
                        *ngFor="let account of accounts"
                        [value]="account.accountId"
                      >
                        {{ account.customerUsername }} -
                        {{ account.customerName }} ({{ account.accountType }}:
                        {{
                          account.balance
                            | currency : 'USD' : 'symbol' : '1.2-2'
                        }})
                      </option>
                    </select>
                    <div
                      class="invalid-feedback"
                      *ngIf="
                        fromAccountId?.invalid &&
                        (fromAccountId?.dirty || fromAccountId?.touched)
                      "
                    >
                      <div *ngIf="fromAccountId?.errors?.['required']">
                        Please select a source account
                      </div>
                    </div>
                  </div>

                  <!-- To Account -->
                  <div class="col-md-6 mb-3">
                    <label for="toAccount" class="form-label"
                      >To Account *</label
                    >
                    <select
                      id="toAccount"
                      class="form-select"
                      formControlName="toAccountId"
                      [class.is-invalid]="
                        toAccountId?.invalid &&
                        (toAccountId?.dirty || toAccountId?.touched)
                      "
                    >
                      <option value="">Select destination account</option>
                      <option
                        *ngFor="let account of getAvailableToAccounts()"
                        [value]="account.accountId"
                      >
                        {{ account.customerUsername }} -
                        {{ account.customerName }} ({{ account.accountType }}:
                        {{
                          account.balance
                            | currency : 'USD' : 'symbol' : '1.2-2'
                        }})
                      </option>
                    </select>
                    <div
                      class="invalid-feedback"
                      *ngIf="
                        toAccountId?.invalid &&
                        (toAccountId?.dirty || toAccountId?.touched)
                      "
                    >
                      <div *ngIf="toAccountId?.errors?.['required']">
                        Please select a destination account
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Amount -->
                <div class="mb-3">
                  <label for="amount" class="form-label">Amount *</label>
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
                  <div class="form-text" *ngIf="getSelectedFromAccount()">
                    Available balance:
                    {{
                      getSelectedFromAccount()?.balance
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
                    placeholder="Enter transfer description"
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

                <!-- Transfer Summary -->
                <div class="card bg-light mb-4" *ngIf="transferForm.valid">
                  <div class="card-body">
                    <h6 class="card-title">Transfer Summary</h6>
                    <div class="row">
                      <div class="col-md-6">
                        <strong>From:</strong>
                        {{ getSelectedFromAccount()?.customerUsername }} -
                        {{ getSelectedFromAccount()?.customerName }}<br />
                        <strong>To:</strong>
                        {{ getSelectedToAccount()?.customerUsername }} -
                        {{ getSelectedToAccount()?.customerName }}<br />
                      </div>
                      <div class="col-md-6">
                        <strong>Amount:</strong>
                        {{
                          amount?.value | currency : 'USD' : 'symbol' : '1.2-2'
                        }}<br />
                        <strong>Description:</strong> {{ description?.value
                        }}<br />
                      </div>
                    </div>
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
                    class="btn btn-primary"
                    [disabled]="transferForm.invalid || loading"
                  >
                    <span
                      *ngIf="loading"
                      class="spinner-border spinner-border-sm me-2"
                    ></span>
                    <i class="bi bi-send me-2" *ngIf="!loading"></i>
                    {{ loading ? 'Processing...' : 'Transfer Money' }}
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
        border-color: var(--primary-red);
        box-shadow: 0 0 0 0.2rem rgba(230, 57, 70, 0.25);
      }

      .btn-primary {
        background-color: var(--primary-red);
        border-color: var(--primary-red);
      }

      .btn-primary:hover {
        background-color: #d62d3a;
        border-color: #d62d3a;
      }

      .bg-light {
        background-color: var(--primary-white) !important;
      }
    `,
  ],
})
export class TransferComponent implements OnInit {
  transferForm!: FormGroup;
  accounts: AccountSelectionDTO[] = [];
  loading = false;
  successMessage = '';
  errorMessage = '';

  constructor(
    private fb: FormBuilder,
    private bankingApiService: BankingApiService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.initializeForm();
    this.loadAccounts();
  }

  initializeForm(): void {
    this.transferForm = this.fb.group({
      fromAccountId: ['', [Validators.required]],
      toAccountId: ['', [Validators.required]],
      amount: ['', [Validators.required, Validators.min(0.01)]],
      description: ['', [Validators.required, Validators.minLength(3)]],
      reference: [''],
    });

    // Add custom validator for amount vs balance
    this.transferForm.get('amount')?.valueChanges.subscribe(() => {
      this.validateAmount();
    });

    this.transferForm.get('fromAccountId')?.valueChanges.subscribe(() => {
      this.validateAmount();
    });
  }

  validateAmount(): void {
    const amountControl = this.transferForm.get('amount');
    const fromAccountId = this.transferForm.get('fromAccountId')?.value;

    if (amountControl && fromAccountId) {
      const fromAccount = this.accounts.find(
        (acc) => acc.accountId == fromAccountId
      );
      if (fromAccount && amountControl.value > fromAccount.balance) {
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
    // Try active accounts first
    this.bankingApiService.getActiveAccountsForSelection().subscribe({
      next: (accounts) => {
        console.log('Loaded accounts:', accounts); // Debug log
        // Filter for active accounts, but be more flexible with status
        this.accounts = accounts.filter(
          (acc) => acc.status === 'ACTIVATED' || acc.status === 'ACTIVE'
        );
        console.log('Filtered accounts:', this.accounts); // Debug log

        if (this.accounts.length === 0) {
          console.warn('No active accounts found, trying all accounts');
          // Fallback to all accounts
          this.loadAllAccounts();
        }
      },
      error: (error) => {
        console.error(
          'Error loading active accounts, trying all accounts:',
          error
        );
        // Fallback to all accounts
        this.loadAllAccounts();
      },
    });
  }

  loadAllAccounts(): void {
    this.bankingApiService.getAccountsForSelection().subscribe({
      next: (accounts) => {
        console.log('Loaded all accounts:', accounts); // Debug log
        this.accounts = accounts;
        console.log('Using all accounts:', this.accounts); // Debug log

        if (this.accounts.length === 0) {
          this.errorMessage = 'No accounts available for transfer.';
        }
      },
      error: (error) => {
        this.errorMessage = 'Failed to load accounts. Please try again.';
        console.error('Error loading all accounts:', error);
      },
    });
  }

  getAvailableToAccounts(): AccountSelectionDTO[] {
    const fromAccountId = this.transferForm.get('fromAccountId')?.value;
    return this.accounts.filter(
      (account) => account.accountId != fromAccountId
    );
  }

  getSelectedFromAccount(): AccountSelectionDTO | undefined {
    const fromAccountId = this.transferForm.get('fromAccountId')?.value;
    return this.accounts.find((account) => account.accountId == fromAccountId);
  }

  getSelectedToAccount(): AccountSelectionDTO | undefined {
    const toAccountId = this.transferForm.get('toAccountId')?.value;
    return this.accounts.find((account) => account.accountId == toAccountId);
  }

  getAccountTypeDisplay(type: string): string {
    return type.charAt(0) + type.slice(1).toLowerCase();
  }

  onSubmit(): void {
    if (this.transferForm.invalid) {
      this.transferForm.markAllAsTouched();
      return;
    }

    this.loading = true;
    this.errorMessage = '';
    this.successMessage = '';

    const transferRequest: TransferRequestDTO = {
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
          this.router.navigate(['/accounts']);
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
    this.router.navigate(['/accounts']);
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
  get reference() {
    return this.transferForm.get('reference');
  }
}
