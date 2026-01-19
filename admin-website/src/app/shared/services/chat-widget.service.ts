import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ChatWidgetService {
  private isOpenSubject = new Subject<boolean>();
  public isOpen$ = this.isOpenSubject.asObservable();
  
  private enabledSubject = new Subject<boolean>();
  public enabled$ = this.enabledSubject.asObservable();
  
  private _isOpen = false;
  private _isEnabled = true; // Default to enabled

  constructor() {
    // Load saved preference from localStorage
    const saved = localStorage.getItem('aiAssistantEnabled');
    if (saved !== null) {
      this._isEnabled = saved === 'true';
    }
    this.enabledSubject.next(this._isEnabled);
  }

  toggle(): void {
    if (this._isEnabled) {
      this._isOpen = !this._isOpen;
      this.isOpenSubject.next(this._isOpen);
    }
  }

  open(): void {
    if (this._isEnabled) {
      this._isOpen = true;
      this.isOpenSubject.next(this._isOpen);
    }
  }

  close(): void {
    this._isOpen = false;
    this.isOpenSubject.next(this._isOpen);
  }

  toggleEnabled(): void {
    this._isEnabled = !this._isEnabled;
    this.enabledSubject.next(this._isEnabled);
    
    // Save to localStorage
    localStorage.setItem('aiAssistantEnabled', this._isEnabled.toString());
    
    // Close chat if disabling
    if (!this._isEnabled) {
      this.close();
    }
  }

  get isOpen(): boolean {
    return this._isOpen;
  }

  get isEnabled(): boolean {
    return this._isEnabled;
  }
}

