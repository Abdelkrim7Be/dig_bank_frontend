import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../auth/services/auth.service';
import { environment } from '../../environments/environment';

@Component({
  selector: 'app-auth-debug',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="auth-debug p-4 border rounded bg-light">
      <h4>Authentication Debug Information</h4>
      
      <div class="row">
        <div class="col-md-6">
          <h5>Token Information</h5>
          <ul class="list-group">
            <li class="list-group-item">
              <strong>Token Key:</strong> {{ tokenKey }}
            </li>
            <li class="list-group-item">
              <strong>Token Exists:</strong> 
              <span [class]="tokenExists ? 'text-success' : 'text-danger'">
                {{ tokenExists ? 'Yes' : 'No' }}
              </span>
            </li>
            <li class="list-group-item">
              <strong>Token Length:</strong> {{ tokenLength }}
            </li>
            <li class="list-group-item">
              <strong>Token Preview:</strong> 
              <code>{{ tokenPreview }}</code>
            </li>
            <li class="list-group-item">
              <strong>Token Expired:</strong> 
              <span [class]="tokenExpired ? 'text-danger' : 'text-success'">
                {{ tokenExpired ? 'Yes' : 'No' }}
              </span>
            </li>
            <li class="list-group-item">
              <strong>Token Expiration:</strong> {{ tokenExpiration }}
            </li>
          </ul>
        </div>
        
        <div class="col-md-6">
          <h5>User Information</h5>
          <ul class="list-group">
            <li class="list-group-item">
              <strong>User Exists:</strong> 
              <span [class]="userExists ? 'text-success' : 'text-danger'">
                {{ userExists ? 'Yes' : 'No' }}
              </span>
            </li>
            <li class="list-group-item">
              <strong>Username:</strong> {{ currentUser?.username || 'N/A' }}
            </li>
            <li class="list-group-item">
              <strong>Email:</strong> {{ currentUser?.email || 'N/A' }}
            </li>
            <li class="list-group-item">
              <strong>Role:</strong> {{ currentUser?.role || 'N/A' }}
            </li>
            <li class="list-group-item">
              <strong>Is Authenticated:</strong> 
              <span [class]="isAuthenticated ? 'text-success' : 'text-danger'">
                {{ isAuthenticated ? 'Yes' : 'No' }}
              </span>
            </li>
            <li class="list-group-item">
              <strong>Is Customer:</strong> 
              <span [class]="isCustomer ? 'text-success' : 'text-danger'">
                {{ isCustomer ? 'Yes' : 'No' }}
              </span>
            </li>
          </ul>
        </div>
      </div>
      
      <div class="row mt-3">
        <div class="col-12">
          <h5>Local Storage Contents</h5>
          <div class="bg-dark text-light p-3 rounded">
            <pre>{{ localStorageContents }}</pre>
          </div>
        </div>
      </div>
      
      <div class="row mt-3">
        <div class="col-12">
          <h5>Environment Configuration</h5>
          <ul class="list-group">
            <li class="list-group-item">
              <strong>API URL:</strong> {{ environment.apiUrl }}
            </li>
            <li class="list-group-item">
              <strong>Token Key:</strong> {{ environment.tokenKey }}
            </li>
            <li class="list-group-item">
              <strong>Use Mock API:</strong> {{ environment.useMockApi }}
            </li>
          </ul>
        </div>
      </div>
      
      <div class="row mt-3">
        <div class="col-12">
          <h5>Actions</h5>
          <button class="btn btn-primary me-2" (click)="refreshDebugInfo()">
            Refresh Debug Info
          </button>
          <button class="btn btn-warning me-2" (click)="clearStorage()">
            Clear Storage
          </button>
          <button class="btn btn-info" (click)="testApiCall()">
            Test API Call
          </button>
        </div>
      </div>
      
      <div *ngIf="apiTestResult" class="row mt-3">
        <div class="col-12">
          <h5>API Test Result</h5>
          <div class="alert" [class]="apiTestResult.success ? 'alert-success' : 'alert-danger'">
            <strong>Status:</strong> {{ apiTestResult.status }}<br>
            <strong>Message:</strong> {{ apiTestResult.message }}<br>
            <strong>URL:</strong> {{ apiTestResult.url }}
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .auth-debug {
      font-family: 'Courier New', monospace;
      font-size: 0.9rem;
    }
    
    pre {
      font-size: 0.8rem;
      max-height: 200px;
      overflow-y: auto;
    }
    
    code {
      background-color: #f8f9fa;
      padding: 2px 4px;
      border-radius: 3px;
    }
  `]
})
export class AuthDebugComponent implements OnInit {
  tokenKey = environment.tokenKey;
  tokenExists = false;
  tokenLength = 0;
  tokenPreview = '';
  tokenExpired = false;
  tokenExpiration = '';
  
  userExists = false;
  currentUser: any = null;
  isAuthenticated = false;
  isCustomer = false;
  
  localStorageContents = '';
  environment = environment;
  
  apiTestResult: any = null;

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    this.refreshDebugInfo();
  }

  refreshDebugInfo(): void {
    // Token information
    const token = this.authService.getToken();
    this.tokenExists = !!token;
    this.tokenLength = token?.length || 0;
    this.tokenPreview = token ? `${token.substring(0, 20)}...${token.substring(token.length - 10)}` : 'No token';
    
    // Token expiration
    const expiration = this.authService.getTokenExpirationDate();
    this.tokenExpiration = expiration ? expiration.toLocaleString() : 'N/A';
    this.tokenExpired = expiration ? expiration < new Date() : true;
    
    // User information
    this.currentUser = this.authService.getCurrentUser();
    this.userExists = !!this.currentUser;
    this.isAuthenticated = this.authService.isAuthenticated();
    this.isCustomer = this.authService.isCustomer();
    
    // Local storage contents
    this.localStorageContents = this.getLocalStorageContents();
  }

  private getLocalStorageContents(): string {
    const contents: any = {};
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key) {
        const value = localStorage.getItem(key);
        if (key === this.tokenKey) {
          contents[key] = value ? `${value.substring(0, 20)}...${value.substring(value.length - 10)}` : null;
        } else {
          contents[key] = value;
        }
      }
    }
    return JSON.stringify(contents, null, 2);
  }

  clearStorage(): void {
    if (confirm('Are you sure you want to clear all local storage?')) {
      localStorage.clear();
      this.refreshDebugInfo();
    }
  }

  testApiCall(): void {
    this.apiTestResult = null;
    
    // Test a simple API call to see what happens
    const testUrl = `${environment.apiUrl}/customer/accounts`;
    
    fetch(testUrl, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${this.authService.getToken()}`,
        'Content-Type': 'application/json'
      }
    })
    .then(response => {
      this.apiTestResult = {
        success: response.ok,
        status: response.status,
        message: response.statusText,
        url: testUrl
      };
    })
    .catch(error => {
      this.apiTestResult = {
        success: false,
        status: 'Error',
        message: error.message,
        url: testUrl
      };
    });
  }
}
