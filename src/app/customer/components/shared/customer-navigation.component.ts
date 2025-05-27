import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../../auth/services/auth.service';
import { User } from '../../../auth/models/auth.model';

@Component({
  selector: 'app-customer-navigation',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <nav class="navbar navbar-expand-lg navbar-dark bg-primary">
      <div class="container-fluid">
        <!-- Brand -->
        <a class="navbar-brand" routerLink="/customer/dashboard">
          <i class="bi bi-bank me-2"></i>
          Digital Banking
        </a>

        <!-- Mobile Toggle -->
        <button
          class="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#customerNavbar"
          aria-controls="customerNavbar"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span class="navbar-toggler-icon"></span>
        </button>

        <!-- Navigation Links -->
        <div class="collapse navbar-collapse" id="customerNavbar">
          <ul class="navbar-nav me-auto">
            <li class="nav-item">
              <a 
                class="nav-link" 
                routerLink="/customer/dashboard"
                routerLinkActive="active"
                [routerLinkActiveOptions]="{exact: true}"
              >
                <i class="bi bi-house me-1"></i>
                Dashboard
              </a>
            </li>
            <li class="nav-item">
              <a 
                class="nav-link" 
                routerLink="/customer/accounts"
                routerLinkActive="active"
              >
                <i class="bi bi-credit-card me-1"></i>
                My Accounts
              </a>
            </li>
            <li class="nav-item">
              <a 
                class="nav-link" 
                routerLink="/customer/transaction-history"
                routerLinkActive="active"
              >
                <i class="bi bi-clock-history me-1"></i>
                Transactions
              </a>
            </li>
            <li class="nav-item dropdown">
              <a
                class="nav-link dropdown-toggle"
                href="#"
                id="transactionDropdown"
                role="button"
                data-bs-toggle="dropdown"
                aria-expanded="false"
              >
                <i class="bi bi-arrow-left-right me-1"></i>
                Quick Actions
              </a>
              <ul class="dropdown-menu" aria-labelledby="transactionDropdown">
                <li>
                  <a class="dropdown-item" routerLink="/customer/deposit">
                    <i class="bi bi-plus-circle me-2 text-success"></i>
                    Add Money
                  </a>
                </li>
                <li>
                  <a class="dropdown-item" routerLink="/customer/debit">
                    <i class="bi bi-dash-circle me-2 text-warning"></i>
                    Debit Money
                  </a>
                </li>
                <li>
                  <a class="dropdown-item" routerLink="/customer/transfer">
                    <i class="bi bi-arrow-left-right me-2 text-primary"></i>
                    Transfer Funds
                  </a>
                </li>
              </ul>
            </li>
          </ul>

          <!-- User Menu -->
          <ul class="navbar-nav">
            <li class="nav-item dropdown">
              <a
                class="nav-link dropdown-toggle d-flex align-items-center"
                href="#"
                id="userDropdown"
                role="button"
                data-bs-toggle="dropdown"
                aria-expanded="false"
              >
                <div class="user-avatar me-2">
                  <i class="bi bi-person-circle"></i>
                </div>
                <span class="d-none d-md-inline">
                  {{ currentUser?.firstName || currentUser?.username }}
                </span>
              </a>
              <ul class="dropdown-menu dropdown-menu-end" aria-labelledby="userDropdown">
                <li>
                  <h6 class="dropdown-header">
                    <i class="bi bi-person me-2"></i>
                    {{ currentUser?.firstName }} {{ currentUser?.lastName }}
                  </h6>
                </li>
                <li><hr class="dropdown-divider"></li>
                <li>
                  <a class="dropdown-item" routerLink="/profile">
                    <i class="bi bi-person-gear me-2"></i>
                    Profile Settings
                  </a>
                </li>
                <li>
                  <a class="dropdown-item" href="#" (click)="changePassword($event)">
                    <i class="bi bi-key me-2"></i>
                    Change Password
                  </a>
                </li>
                <li>
                  <a class="dropdown-item" href="#" (click)="viewAccountStatement($event)">
                    <i class="bi bi-file-earmark-text me-2"></i>
                    Account Statement
                  </a>
                </li>
                <li><hr class="dropdown-divider"></li>
                <li>
                  <a class="dropdown-item text-danger" href="#" (click)="logout($event)">
                    <i class="bi bi-box-arrow-right me-2"></i>
                    Sign Out
                  </a>
                </li>
              </ul>
            </li>
          </ul>
        </div>
      </div>
    </nav>

    <!-- Breadcrumb -->
    <nav aria-label="breadcrumb" class="bg-light border-bottom">
      <div class="container-fluid">
        <ol class="breadcrumb mb-0 py-2">
          <li class="breadcrumb-item">
            <a routerLink="/customer/dashboard" class="text-decoration-none">
              <i class="bi bi-house me-1"></i>
              Home
            </a>
          </li>
          <li class="breadcrumb-item active" aria-current="page" *ngIf="currentPageTitle">
            {{ currentPageTitle }}
          </li>
        </ol>
      </div>
    </nav>
  `,
  styles: [`
    .navbar-brand {
      font-weight: 700;
      font-size: 1.5rem;
    }

    .user-avatar {
      font-size: 1.5rem;
    }

    .nav-link {
      font-weight: 500;
      transition: all 0.2s ease-in-out;
    }

    .nav-link:hover {
      background-color: rgba(255, 255, 255, 0.1);
      border-radius: 4px;
    }

    .nav-link.active {
      background-color: rgba(255, 255, 255, 0.2);
      border-radius: 4px;
    }

    .dropdown-menu {
      border: none;
      box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.15);
    }

    .dropdown-item {
      transition: all 0.2s ease-in-out;
    }

    .dropdown-item:hover {
      background-color: var(--bs-primary);
      color: white;
    }

    .breadcrumb {
      background-color: transparent;
    }

    .breadcrumb-item + .breadcrumb-item::before {
      content: ">";
      color: #6c757d;
    }

    @media (max-width: 991.98px) {
      .navbar-nav .nav-link {
        padding: 0.75rem 1rem;
      }
      
      .dropdown-menu {
        border: 1px solid rgba(0, 0, 0, 0.15);
        box-shadow: none;
      }
    }
  `]
})
export class CustomerNavigationComponent implements OnInit {
  currentUser: User | null = null;
  currentPageTitle: string = '';

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.currentUser = this.authService.getCurrentUser();
    this.updatePageTitle();
    
    // Listen to route changes to update breadcrumb
    this.router.events.subscribe(() => {
      this.updatePageTitle();
    });
  }

  private updatePageTitle(): void {
    const url = this.router.url;
    
    if (url.includes('/customer/accounts') && url !== '/customer/accounts') {
      this.currentPageTitle = 'Account Details';
    } else if (url.includes('/customer/accounts')) {
      this.currentPageTitle = 'My Accounts';
    } else if (url.includes('/customer/transaction-history')) {
      this.currentPageTitle = 'Transaction History';
    } else if (url.includes('/customer/deposit')) {
      this.currentPageTitle = 'Add Money';
    } else if (url.includes('/customer/debit')) {
      this.currentPageTitle = 'Debit Money';
    } else if (url.includes('/customer/transfer')) {
      this.currentPageTitle = 'Transfer Funds';
    } else if (url.includes('/customer/dashboard')) {
      this.currentPageTitle = '';
    } else {
      this.currentPageTitle = '';
    }
  }

  logout(event: Event): void {
    event.preventDefault();
    
    if (confirm('Are you sure you want to sign out?')) {
      this.authService.logout().subscribe({
        next: () => {
          this.router.navigate(['/auth/login']);
        },
        error: (error) => {
          console.error('Logout error:', error);
          // Force logout even if server request fails
          this.authService.clearAuthData();
          this.router.navigate(['/auth/login']);
        }
      });
    }
  }

  changePassword(event: Event): void {
    event.preventDefault();
    // Placeholder for change password functionality
    alert('Change password functionality will be implemented soon.');
  }

  viewAccountStatement(event: Event): void {
    event.preventDefault();
    // Placeholder for account statement functionality
    alert('Account statement functionality will be implemented soon.');
  }
}
