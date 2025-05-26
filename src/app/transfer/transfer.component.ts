import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { Router } from '@angular/router';
import { AccountService } from '../shared/services/account.service';
import { Account, TransferRequest } from '../shared/models/account.model';

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
                        [value]="account.id"
                      >
                        {{ account.accountNumber }} -
                        {{ getAccountTypeDisplay(account.accountType) }} ({{
                          account.balance
                            | currency : account.currency : 'symbol' : '1.2-2'
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
                        [value]="account.id"
                      >
                        {{ account.accountNumber }} -
                        {{ getAccountTypeDisplay(account.accountType) }} ({{
                          account.balance
                            | currency : account.currency : 'symbol' : '1.2-2'
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
                        {{ getSelectedFromAccount()?.accountNumber }}<br />
                        <strong>To:</strong>
                        {{ getSelectedToAccount()?.accountNumber }}<br />
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
  accounts: Account[] = [];
  loading = false;
  successMessage = '';
  errorMessage = '';

  constructor(
    private fb: FormBuilder,
    private accountService: AccountService,
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
      const fromAccount = this.accounts.find((acc) => acc.id == fromAccountId);
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
    this.accountService.getAccounts().subscribe({
      next: (accounts) => {
        this.accounts = accounts.filter((acc) => acc.status === 'ACTIVE');
      },
      error: (error) => {
        this.errorMessage = 'Failed to load accounts. Please try again.';
        console.error('Error loading accounts:', error);
      },
    });
  }

  getAvailableToAccounts(): Account[] {
    const fromAccountId = this.transferForm.get('fromAccountId')?.value;
    return this.accounts.filter((account) => account.id != fromAccountId);
  }

  getSelectedFromAccount(): Account | undefined {
    const fromAccountId = this.transferForm.get('fromAccountId')?.value;
    return this.accounts.find((account) => account.id == fromAccountId);
  }

  getSelectedToAccount(): Account | undefined {
    const toAccountId = this.transferForm.get('toAccountId')?.value;
    return this.accounts.find((account) => account.id == toAccountId);
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

    const transferRequest: TransferRequest = {
      fromAccountId: this.transferForm.value.fromAccountId,
      toAccountId: this.transferForm.value.toAccountId,
      amount: this.transferForm.value.amount,
      description: this.transferForm.value.description,
      reference: this.transferForm.value.reference,
    };

    this.accountService.transfer(transferRequest).subscribe({
      next: (transaction) => {
        this.loading = false;
        this.successMessage = `Transfer completed successfully! Transaction ID: ${transaction.id}`;
        this.transferForm.reset();

        // Redirect to transactions page after 3 seconds
        setTimeout(() => {
          this.router.navigate(['/transactions']);
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
