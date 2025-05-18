import { Component, Input, OnInit } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../auth/services/auth.service';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, CommonModule],
  template: `
    <div
      class="sidebar bg-dark text-white p-3 d-flex flex-column"
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
            routerLink="/transfers"
            routerLinkActive="active"
          >
            <i class="bi bi-send me-2"></i>
            <span *ngIf="!collapsed">Transfers</span>
          </a>
        </li>

        <!-- Manager/Employee links -->
        <li class="nav-item" *ngIf="hasRole(['MANAGER', 'ADMIN'])">
          <a
            class="nav-link text-white d-flex align-items-center"
            routerLink="/products"
            routerLinkActive="active"
          >
            <i class="bi bi-box-seam me-2"></i>
            <span *ngIf="!collapsed">Products</span>
          </a>
        </li>

        <!-- User profile visible to all authenticated users -->
        <li class="nav-item">
          <a
            class="nav-link text-white d-flex align-items-center"
            routerLink="/profile"
            routerLinkActive="active"
          >
            <i class="bi bi-person me-2"></i>
            <span *ngIf="!collapsed">Profile</span>
          </a>
        </li>

        <!-- Admin only links -->
        <li class="nav-item" *ngIf="hasRole(['ADMIN'])">
          <a
            class="nav-link text-white d-flex align-items-center"
            routerLink="/users"
            routerLinkActive="active"
          >
            <i class="bi bi-people me-2"></i>
            <span *ngIf="!collapsed">Users</span>
          </a>
        </li>

        <!-- Advanced Admin features -->
        <li class="nav-item" *ngIf="hasRole(['ADMIN'])">
          <a
            class="nav-link text-white d-flex align-items-center"
            routerLink="/system"
            routerLinkActive="active"
          >
            <i class="bi bi-gear-wide-connected me-2"></i>
            <span *ngIf="!collapsed">System</span>
          </a>
        </li>
      </ul>

      <div class="mt-auto">
        <a
          class="nav-link text-white d-flex align-items-center"
          routerLink="/settings"
          routerLinkActive="active"
        >
          <i class="bi bi-gear me-2"></i>
          <span *ngIf="!collapsed">Settings</span>
        </a>
      </div>
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
export class SidebarComponent implements OnInit {
  @Input() collapsed = false;
  userRole: string | null = null;

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    // Get the current user and extract the role
    const user = this.authService.getCurrentUser();
    if (user) {
      this.userRole = user.role;
    }
  }

  /**
   * Checks if the current user has any of the specified roles
   * @param allowedRoles Array of roles that have permission
   * @returns true if the user has at least one of the specified roles
   */
  hasRole(allowedRoles: string[]): boolean {
    if (!this.userRole) return false;
    return allowedRoles.includes(this.userRole);
  }

  toggleSidebar() {
    this.collapsed = !this.collapsed;
  }
}
