import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-dms-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './dms-login.component.html',
  styleUrl: './dms-login.component.scss'
})
export class DmsLoginComponent {
  username = '';
  password = '';
  errorMessage = '';
  showPassword = false;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {
    // Redirect if already logged in to DMS
    if (this.authService.isDmsAuthenticated()) {
      this.router.navigate(['/dms/dashboard']);
    }
  }

  onSubmit(): void {
    this.errorMessage = '';

    if (!this.username || !this.password) {
      this.errorMessage = 'Please enter both username and password';
      return;
    }

    if (this.authService.dmsLogin(this.username, this.password)) {
      this.router.navigate(['/dms/dashboard']);
    } else {
      this.errorMessage = 'Invalid username or password';
      this.password = '';
    }
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }
}

