import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { AuthService } from './auth/services/auth.service';
import { NavigationComponent } from './shared/components/navigation/navigation.component';
import { LoaderComponent } from './shared/components/loader/loader.component';
import { NotificationsComponent } from './shared/components/notifications/notifications.component';
import { AlertComponent } from './shared/components/alert/alert.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    NavigationComponent,
    LoaderComponent,
    NotificationsComponent,
  ],
  template: `
    <div class="app-container">
      <!-- Navigation (only show when authenticated and not on auth pages) -->
      <app-navigation *ngIf="showNavigation"></app-navigation>

      <!-- Main Content -->
      <main class="main-content" [class.with-nav]="showNavigation">
        <router-outlet></router-outlet>
      </main>

      <!-- Global Components -->
      <app-loader></app-loader>
      <app-notifications></app-notifications>
    </div>
  `,
  styles: [
    `
      .app-container {
        min-height: 100vh;
        display: flex;
        flex-direction: column;
      }

      .main-content {
        flex: 1;
        background-color: var(--light-gray);
      }

      .main-content.with-nav {
        margin-top: 0;
      }

      @media (max-width: 991.98px) {
        .main-content.with-nav {
          margin-top: 0;
        }
      }
    `,
  ],
})
export class AppComponent implements OnInit {
  title = 'Digital Banking';
  showNavigation = false;

  constructor(private authService: AuthService, private router: Router) {}

  ngOnInit(): void {
    // Listen to route changes to determine when to show navigation
    this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => {
        this.updateNavigationVisibility(event.url);
      });

    // Listen to authentication state changes
    this.authService.isAuthenticated$.subscribe((isAuthenticated) => {
      this.updateNavigationVisibility(this.router.url);
    });

    // Initial check
    this.updateNavigationVisibility(this.router.url);
  }

  private updateNavigationVisibility(url: string): void {
    const isAuthenticated = this.authService.isAuthenticated();
    const isAuthPage = url.startsWith('/auth');
    const isErrorPage =
      url.startsWith('/unauthorized') || url.startsWith('/not-found');

    this.showNavigation = isAuthenticated && !isAuthPage && !isErrorPage;
  }
}
