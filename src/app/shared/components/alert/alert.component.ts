import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { Router, NavigationStart } from '@angular/router';
import { Subscription } from 'rxjs';
import { AlertService, Alert } from '../../services/alert.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-alert',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './alert.component.html',
  styleUrls: ['./alert.component.scss'],
})
export class AlertComponent implements OnInit, OnDestroy {
  @Input() id = 'default-alert';
  @Input() fade = true;

  alerts: Alert[] = [];
  alertSubscription!: Subscription;
  routeSubscription!: Subscription;

  constructor(private router: Router, private alertService: AlertService) {}

  ngOnInit(): void {
    // Subscribe to new alert notifications
    this.alertSubscription = this.alertService
      .onAlert(this.id)
      .subscribe((alert: Alert) => {
        // Clear alerts when an empty alert is received
        if (!alert.message) {
          // Filter out alerts without 'keepAfterRouteChange' flag
          this.alerts = this.alerts.filter((x) => x.keepAfterRouteChange);

          // Remove 'keepAfterRouteChange' flag on the rest
          this.alerts.forEach((x) => delete x.keepAfterRouteChange);
          return;
        }

        // Add alert to array
        this.alerts.push(alert);

        // Auto close alert if required
        if (alert.autoClose) {
          setTimeout(() => this.removeAlert(alert), 3000);
        }
      });

    // Clear alerts on location change
    this.routeSubscription = this.router.events.subscribe((event) => {
      if (event instanceof NavigationStart) {
        this.alertService.clear(this.id);
      }
    });
  }

  ngOnDestroy(): void {
    // Unsubscribe to avoid memory leaks
    this.alertSubscription.unsubscribe();
    this.routeSubscription.unsubscribe();
  }

  removeAlert(alert: Alert): void {
    // Check if alert has already been removed
    if (!this.alerts.includes(alert)) return;

    if (this.fade) {
      // Fade out alert
      alert.fade = false;

      // Remove alert after faded out
      setTimeout(() => {
        this.alerts = this.alerts.filter((x) => x !== alert);
      }, 250);
    } else {
      // Remove alert
      this.alerts = this.alerts.filter((x) => x !== alert);
    }
  }

  cssClass(alert: Alert): string {
    if (!alert) return '';

    const alertTypeClass = {
      success: 'alert-success',
      error: 'alert-danger',
      info: 'alert-info',
      warning: 'alert-warning',
      danger: 'alert-danger',
    };

    const classes = ['alert', 'alert-dismissible'];

    if (alert.type) {
      classes.push(alertTypeClass[alert.type]);
    }

    if (alert.fade) {
      classes.push('fade');
    }

    return classes.join(' ');
  }
}
