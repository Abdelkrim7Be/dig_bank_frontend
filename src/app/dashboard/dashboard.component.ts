import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../auth/services/auth.service';
import { User } from '../auth/models/user.model';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="container mt-4">
      <div class="row">
        <div class="col-12">
          <div class="card">
            <div class="card-header bg-primary text-white">
              <h4 class="mb-0">Dashboard</h4>
            </div>
            <div class="card-body">
              <h5 class="card-title">Welcome, {{ user?.name || 'User' }}!</h5>
              <p class="card-text">This is your personal dashboard.</p>
            </div>
          </div>
        </div>
      </div>

      <div class="row mt-4">
        <div class="col-md-4 mb-3">
          <div class="card h-100">
            <div class="card-body">
              <h5 class="card-title">Accounts</h5>
              <p class="card-text">View and manage your bank accounts.</p>
              <button class="btn btn-primary">View Accounts</button>
            </div>
          </div>
        </div>

        <div class="col-md-4 mb-3">
          <div class="card h-100">
            <div class="card-body">
              <h5 class="card-title">Transactions</h5>
              <p class="card-text">Check your recent transactions.</p>
              <button class="btn btn-primary">View Transactions</button>
            </div>
          </div>
        </div>

        <div class="col-md-4 mb-3">
          <div class="card h-100">
            <div class="card-body">
              <h5 class="card-title">Transfers</h5>
              <p class="card-text">Make transfers between accounts.</p>
              <button class="btn btn-primary">New Transfer</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
})
export class DashboardComponent implements OnInit {
  user: User | null = null;

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    this.user = this.authService.getCurrentUser();
  }
}
