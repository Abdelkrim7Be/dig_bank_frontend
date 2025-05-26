import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Subject, takeUntil } from 'rxjs';
import { AuthService } from '../../auth/services/auth.service';
import { User, UserRole } from '../../auth/models/auth.model';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, CommonModule],
  template: `
    <div
      class="sidebar bg-primary text-white p-3 d-flex flex-column"
      [class.collapsed]="collapsed"
    >
      <div class="d-flex justify-content-between align-items-center mb-4">
        <h5 class="mb-0" *ngIf="!collapsed">Navigation</h5>
        <button class="btn btn-sm btn-outline-light" (click)="toggleSidebar()">
          <i
            class="bi"
            [ngClass]="collapsed ? 'bi-chevron-right' : 'bi-chevron-left'"
          ></i>
        </button>
      </div>

      <ul class="nav flex-column gap-2">
        <!-- Common links for all users -->
        <li class="nav-item">
          <a
            class="nav-link text-white d-flex align-items-center"
            routerLink="/dashboard"
            routerLinkActive="active"
          >
            <i class="bi bi-speedometer2 me-2"></i>
            <span *ngIf="!collapsed">Dashboard</span>
          </a>
        </li>

        <!-- Customer/User links -->
        <li class="nav-item">
          <a
            class="nav-link text-white d-flex align-items-center"
            routerLink="/accounts"
            routerLinkActive="active"
          >
            <i class="bi bi-wallet2 me-2"></i>
            <span *ngIf="!collapsed">Accounts</span>
          </a>
        </li>
        <li class="nav-item">
          <a
            class="nav-link text-white d-flex align-items-center"
            routerLink="/transactions"
            routerLinkActive="active"
          >
            <i class="bi bi-arrow-left-right me-2"></i>
            <span *ngIf="!collapsed">Transactions</span>
          </a>
        </li>
        <li class="nav-item">
          <a
            class="nav-link text-white d-flex align-items-center"
            [routerLink]="isAdmin ? '/admin/transfer' : '/customer/transfer'"
            routerLinkActive="active"
          >
            <i class="bi bi-arrow-left-right me-2"></i>
            <span *ngIf="!collapsed">Transfer</span>
          </a>
        </li>
        <li class="nav-item">
          <a
            class="nav-link text-white d-flex align-items-center"
            routerLink="/customer/deposit"
            routerLinkActive="active"
          >
            <i class="bi bi-plus-circle me-2"></i>
            <span *ngIf="!collapsed">Add Money</span>
          </a>
        </li>
        <li class="nav-item">
          <a
            class="nav-link text-white d-flex align-items-center"
            routerLink="/customer/debit"
            routerLinkActive="active"
          >
            <i class="bi bi-dash-circle me-2"></i>
            <span *ngIf="!collapsed">Debit</span>
          </a>
        </li>

        <!-- Management links -->
        <li class="nav-item">
          <a
            class="nav-link text-white d-flex align-items-center"
            routerLink="/customers"
            routerLinkActive="active"
          >
            <i class="bi bi-people me-2"></i>
            <span *ngIf="!collapsed">Customers</span>
          </a>
        </li>
        <li class="nav-item">
          <a
            class="nav-link text-white d-flex align-items-center"
            routerLink="/users"
            routerLinkActive="active"
          >
            <i class="bi bi-person-gear me-2"></i>
            <span *ngIf="!collapsed">Users</span>
          </a>
        </li>
        <li class="nav-item">
          <a
            class="nav-link text-white d-flex align-items-center"
            routerLink="/products"
            routerLinkActive="active"
          >
            <i class="bi bi-box-seam me-2"></i>
            <span *ngIf="!collapsed">Products</span>
          </a>
        </li>
      </ul>
    </div>
  `,
  styles: [
    `
      .sidebar {
        width: 250px;
        height: 100%;
        transition: all 0.3s;
        overflow-x: hidden;
      }

      .sidebar.collapsed {
        width: 60px;
      }

      .nav-link {
        border-radius: 5px;
        padding: 0.5rem 1rem;
        transition: all 0.2s;
      }

      .nav-link:hover {
        background-color: rgba(255, 255, 255, 0.1);
      }

      .nav-link.active {
        background-color: var(--bs-primary);
      }

      @media (max-width: 768px) {
        .sidebar {
          width: 60px;
        }
      }
    `,
  ],
})
export class SidebarComponent implements OnInit, OnDestroy {
  @Input() collapsed = false;
  currentUser: User | null = null;
  private destroy$ = new Subject<void>();

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    this.authService.currentUser$
      .pipe(takeUntil(this.destroy$))
      .subscribe((user) => {
        this.currentUser = user;
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

  toggleSidebar() {
    this.collapsed = !this.collapsed;
  }
}
