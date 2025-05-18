import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class LoaderService {
  private loadingSubject = new BehaviorSubject<boolean>(false);
  private requestCount = 0;

  loading$: Observable<boolean> = this.loadingSubject.asObservable();

  show(): void {
    this.requestCount++;
    this.loadingSubject.next(true);
  }

  hide(): void {
    this.requestCount--;
    if (this.requestCount <= 0) {
      this.requestCount = 0;
      this.loadingSubject.next(false);
    }
  }

  isLoading(): boolean {
    return this.loadingSubject.value;
  }
}
