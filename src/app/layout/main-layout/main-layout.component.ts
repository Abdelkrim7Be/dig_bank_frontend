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
      <app-header (toggleSidebar)="toggleSidebar()"></app-header>

      <div class="d-flex flex-grow-1">
        <app-sidebar [collapsed]="sidebarCollapsed"></app-sidebar>

        <main class="content-with-sidebar py-4">
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
  sidebarCollapsed = false;

  ngOnInit(): void {
    // Responsive behavior: collapse sidebar on small screens
    if (window.innerWidth < 768) {
      this.sidebarCollapsed = true;
    }
  }

  toggleSidebar(): void {
    this.sidebarCollapsed = !this.sidebarCollapsed;
  }
}
