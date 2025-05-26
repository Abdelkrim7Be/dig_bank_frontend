import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-inline-alert',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div 
      *ngIf="message"
      class="alert"
      [ngClass]="getAlertClass()"
      role="alert">
      
      <div class="d-flex align-items-start">
        <div class="alert-icon me-2" *ngIf="showIcon">
          <i [ngClass]="getIconClass()"></i>
        </div>
        
        <div class="flex-grow-1">
          <div class="alert-title" *ngIf="title">
            <strong>{{ title }}</strong>
          </div>
          <div class="alert-message">
            {{ message }}
          </div>
        </div>
        
        <button 
          *ngIf="dismissible"
          type="button" 
          class="btn-close" 
          [attr.aria-label]="'Close'"
          (click)="onDismiss()">
        </button>
      </div>
    </div>
  `,
  styles: [`
    .alert {
      border: none;
      border-radius: 8px;
      margin-bottom: 1rem;
    }

    .alert-success {
      background-color: rgba(42, 157, 143, 0.1);
      border-left: 4px solid var(--success-green);
      color: var(--success-green);
    }

    .alert-danger {
      background-color: rgba(231, 111, 81, 0.1);
      border-left: 4px solid var(--danger-orange);
      color: var(--danger-orange);
    }

    .alert-warning {
      background-color: rgba(233, 196, 106, 0.1);
      border-left: 4px solid var(--warning-yellow);
      color: var(--dark-gray);
    }

    .alert-info {
      background-color: rgba(230, 57, 70, 0.1);
      border-left: 4px solid var(--primary-red);
      color: var(--primary-red);
    }

    .alert-icon {
      font-size: 1.1rem;
      margin-top: 2px;
    }

    .alert-title {
      font-size: 0.95rem;
      margin-bottom: 2px;
    }

    .alert-message {
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
  `]
})
export class InlineAlertComponent {
  @Input() type: 'success' | 'error' | 'warning' | 'info' | 'danger' = 'info';
  @Input() title?: string;
  @Input() message: string = '';
  @Input() dismissible: boolean = true;
  @Input() showIcon: boolean = true;
  @Output() dismissed = new EventEmitter<void>();

  getAlertClass(): string {
    switch (this.type) {
      case 'success':
        return 'alert-success';
      case 'error':
      case 'danger':
        return 'alert-danger';
      case 'warning':
        return 'alert-warning';
      case 'info':
        return 'alert-info';
      default:
        return 'alert-info';
    }
  }

  getIconClass(): string {
    switch (this.type) {
      case 'success':
        return 'bi bi-check-circle-fill';
      case 'error':
      case 'danger':
        return 'bi bi-exclamation-triangle-fill';
      case 'warning':
        return 'bi bi-exclamation-circle-fill';
      case 'info':
        return 'bi bi-info-circle-fill';
      default:
        return 'bi bi-info-circle-fill';
    }
  }

  onDismiss(): void {
    this.dismissed.emit();
  }
}
