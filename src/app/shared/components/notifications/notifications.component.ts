import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { NotificationService, Notification } from '../../../core/services/notification.service';

@Component({
  selector: 'app-notifications',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="notification-container">
      <div 
        *ngFor="let notification of notifications" 
        class="alert notification-alert"
        [ngClass]="getAlertClass(notification.type)"
        [attr.role]="'alert'">
        
        <div class="d-flex align-items-start">
          <div class="notification-icon me-3">
            <i [ngClass]="getIconClass(notification.type)"></i>
          </div>
          
          <div class="flex-grow-1">
            <div class="notification-title" *ngIf="notification.title">
              <strong>{{ notification.title }}</strong>
            </div>
            <div class="notification-message">
              {{ notification.message }}
            </div>
          </div>
          
          <button 
            *ngIf="notification.dismissible"
            type="button" 
            class="btn-close" 
            [attr.aria-label]="'Close'"
            (click)="dismiss(notification.id)">
          </button>
        </div>
        
        <!-- Progress bar for auto-dismiss -->
        <div 
          *ngIf="notification.duration && notification.duration > 0"
          class="notification-progress">
          <div 
            class="progress-bar"
            [style.animation-duration.ms]="notification.duration">
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .notification-container {
      position: fixed;
      top: 20px;
      right: 20px;
      z-index: 1050;
      max-width: 400px;
      width: 100%;
    }

    .notification-alert {
      margin-bottom: 10px;
      border: none;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      animation: slideIn 0.3s ease-out;
      position: relative;
      overflow: hidden;
    }

    .notification-alert.alert-success {
      background-color: rgba(42, 157, 143, 0.1);
      border-left: 4px solid var(--success-green);
      color: var(--success-green);
    }

    .notification-alert.alert-danger {
      background-color: rgba(231, 111, 81, 0.1);
      border-left: 4px solid var(--danger-orange);
      color: var(--danger-orange);
    }

    .notification-alert.alert-warning {
      background-color: rgba(233, 196, 106, 0.1);
      border-left: 4px solid var(--warning-yellow);
      color: var(--dark-gray);
    }

    .notification-alert.alert-info {
      background-color: rgba(230, 57, 70, 0.1);
      border-left: 4px solid var(--primary-red);
      color: var(--primary-red);
    }

    .notification-icon {
      font-size: 1.2rem;
      margin-top: 2px;
    }

    .notification-title {
      font-size: 0.95rem;
      margin-bottom: 2px;
    }

    .notification-message {
      font-size: 0.9rem;
      line-height: 1.4;
    }

    .btn-close {
      background: none;
      border: none;
      font-size: 1.2rem;
      opacity: 0.6;
      cursor: pointer;
      padding: 0;
      width: 20px;
      height: 20px;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .btn-close:hover {
      opacity: 1;
    }

    .btn-close::before {
      content: '×';
      font-size: 1.5rem;
      line-height: 1;
    }

    .notification-progress {
      position: absolute;
      bottom: 0;
      left: 0;
      right: 0;
      height: 3px;
      background-color: rgba(255, 255, 255, 0.3);
    }

    .progress-bar {
      height: 100%;
      background-color: currentColor;
      opacity: 0.7;
      animation: progressBar linear forwards;
      transform-origin: left;
    }

    @keyframes slideIn {
      from {
        transform: translateX(100%);
        opacity: 0;
      }
      to {
        transform: translateX(0);
        opacity: 1;
      }
    }

    @keyframes progressBar {
      from {
        transform: scaleX(1);
      }
      to {
        transform: scaleX(0);
      }
    }

    /* Mobile responsiveness */
    @media (max-width: 768px) {
      .notification-container {
        top: 10px;
        right: 10px;
        left: 10px;
        max-width: none;
      }
    }
  `]
})
export class NotificationsComponent implements OnInit, OnDestroy {
  notifications: Notification[] = [];
  private subscription?: Subscription;

  constructor(private notificationService: NotificationService) {}

  ngOnInit(): void {
    this.subscription = this.notificationService.notifications$.subscribe(
      notifications => {
        this.notifications = notifications;
      }
    );
  }

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  dismiss(id: string): void {
    this.notificationService.dismiss(id);
  }

  getAlertClass(type: string): string {
    switch (type) {
      case 'success':
        return 'alert-success';
      case 'error':
        return 'alert-danger';
      case 'warning':
        return 'alert-warning';
      case 'info':
        return 'alert-info';
      default:
        return 'alert-info';
    }
  }

  getIconClass(type: string): string {
    switch (type) {
      case 'success':
        return 'bi bi-check-circle-fill';
      case 'error':
        return 'bi bi-exclamation-triangle-fill';
      case 'warning':
        return 'bi bi-exclamation-circle-fill';
      case 'info':
        return 'bi bi-info-circle-fill';
      default:
        return 'bi bi-info-circle-fill';
    }
  }
}
