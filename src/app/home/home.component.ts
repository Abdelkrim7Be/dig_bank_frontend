import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterLink],
  template: `
    <div class="jumbotron bg-light p-5 rounded">
      <h1 class="display-4">Welcome to Digital Banking</h1>
      <p class="lead">Your secure and convenient digital banking solution</p>
      <hr class="my-4" />
      <p>
        Experience seamless financial management with our cutting-edge platform
      </p>
      <div class="d-grid gap-2 d-md-flex justify-content-md-start">
        <a
          class="btn btn-primary btn-lg me-md-2"
          routerLink="/login"
          role="button"
          >Login</a
        >
        <a
          class="btn btn-outline-primary btn-lg"
          routerLink="/register"
          role="button"
          >Register</a
        >
      </div>
    </div>

    <div class="row mt-5">
      <div class="col-md-4 mb-4">
        <div class="card h-100">
          <div class="card-body">
            <h5 class="card-title">Secure Banking</h5>
            <p class="card-text">
              Bank with confidence knowing your data is protected by
              industry-leading security measures.
            </p>
          </div>
        </div>
      </div>
      <div class="col-md-4 mb-4">
        <div class="card h-100">
          <div class="card-body">
            <h5 class="card-title">Easy Transfers</h5>
            <p class="card-text">
              Transfer money between accounts or to other banks with just a few
              clicks.
            </p>
          </div>
        </div>
      </div>
      <div class="col-md-4 mb-4">
        <div class="card h-100">
          <div class="card-body">
            <h5 class="card-title">Financial Insights</h5>
            <p class="card-text">
              Get detailed analytics and insights about your spending habits and
              financial health.
            </p>
          </div>
        </div>
      </div>
    </div>
  `,
})
export class HomeComponent {}
