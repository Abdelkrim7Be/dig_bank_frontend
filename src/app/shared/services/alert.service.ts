import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { filter } from 'rxjs/operators';

export interface Alert {
  id: string;
  type: 'success' | 'info' | 'warning' | 'danger';
  message: string;
  autoClose?: boolean;
  keepAfterRouteChange?: boolean;
  fade?: boolean;
}

@Injectable({
  providedIn: 'root',
})
export class AlertService {
  private subject = new Subject<Alert>();
  private defaultId = 'default-alert';

  // Enable subscribing to alerts observable
  onAlert(id = this.defaultId): Observable<Alert> {
    return this.subject.asObservable().pipe(filter((x) => x && x.id === id));
  }

  // Convenience methods
  success(message: string, options?: Partial<Alert>): void {
    this.alert({ type: 'success', message, ...options });
  }

  error(message: string, options?: Partial<Alert>): void {
    this.alert({ type: 'danger', message, ...options });
  }

  info(message: string, options?: Partial<Alert>): void {
    this.alert({ type: 'info', message, ...options });
  }

  warn(message: string, options?: Partial<Alert>): void {
    this.alert({ type: 'warning', message, ...options });
  }

  // Main alert method
  alert(alert: Partial<Alert>): void {
    alert.id = alert.id || this.defaultId;
    alert.autoClose = alert.autoClose === undefined ? true : alert.autoClose;
    alert.keepAfterRouteChange = alert.keepAfterRouteChange || false;
    alert.fade = alert.fade || true;

    this.subject.next(alert as Alert);
  }

  // Clear alerts
  clear(id = this.defaultId): void {
    this.subject.next({ id } as Alert);
  }
}
