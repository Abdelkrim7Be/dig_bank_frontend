import { Component, EventEmitter, Output } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterLink, CommonModule],
  template: `
    <header class="navbar navbar-expand-lg navbar-dark bg-primary">
      <div class="container-fluid">
        <div class="d-flex align-items-center">
          <button
            class="btn btn-sm btn-outline-light me-3 d-md-none"
            type="button"
            (click)="toggleSidebar.emit()"
          >
            <i class="bi bi-list"></i>
          </button>
          <a class="navbar-brand" routerLink="/">Digital Banking</a>
        </div>

        <button
          class="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarNav"
        >
          <span class="navbar-toggler-icon"></span>
        </button>

        <div class="collapse navbar-collapse" id="navbarNav">
          <ul class="navbar-nav ms-auto">
            <li class="nav-item">
              <a class="nav-link" routerLink="/dashboard">
                <i class="bi bi-speedometer2 me-1"></i>Dashboard
              </a>
            </li>
            <li class="nav-item">
              <a class="nav-link" routerLink="/accounts">
                <i class="bi bi-wallet2 me-1"></i>Accounts
              </a>
            </li>
            <li class="nav-item">
              <a class="nav-link" routerLink="/transactions">
                <i class="bi bi-arrow-left-right me-1"></i>Transactions
              </a>
            </li>
            <li class="nav-item">
              <a class="nav-link" routerLink="/customers">
                <i class="bi bi-people me-1"></i>Customers
              </a>
            </li>
          </ul>
        </div>
      </div>
    </header>
  `,
  styles: [
    `
      .navbar {
        box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
        padding: 0.5rem 1rem;
      }

      .dropdown-item {
        display: flex;
        align-items: center;
      }

      .dropdown-item:active {
        background-color: var(--bs-primary);
      }
    `,
  ],
})
export class HeaderComponent {
  @Output() toggleSidebar = new EventEmitter<void>();
}
