import { Component, EventEmitter, Input, Output } from '@angular/core';
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
            @if (!isLoggedIn) {
            <li class="nav-item">
              <a class="nav-link" routerLink="/login">Login</a>
            </li>
            <li class="nav-item">
              <a class="nav-link" routerLink="/register">Register</a>
            </li>
            } @else {
            <li class="nav-item dropdown">
              <a
                class="nav-link dropdown-toggle d-flex align-items-center"
                href="#"
                role="button"
                data-bs-toggle="dropdown"
                aria-expanded="false"
              >
                <i class="bi bi-person-circle me-1"></i>
                {{ username }}
              </a>
              <ul class="dropdown-menu dropdown-menu-end">
                <li>
                  <a class="dropdown-item" routerLink="/profile">
                    <i class="bi bi-person me-2"></i>Profile
                  </a>
                </li>
                <li>
                  <a class="dropdown-item" routerLink="/settings">
                    <i class="bi bi-gear me-2"></i>Settings
                  </a>
                </li>
                <li><hr class="dropdown-divider" /></li>
                <li>
                  <a class="dropdown-item" href="#" (click)="logout($event)">
                    <i class="bi bi-box-arrow-right me-2"></i>Logout
                  </a>
                </li>
              </ul>
            </li>
            }
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
  @Input() isLoggedIn: boolean = false;
  @Input() username: string = 'User';
  @Output() toggleSidebar = new EventEmitter<void>();

  logout(event: Event): void {
    event.preventDefault();
    // This will be implemented when we add the auth service
    console.log('Logout clicked');
    // authService.logout()
  }
}
