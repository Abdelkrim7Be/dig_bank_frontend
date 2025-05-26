import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-admin-reports',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  template: `
    <div class="container-fluid mt-4">
      <div class="row">
        <div class="col-12">
          <!-- Header -->
          <div class="d-flex justify-content-between align-items-center mb-4">
            <div>
              <h1 class="h3 mb-0">Reports & Analytics</h1>
              <p class="text-muted mb-0">Generate and view system reports</p>
            </div>
            <div class="d-flex gap-2">
              <button class="btn btn-outline-primary">
                <i class="bi bi-download me-2"></i>Export All
              </button>
              <button class="btn btn-primary">
                <i class="bi bi-plus-circle me-2"></i>Custom Report
              </button>
            </div>
          </div>

          <!-- Quick Stats -->
          <div class="row mb-4">
            <div class="col-md-3 mb-3">
              <div class="card border-0 shadow-sm">
                <div class="card-body text-center">
                  <i class="bi bi-people text-primary" style="font-size: 2rem;"></i>
                  <h4 class="mt-2 mb-1">{{ totalCustomers }}</h4>
                  <p class="text-muted mb-0">Total Customers</p>
                </div>
              </div>
            </div>
            <div class="col-md-3 mb-3">
              <div class="card border-0 shadow-sm">
                <div class="card-body text-center">
                  <i class="bi bi-credit-card text-success" style="font-size: 2rem;"></i>
                  <h4 class="mt-2 mb-1">{{ totalAccounts }}</h4>
                  <p class="text-muted mb-0">Total Accounts</p>
                </div>
              </div>
            </div>
            <div class="col-md-3 mb-3">
              <div class="card border-0 shadow-sm">
                <div class="card-body text-center">
                  <i class="bi bi-arrow-left-right text-info" style="font-size: 2rem;"></i>
                  <h4 class="mt-2 mb-1">{{ totalTransactions }}</h4>
                  <p class="text-muted mb-0">Total Transactions</p>
                </div>
              </div>
            </div>
            <div class="col-md-3 mb-3">
              <div class="card border-0 shadow-sm">
                <div class="card-body text-center">
                  <i class="bi bi-currency-dollar text-warning" style="font-size: 2rem;"></i>
                  <h4 class="mt-2 mb-1">{{ totalBalance | currency }}</h4>
                  <p class="text-muted mb-0">Total Balance</p>
                </div>
              </div>
            </div>
          </div>

          <!-- Report Categories -->
          <div class="row">
            <!-- Customer Reports -->
            <div class="col-lg-6 mb-4">
              <div class="card border-0 shadow-sm">
                <div class="card-header bg-white">
                  <h5 class="card-title mb-0">
                    <i class="bi bi-people me-2 text-primary"></i>Customer Reports
                  </h5>
                </div>
                <div class="card-body">
                  <div class="list-group list-group-flush">
                    <button class="list-group-item list-group-item-action d-flex justify-content-between align-items-center">
                      <div>
                        <h6 class="mb-1">Customer Summary Report</h6>
                        <p class="mb-1 text-muted">Overview of all customers and their accounts</p>
                      </div>
                      <i class="bi bi-download text-primary"></i>
                    </button>
                    <button class="list-group-item list-group-item-action d-flex justify-content-between align-items-center">
                      <div>
                        <h6 class="mb-1">New Customer Report</h6>
                        <p class="mb-1 text-muted">Customers registered in the last 30 days</p>
                      </div>
                      <i class="bi bi-download text-primary"></i>
                    </button>
                    <button class="list-group-item list-group-item-action d-flex justify-content-between align-items-center">
                      <div>
                        <h6 class="mb-1">Customer Activity Report</h6>
                        <p class="mb-1 text-muted">Customer transaction activity analysis</p>
                      </div>
                      <i class="bi bi-download text-primary"></i>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <!-- Account Reports -->
            <div class="col-lg-6 mb-4">
              <div class="card border-0 shadow-sm">
                <div class="card-header bg-white">
                  <h5 class="card-title mb-0">
                    <i class="bi bi-credit-card me-2 text-success"></i>Account Reports
                  </h5>
                </div>
                <div class="card-body">
                  <div class="list-group list-group-flush">
                    <button class="list-group-item list-group-item-action d-flex justify-content-between align-items-center">
                      <div>
                        <h6 class="mb-1">Account Balance Report</h6>
                        <p class="mb-1 text-muted">Current balances across all accounts</p>
                      </div>
                      <i class="bi bi-download text-success"></i>
                    </button>
                    <button class="list-group-item list-group-item-action d-flex justify-content-between align-items-center">
                      <div>
                        <h6 class="mb-1">Account Type Analysis</h6>
                        <p class="mb-1 text-muted">Distribution of account types</p>
                      </div>
                      <i class="bi bi-download text-success"></i>
                    </button>
                    <button class="list-group-item list-group-item-action d-flex justify-content-between align-items-center">
                      <div>
                        <h6 class="mb-1">Dormant Accounts</h6>
                        <p class="mb-1 text-muted">Accounts with no recent activity</p>
                      </div>
                      <i class="bi bi-download text-success"></i>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <!-- Transaction Reports -->
            <div class="col-lg-6 mb-4">
              <div class="card border-0 shadow-sm">
                <div class="card-header bg-white">
                  <h5 class="card-title mb-0">
                    <i class="bi bi-arrow-left-right me-2 text-info"></i>Transaction Reports
                  </h5>
                </div>
                <div class="card-body">
                  <div class="list-group list-group-flush">
                    <button class="list-group-item list-group-item-action d-flex justify-content-between align-items-center">
                      <div>
                        <h6 class="mb-1">Daily Transaction Summary</h6>
                        <p class="mb-1 text-muted">Transaction volume and amounts by day</p>
                      </div>
                      <i class="bi bi-download text-info"></i>
                    </button>
                    <button class="list-group-item list-group-item-action d-flex justify-content-between align-items-center">
                      <div>
                        <h6 class="mb-1">Large Transaction Report</h6>
                        <p class="mb-1 text-muted">Transactions above specified threshold</p>
                      </div>
                      <i class="bi bi-download text-info"></i>
                    </button>
                    <button class="list-group-item list-group-item-action d-flex justify-content-between align-items-center">
                      <div>
                        <h6 class="mb-1">Failed Transaction Report</h6>
                        <p class="mb-1 text-muted">Analysis of failed transactions</p>
                      </div>
                      <i class="bi bi-download text-info"></i>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <!-- Financial Reports -->
            <div class="col-lg-6 mb-4">
              <div class="card border-0 shadow-sm">
                <div class="card-header bg-white">
                  <h5 class="card-title mb-0">
                    <i class="bi bi-graph-up me-2 text-warning"></i>Financial Reports
                  </h5>
                </div>
                <div class="card-body">
                  <div class="list-group list-group-flush">
                    <button class="list-group-item list-group-item-action d-flex justify-content-between align-items-center">
                      <div>
                        <h6 class="mb-1">Monthly Financial Summary</h6>
                        <p class="mb-1 text-muted">Monthly revenue and expense analysis</p>
                      </div>
                      <i class="bi bi-download text-warning"></i>
                    </button>
                    <button class="list-group-item list-group-item-action d-flex justify-content-between align-items-center">
                      <div>
                        <h6 class="mb-1">Interest Calculation Report</h6>
                        <p class="mb-1 text-muted">Interest earned and paid analysis</p>
                      </div>
                      <i class="bi bi-download text-warning"></i>
                    </button>
                    <button class="list-group-item list-group-item-action d-flex justify-content-between align-items-center">
                      <div>
                        <h6 class="mb-1">Profit & Loss Statement</h6>
                        <p class="mb-1 text-muted">Comprehensive P&L analysis</p>
                      </div>
                      <i class="bi bi-download text-warning"></i>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Custom Report Builder -->
          <div class="row">
            <div class="col-12">
              <div class="card border-0 shadow-sm">
                <div class="card-header bg-white">
                  <h5 class="card-title mb-0">
                    <i class="bi bi-tools me-2"></i>Custom Report Builder
                  </h5>
                </div>
                <div class="card-body">
                  <div class="row">
                    <div class="col-md-4 mb-3">
                      <label class="form-label">Report Type</label>
                      <select class="form-select" [(ngModel)]="customReport.type">
                        <option value="">Select report type</option>
                        <option value="customer">Customer Report</option>
                        <option value="account">Account Report</option>
                        <option value="transaction">Transaction Report</option>
                        <option value="financial">Financial Report</option>
                      </select>
                    </div>
                    <div class="col-md-4 mb-3">
                      <label class="form-label">Date Range</label>
                      <select class="form-select" [(ngModel)]="customReport.dateRange">
                        <option value="7">Last 7 days</option>
                        <option value="30">Last 30 days</option>
                        <option value="90">Last 3 months</option>
                        <option value="365">Last year</option>
                        <option value="custom">Custom range</option>
                      </select>
                    </div>
                    <div class="col-md-4 mb-3">
                      <label class="form-label">Format</label>
                      <select class="form-select" [(ngModel)]="customReport.format">
                        <option value="pdf">PDF</option>
                        <option value="excel">Excel</option>
                        <option value="csv">CSV</option>
                      </select>
                    </div>
                  </div>
                  <div class="d-flex justify-content-end">
                    <button class="btn btn-primary" (click)="generateCustomReport()">
                      <i class="bi bi-gear me-2"></i>Generate Report
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .card {
      border: none;
      box-shadow: 0 0.125rem 0.25rem rgba(0, 0, 0, 0.075);
    }
    
    .list-group-item {
      border: none;
      border-bottom: 1px solid #dee2e6;
    }
    
    .list-group-item:hover {
      background-color: #f8f9fa;
    }
    
    .btn {
      border-radius: 0.375rem;
    }
  `]
})
export class AdminReportsComponent implements OnInit {
  totalCustomers = 156;
  totalAccounts = 324;
  totalTransactions = 1247;
  totalBalance = 2456789.50;

  customReport = {
    type: '',
    dateRange: '30',
    format: 'pdf'
  };

  constructor() {}

  ngOnInit(): void {
    this.loadReportStats();
  }

  private loadReportStats(): void {
    // TODO: Load actual stats from service
    // This would typically call an API to get real statistics
  }

  generateCustomReport(): void {
    if (!this.customReport.type) {
      alert('Please select a report type');
      return;
    }

    // TODO: Implement custom report generation
    console.log('Generating custom report:', this.customReport);
    alert('Custom report generation would be implemented here');
  }
}
