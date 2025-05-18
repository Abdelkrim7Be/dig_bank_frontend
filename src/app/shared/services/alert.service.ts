import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface Alert {
  id: string;
  type: 'success' | 'info' | 'warning' | 'danger';
  message: string;
  autoClose?: boolean;
  keepAfterRouteChange?: boolean;
}

@Injectable({
  providedIn: 'root',
})
export class AlertService {
  private alertSubject = new BehaviorSubject<Alert[]>([]);
  public alerts$: Observable<Alert[]> = this.alertSubject.asObservable();

  constructor() {}

  success(message: string, options: Partial<Alert> = {}): void {
    this.alert({ ...options, type: 'success', message });
  }

  error(message: string, options: Partial<Alert> = {}): void {
    this.alert({ ...options, type: 'danger', message });
  }

  info(message: string, options: Partial<Alert> = {}): void {
    this.alert({ ...options, type: 'info', message });
  }

  warning(message: string, options: Partial<Alert> = {}): void {
    this.alert({ ...options, type: 'warning', message });
  }

  alert(alert: Partial<Alert>): void {
    const newAlert: Alert = {
      id: this.generateId(),
      type: alert.type || 'info',
      message: alert.message || '',
      autoClose: alert.autoClose !== false,
      keepAfterRouteChange: alert.keepAfterRouteChange || false,
    };

    this.alertSubject.next([...this.alertSubject.value, newAlert]);

    if (newAlert.autoClose) {
      setTimeout(() => this.removeAlert(newAlert), 5000);
    }
  }

  removeAlert(alert: Alert): void {
    this.alertSubject.next(
      this.alertSubject.value.filter((x) => x.id !== alert.id)
    );
  }

  clear(): void {
    this.alertSubject.next([]);
  }

  private generateId(): string {
    return Date.now().toString();
  }
}
