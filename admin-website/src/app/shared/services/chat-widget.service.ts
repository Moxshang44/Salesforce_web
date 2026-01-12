import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ChatWidgetService {
  private isOpenSubject = new Subject<boolean>();
  public isOpen$ = this.isOpenSubject.asObservable();
  
  private _isOpen = false;

  constructor() {}

  toggle(): void {
    this._isOpen = !this._isOpen;
    this.isOpenSubject.next(this._isOpen);
  }

  open(): void {
    this._isOpen = true;
    this.isOpenSubject.next(this._isOpen);
  }

  close(): void {
    this._isOpen = false;
    this.isOpenSubject.next(this._isOpen);
  }

  get isOpen(): boolean {
    return this._isOpen;
  }
}

