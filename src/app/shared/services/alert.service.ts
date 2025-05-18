import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export type AlertType = 'success' | 'error' | 'info' | 'warning';

export interface Alert {
  type: AlertType;
  message: string;
  id?: string;
  autoClose?: boolean;
  keepAfterRouteChange?: boolean;
}

@Injectable({
  providedIn: 'root',
})
export class AlertService {
  private subject = new BehaviorSubject<Alert[]>([]);
  private defaultId = 'default-alert';
  private autoCloseTimeout = 5000; // 5 seconds

  // Enable subscribing to alerts observable
  onAlert(id = this.defaultId): Observable<Alert[]> {
    return this.subject.asObservable();
  }

  // Convenience methods for different alert types
  success(message: string, options?: any): void {
    this.alert({ ...options, type: 'success', message });
  }

  error(message: string, options?: any): void {
    this.alert({ ...options, type: 'error', message });
  }

  info(message: string, options?: any): void {
    this.alert({ ...options, type: 'info', message });
  }

  warning(message: string, options?: any): void {
    this.alert({ ...options, type: 'warning', message });
  }

  // Main alert method
  alert(alert: Alert): void {
    alert.id = alert.id || this.defaultId;
    alert.autoClose = alert.autoClose !== false;

    // Clear alerts with the same ID
    this.clear(alert.id);

    // Add alert to array
    const currentAlerts = this.subject.value;
    this.subject.next([...currentAlerts, alert]);

    // Auto close alert if required
    if (alert.autoClose) {
      setTimeout(() => this.clear(alert.id), this.autoCloseTimeout);
    }
  }

  // Clear alerts
  clear(id = this.defaultId): void {
    const currentAlerts = this.subject.value;
    this.subject.next(currentAlerts.filter((x) => x.id !== id));
  }
}
