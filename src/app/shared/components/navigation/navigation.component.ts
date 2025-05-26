import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { AuthService } from '../../../auth/services/auth.service';
import { User, UserRole } from '../../../auth/models/auth.model';

@Component({
  selector: 'app-navigation',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <nav class="navbar navbar-expand-lg navbar-light bg-white shadow-sm">
      <div class="container-fluid">
        <!-- Brand -->
        <a class="navbar-brand d-flex align-items-center" routerLink="/">
          <i class="bi bi-bank text-primary me-2 fs-3"></i>
          <span class="fw-bold">Digital Banking</span>
        </a>

        <!-- Mobile Toggle -->
        <button
          class="navbar-toggler"
          type="button"
          (click)="toggleMobileMenu()"
          [attr.aria-expanded]="showMobileMenu"
        >
          <span class="navbar-toggler-icon"></span>
        </button>

        <!-- Navigation Items -->
        <div class="collapse navbar-collapse" [class.show]="showMobileMenu">
          <ul class="navbar-nav me-auto mb-2 mb-lg-0">
            <!-- Admin Navigation -->
            <ng-container *ngIf="isAdmin">
              <li class="nav-item">
                <a
                  class="nav-link"
                  routerLink="/admin/dashboard"
                  routerLinkActive="active"
                >
                  <i class="bi bi-speedometer2 me-1"></i>Dashboard
                </a>
              </li>
              <li class="nav-item">
                <a
                  class="nav-link"
                  routerLink="/admin/customers"
                  routerLinkActive="active"
                >
                  <i class="bi bi-people me-1"></i>Customers
                </a>
              </li>
              <li class="nav-item">
                <a
                  class="nav-link"
                  routerLink="/admin/accounts"
                  routerLinkActive="active"
                >
                  <i class="bi bi-credit-card me-1"></i>Accounts
                </a>
              </li>
              <li class="nav-item">
                <a
                  class="nav-link"
                  routerLink="/admin/transactions"
                  routerLinkActive="active"
                >
                  <i class="bi bi-arrow-left-right me-1"></i>Transactions
                </a>
              </li>
            </ng-container>

            <!-- Customer Navigation -->
            <ng-container *ngIf="isCustomer">
              <li class="nav-item">
                <a
                  class="nav-link"
                  routerLink="/customer/dashboard"
                  routerLinkActive="active"
                >
                  <i class="bi bi-house me-1"></i>Dashboard
                </a>
              </li>
              <li class="nav-item">
                <a
                  class="nav-link"
                  routerLink="/customer/accounts"
                  routerLinkActive="active"
                >
                  <i class="bi bi-credit-card me-1"></i>My Accounts
                </a>
              </li>
              <li
                class="nav-item dropdown"
                [class.show]="showTransactionsDropdown"
              >
                <a
                  class="nav-link dropdown-toggle"
                  href="#"
                  role="button"
                  (click)="toggleTransactionsDropdown($event)"
                >
                  <i class="bi bi-arrow-left-right me-1"></i>Transactions
                </a>
                <ul
                  class="dropdown-menu"
                  [class.show]="showTransactionsDropdown"
                >
                  <li>
                    <a class="dropdown-item" routerLink="/customer/deposit">
                      <i class="bi bi-plus-circle me-2"></i>Add Money
                    </a>
                  </li>
                  <li>
                    <a class="dropdown-item" routerLink="/customer/debit">
                      <i class="bi bi-dash-circle me-2"></i>Debit
                    </a>
                  </li>
                  <li>
                    <a
                      class="dropdown-item"
                      [routerLink]="
                        isAdmin ? '/admin/transfer' : '/customer/transfer'
                      "
                    >
                      <i class="bi bi-arrow-left-right me-2"></i>Transfer
                    </a>
                  </li>
                  <li><hr class="dropdown-divider" /></li>
                  <li>
                    <a
                      class="dropdown-item"
                      routerLink="/customer/transaction-history"
                    >
                      <i class="bi bi-clock-history me-2"></i>History
                    </a>
                  </li>
                </ul>
              </li>
            </ng-container>
          </ul>

          <!-- User Menu -->
          <div class="navbar-nav" *ngIf="currentUser">
            <div class="nav-item dropdown" [class.show]="showUserDropdown">
              <a
                class="nav-link dropdown-toggle d-flex align-items-center"
                href="#"
                role="button"
                (click)="toggleUserDropdown($event)"
              >
                <div class="user-avatar me-2">
                  <i class="bi bi-person-circle fs-4"></i>
                </div>
                <div class="d-none d-md-block">
                  <div class="fw-semibold">
                    {{ currentUser.firstName }} {{ currentUser.lastName }}
                  </div>
                  <small class="text-muted">{{ currentUser.role }}</small>
                </div>
              </a>
              <ul
                class="dropdown-menu dropdown-menu-end"
                [class.show]="showUserDropdown"
              >
                <li>
                  <h6 class="dropdown-header">
                    <i class="bi bi-person me-2"></i
                    >{{ currentUser.firstName }} {{ currentUser.lastName }}
                  </h6>
                </li>
                <li><hr class="dropdown-divider" /></li>
                <li>
                  <a class="dropdown-item" routerLink="/profile">
                    <i class="bi bi-person-gear me-2"></i>Profile Settings
                  </a>
                </li>
                <li>
                  <a class="dropdown-item" href="#">
                    <i class="bi bi-shield-lock me-2"></i>Security
                  </a>
                </li>
                <li>
                  <a class="dropdown-item" href="#">
                    <i class="bi bi-bell me-2"></i>Notifications
                  </a>
                </li>
                <li><hr class="dropdown-divider" /></li>
                <li>
                  <a
                    class="dropdown-item text-danger"
                    href="#"
                    (click)="logout($event)"
                  >
                    <i class="bi bi-box-arrow-right me-2"></i>Logout
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <!-- Login/Register Links (for guests) -->
          <div class="navbar-nav" *ngIf="!currentUser">
            <a class="nav-link" routerLink="/auth/login">
              <i class="bi bi-box-arrow-in-right me-1"></i>Login
            </a>
            <a class="nav-link" routerLink="/auth/register">
              <i class="bi bi-person-plus me-1"></i>Register
            </a>
          </div>
        </div>
      </div>
    </nav>
  `,
  styles: [
    `
      .navbar {
        border-bottom: 1px solid var(--border-color);
      }

      .navbar-brand {
        font-size: 1.5rem;
        color: var(--dark-gray) !important;
      }

      .nav-link {
        color: var(--dark-gray) !important;
        font-weight: 500;
        padding: 0.5rem 1rem !important;
        border-radius: 6px;
        margin: 0 0.25rem;
        transition: all 0.3s ease;
      }

      .nav-link:hover,
      .nav-link.active {
        background-color: var(--primary-red);
        color: white !important;
      }

      .dropdown-menu {
        border: none;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        border-radius: 8px;
        padding: 0.5rem 0;
      }

      .dropdown-item {
        padding: 0.5rem 1rem;
        font-weight: 500;
        transition: all 0.3s ease;
      }

      .dropdown-item:hover {
        background-color: var(--light-gray);
        color: var(--primary-red);
      }

      .dropdown-item.text-danger:hover {
        background-color: rgba(231, 111, 81, 0.1);
        color: var(--danger-red) !important;
      }

      .user-avatar {
        color: var(--primary-red);
      }

      .dropdown-header {
        color: var(--dark-gray);
        font-weight: 600;
      }

      .navbar-toggler {
        border: none;
        padding: 0.25rem 0.5rem;
      }

      .navbar-toggler:focus {
        box-shadow: none;
      }

      @media (max-width: 991.98px) {
        .navbar-collapse {
          background-color: white;
          padding: 1rem;
          margin-top: 1rem;
          border-radius: 8px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }

        .dropdown-menu {
          position: static !important;
          transform: none !important;
          box-shadow: none;
          border: 1px solid var(--border-color);
          margin-top: 0.5rem;
        }
      }
    `,
  ],
})
export class NavigationComponent implements OnInit, OnDestroy {
  currentUser: User | null = null;
  showMobileMenu = false;
  showUserDropdown = false;
  showTransactionsDropdown = false;

  private destroy$ = new Subject<void>();

  constructor(private authService: AuthService, private router: Router) {}

  ngOnInit(): void {
    this.authService.currentUser$
      .pipe(takeUntil(this.destroy$))
      .subscribe((user) => {
        this.currentUser = user;
        console.log('Navigation: Current user updated:', user);
        console.log('Navigation: Is admin?', this.isAdmin);
        console.log('Navigation: Is customer?', this.isCustomer);
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  get isAdmin(): boolean {
    return this.currentUser?.role === UserRole.ADMIN;
  }

  get isCustomer(): boolean {
    return this.currentUser?.role === UserRole.CUSTOMER;
  }

  toggleMobileMenu(): void {
    this.showMobileMenu = !this.showMobileMenu;
  }

  toggleUserDropdown(event: Event): void {
    event.preventDefault();
    this.showUserDropdown = !this.showUserDropdown;
    this.showTransactionsDropdown = false;
  }

  toggleTransactionsDropdown(event: Event): void {
    event.preventDefault();
    this.showTransactionsDropdown = !this.showTransactionsDropdown;
    this.showUserDropdown = false;
  }

  logout(event: Event): void {
    event.preventDefault();
    this.authService.logout();
  }
}
