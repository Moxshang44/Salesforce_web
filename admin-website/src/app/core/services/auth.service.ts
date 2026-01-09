import { Injectable } from '@angular/core';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly VALID_USERNAME = 'testadmin';
  private readonly VALID_PASSWORD = '111111';
  private readonly AUTH_KEY = 'isAuthenticated';
  
  // DMS credentials
  private readonly DMS_USERNAME = 'dmsuser';
  private readonly DMS_PASSWORD = 'dms123';
  private readonly DMS_AUTH_KEY = 'isDmsAuthenticated';

  constructor(private router: Router) {}

  login(username: string, password: string): boolean {
    if (username === this.VALID_USERNAME && password === this.VALID_PASSWORD) {
      localStorage.setItem(this.AUTH_KEY, 'true');
      return true;
    }
    return false;
  }

  dmsLogin(username: string, password: string): boolean {
    if (username === this.DMS_USERNAME && password === this.DMS_PASSWORD) {
      localStorage.setItem(this.DMS_AUTH_KEY, 'true');
      return true;
    }
    return false;
  }

  logout(): void {
    localStorage.removeItem(this.AUTH_KEY);
    this.router.navigate(['/login']);
  }

  dmsLogout(): void {
    localStorage.removeItem(this.DMS_AUTH_KEY);
    this.router.navigate(['/dms']);
  }

  isAuthenticated(): boolean {
    return localStorage.getItem(this.AUTH_KEY) === 'true';
  }

  isDmsAuthenticated(): boolean {
    return localStorage.getItem(this.DMS_AUTH_KEY) === 'true';
  }
}
