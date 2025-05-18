import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../auth/services/auth.service';
import { User } from '../auth/models/user.model';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="container-fluid mt-4">
      <!-- Welcome Section -->
      <div class="row mb-4">
        <div class="col-12">
          <div class="card shadow-sm">
            <div class="card-body">
              <div class="d-flex justify-content-between align-items-center">
                <div>
                  <h4 class="card-title mb-1">
                    Welcome back, {{ user?.name || 'User' }}!
                  </h4>
                  <p class="text-muted">
                    Here's what's happening with your accounts today.
                  </p>
                </div>
                <div class="text-end">
                  <p class="mb-0">{{ today | date : 'EEEE, MMMM d, y' }}</p>
                  <p class="mb-0 text-muted">
                    Last login: {{ lastLogin | date : 'medium' }}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Stats Row -->
      <div class="row mb-4">
        <div class="col-md-3 col-sm-6 mb-3">
          <div class="card shadow-sm bg-primary text-white h-100">
            <div class="card-body">
              <h5 class="card-title">Total Balance</h5>
              <h3 class="mb-0">$25,350.60</h3>
              <p class="small mb-0">
                <i class="bi bi-arrow-up"></i> 2.5% from last month
              </p>
            </div>
          </div>
        </div>
        <div class="col-md-3 col-sm-6 mb-3">
          <div class="card shadow-sm h-100">
            <div class="card-body">
              <h5 class="card-title">Active Accounts</h5>
              <h3 class="mb-0">3</h3>
              <p class="small text-muted mb-0">Checking, Savings, Investment</p>
            </div>
          </div>
        </div>
        <div class="col-md-3 col-sm-6 mb-3">
          <div class="card shadow-sm h-100">
            <div class="card-body">
              <h5 class="card-title">Pending Transfers</h5>
              <h3 class="mb-0">2</h3>
              <p class="small text-muted mb-0">Total: $1,250.00</p>
            </div>
          </div>
        </div>
        <div class="col-md-3 col-sm-6 mb-3">
          <div class="card shadow-sm h-100">
            <div class="card-body">
              <h5 class="card-title">Credit Score</h5>
              <h3 class="mb-0">760</h3>
              <p class="small text-success mb-0">
                <i class="bi bi-arrow-up"></i> Good
              </p>
            </div>
          </div>
        </div>
      </div>

      <!-- Quick Actions Row -->
      <div class="row mb-4">
        <div class="col-lg-8">
          <div class="row">
            <div class="col-md-4 mb-3">
              <div class="card shadow-sm h-100">
                <div class="card-body d-flex flex-column">
                  <div class="mb-3 text-primary">
                    <i class="bi bi-wallet2 fs-1"></i>
                  </div>
                  <h5 class="card-title">Accounts</h5>
                  <p class="card-text flex-grow-1">
                    View and manage your bank accounts, check balances and
                    statements.
                  </p>
                  <a
                    routerLink="/accounts"
                    class="btn btn-sm btn-outline-primary mt-2"
                    >View Accounts</a
                  >
                </div>
              </div>
            </div>

            <div class="col-md-4 mb-3">
              <div class="card shadow-sm h-100">
                <div class="card-body d-flex flex-column">
                  <div class="mb-3 text-primary">
                    <i class="bi bi-arrow-left-right fs-1"></i>
                  </div>
                  <h5 class="card-title">Transactions</h5>
                  <p class="card-text flex-grow-1">
                    Review your recent transactions, filter by date and
                    categories.
                  </p>
                  <a
                    routerLink="/transactions"
                    class="btn btn-sm btn-outline-primary mt-2"
                    >View Transactions</a
                  >
                </div>
              </div>
            </div>

            <div class="col-md-4 mb-3">
              <div class="card shadow-sm h-100">
                <div class="card-body d-flex flex-column">
                  <div class="mb-3 text-primary">
                    <i class="bi bi-send fs-1"></i>
                  </div>
                  <h5 class="card-title">Transfers</h5>
                  <p class="card-text flex-grow-1">
                    Transfer money between your accounts or to other people.
                  </p>
                  <a
                    routerLink="/transfers"
                    class="btn btn-sm btn-outline-primary mt-2"
                    >New Transfer</a
                  >
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="col-lg-4 mb-3">
          <div class="card shadow-sm h-100">
            <div class="card-header bg-light">
              <h5 class="mb-0">Quick Links</h5>
            </div>
            <div class="card-body">
              <div class="list-group list-group-flush">
                <a
                  href="#"
                  class="list-group-item list-group-item-action d-flex align-items-center"
                >
                  <i class="bi bi-plus-circle me-3 text-success"></i>
                  <span>Open New Account</span>
                </a>
                <a
                  href="#"
                  class="list-group-item list-group-item-action d-flex align-items-center"
                >
                  <i class="bi bi-credit-card me-3 text-primary"></i>
                  <span>Apply for Credit Card</span>
                </a>
                <a
                  href="#"
                  class="list-group-item list-group-item-action d-flex align-items-center"
                >
                  <i class="bi bi-graph-up-arrow me-3 text-info"></i>
                  <span>Investment Options</span>
                </a>
                <a
                  href="#"
                  class="list-group-item list-group-item-action d-flex align-items-center"
                >
                  <i class="bi bi-house me-3 text-warning"></i>
                  <span>Mortgage Calculator</span>
                </a>
                <a
                  href="#"
                  class="list-group-item list-group-item-action d-flex align-items-center"
                >
                  <i class="bi bi-headset me-3 text-danger"></i>
                  <span>Contact Support</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Recent Transactions & Financial Summary Row -->
      <div class="row mb-4">
        <div class="col-lg-8 mb-3">
          <div class="card shadow-sm h-100">
            <div
              class="card-header bg-light d-flex justify-content-between align-items-center"
            >
              <h5 class="mb-0">Recent Transactions</h5>
              <a
                routerLink="/transactions"
                class="btn btn-sm btn-outline-primary"
                >View All</a
              >
            </div>
            <div class="card-body p-0">
              <div class="table-responsive">
                <table class="table table-hover mb-0">
                  <thead class="table-light">
                    <tr>
                      <th>Date</th>
                      <th>Description</th>
                      <th>Account</th>
                      <th class="text-end">Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>Jun 12, 2023</td>
                      <td>Grocery Store</td>
                      <td>Checking ****1234</td>
                      <td class="text-end text-danger">-$86.42</td>
                    </tr>
                    <tr>
                      <td>Jun 11, 2023</td>
                      <td>Monthly Salary</td>
                      <td>Checking ****1234</td>
                      <td class="text-end text-success">+$3,250.00</td>
                    </tr>
                    <tr>
                      <td>Jun 10, 2023</td>
                      <td>Electric Bill</td>
                      <td>Checking ****1234</td>
                      <td class="text-end text-danger">-$145.30</td>
                    </tr>
                    <tr>
                      <td>Jun 09, 2023</td>
                      <td>Restaurant Payment</td>
                      <td>Credit Card ****5678</td>
                      <td class="text-end text-danger">-$58.25</td>
                    </tr>
                    <tr>
                      <td>Jun 07, 2023</td>
                      <td>Interest Earned</td>
                      <td>Savings ****4321</td>
                      <td class="text-end text-success">+$12.55</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        <div class="col-lg-4 mb-3">
          <div class="card shadow-sm h-100">
            <div class="card-header bg-light">
              <h5 class="mb-0">Financial Summary</h5>
            </div>
            <div class="card-body">
              <div class="mb-4">
                <h6>Monthly Spending</h6>
                <div class="progress mb-2" style="height: 10px;">
                  <div
                    class="progress-bar bg-primary"
                    role="progressbar"
                    style="width: 65%;"
                    aria-valuenow="65"
                    aria-valuemin="0"
                    aria-valuemax="100"
                  ></div>
                </div>
                <div class="d-flex justify-content-between">
                  <small class="text-muted">$1,950 of $3,000 budget</small>
                  <small class="text-muted">65%</small>
                </div>
              </div>

              <div class="mb-4">
                <h6>Savings Goal</h6>
                <div class="progress mb-2" style="height: 10px;">
                  <div
                    class="progress-bar bg-success"
                    role="progressbar"
                    style="width: 40%;"
                    aria-valuenow="40"
                    aria-valuemin="0"
                    aria-valuemax="100"
                  ></div>
                </div>
                <div class="d-flex justify-content-between">
                  <small class="text-muted">$4,000 of $10,000 goal</small>
                  <small class="text-muted">40%</small>
                </div>
              </div>

              <div>
                <h6>Upcoming Bills</h6>
                <ul class="list-group list-group-flush">
                  <li
                    class="list-group-item px-0 d-flex justify-content-between align-items-center"
                  >
                    <span>Rent Payment</span>
                    <span class="badge bg-warning rounded-pill"
                      >Due in 5 days</span
                    >
                  </li>
                  <li
                    class="list-group-item px-0 d-flex justify-content-between align-items-center"
                  >
                    <span>Internet Bill</span>
                    <span class="badge bg-danger rounded-pill"
                      >Due in 2 days</span
                    >
                  </li>
                  <li
                    class="list-group-item px-0 d-flex justify-content-between align-items-center"
                  >
                    <span>Phone Bill</span>
                    <span class="badge bg-success rounded-pill">Paid</span>
                  </li>
                </ul>
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
        transition: transform 0.3s ease, box-shadow 0.3s ease;
        border: none;
        border-radius: 0.5rem;
      }

      .card:hover {
        transform: translateY(-5px);
        box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.15) !important;
      }

      .card-header {
        border-top-left-radius: 0.5rem !important;
        border-top-right-radius: 0.5rem !important;
      }

      .table th,
      .table td {
        padding: 0.75rem 1rem;
      }

      .progress {
        border-radius: 0.5rem;
      }

      .bi {
        line-height: 1;
      }
    `,
  ],
})
export class DashboardComponent implements OnInit {
  user: User | null = null;
  today = new Date();
  lastLogin = new Date(Date.now() - 24 * 60 * 60 * 1000); // Yesterday

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    this.user = this.authService.getCurrentUser();
    // In a real app, you would fetch dashboard data here
    this.loadDashboardData();
  }

  loadDashboardData(): void {
    // This would be replaced with actual API calls in a real application
    console.log('Loading dashboard data...');
    // this.dashboardService.getAccountSummary().subscribe(data => {...})
    // this.dashboardService.getRecentTransactions().subscribe(data => {...})
    // this.dashboardService.getFinancialGoals().subscribe(data => {...})
  }
}
