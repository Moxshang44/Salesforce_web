import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { ButtonComponent } from '../../../shared/components/button/button.component';

@Component({
  selector: 'app-super-admin-login',
  standalone: true,
  imports: [CommonModule, FormsModule, ButtonComponent],
  templateUrl: './super-admin-login.component.html',
  styleUrl: './super-admin-login.component.scss'
})
export class SuperAdminLoginComponent {
  password = '';
  errorMessage = '';
  isSubmitting = false;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {
    // If already authenticated, redirect to companies page
    if (this.authService.isSuperAdminAuthenticated()) {
      this.router.navigate(['/super-admin/companies']);
    }
  }

  onSubmit(): void {
    this.errorMessage = '';
    
    if (!this.password) {
      this.errorMessage = 'Please enter the password';
      return;
    }

    this.isSubmitting = true;

    if (this.authService.superAdminLogin(this.password)) {
      this.router.navigate(['/super-admin/companies']);
    } else {
      this.errorMessage = 'Invalid password. Please try again.';
      this.password = '';
      this.isSubmitting = false;
    }
  }

  onPasswordKeyPress(event: KeyboardEvent): void {
    if (event.key === 'Enter' && !this.isSubmitting && this.password) {
      event.preventDefault();
      this.onSubmit();
    }
  }
}

