import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from '../header/header.component';
import { FooterComponent } from '../footer/footer.component';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [
    RouterOutlet,
    HeaderComponent,
    FooterComponent,
    SidebarComponent,
    CommonModule,
  ],
  template: `
    <div class="d-flex flex-column min-vh-100">
      <app-header
        [isLoggedIn]="isLoggedIn"
        [username]="username"
        (toggleSidebar)="toggleSidebar()"
      ></app-header>

      <div class="d-flex flex-grow-1">
        @if (isLoggedIn) {
        <app-sidebar [collapsed]="sidebarCollapsed"></app-sidebar>
        }

        <main
          [ngClass]="
            isLoggedIn ? 'content-with-sidebar py-4' : 'container py-4'
          "
        >
          <router-outlet></router-outlet>
        </main>
      </div>

      <app-footer></app-footer>
    </div>
  `,
  styles: [
    `
      .content-with-sidebar {
        flex: 1;
        padding: 1rem;
        margin-left: 0.5rem;
        transition: all 0.3s;
      }

      @media (max-width: 768px) {
        .content-with-sidebar {
          width: 100%;
          margin-left: 0;
        }
      }
    `,
  ],
})
export class MainLayoutComponent implements OnInit {
  isLoggedIn = false;
  username = 'User';
  sidebarCollapsed = false;

  ngOnInit(): void {
    // This will be updated when we implement authentication
    // For now, let's just check if there's a token in localStorage to simulate login state
    this.isLoggedIn = localStorage.getItem('auth_token') !== null;

    // Responsive behavior: collapse sidebar on small screens
    if (window.innerWidth < 768) {
      this.sidebarCollapsed = true;
    }
  }

  toggleSidebar(): void {
    this.sidebarCollapsed = !this.sidebarCollapsed;
  }
}
