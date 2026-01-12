import { Component, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AuthService } from '../../core/services/auth.service';
import { ApiService } from '../../core/services/api.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent implements OnDestroy {
  mobileNumber = '';
  otp = '';
  errorMessage = '';
  otpSent = false;
  otpSentTime: number | null = null;
  resendCooldown = 60; // seconds
  resendTimer: any = null;
  isSubmitting = false;
  isSendingOtp = false;

  constructor(
    private authService: AuthService,
    private router: Router,
    private http: HttpClient,
    private apiService: ApiService
  ) {
    // Redirect if already logged in
    if (this.authService.isAuthenticated()) {
      this.router.navigate(['/admin/dashboard']);
    } else if (this.authService.isDmsAuthenticated()) {
      this.router.navigate(['/dms/dashboard']);
    }
  }

  validateMobileNumber(mobile: string): boolean {
    // Admin mobile number validation (10 digits, can start with 0-9)
    const mobileRegex = /^\d{10}$/;
    return mobileRegex.test(mobile);
  }

  onSendOtp(): void {
    this.errorMessage = '';

    if (!this.mobileNumber) {
      this.errorMessage = 'Please enter your mobile number';
      return;
    }

    if (!this.validateMobileNumber(this.mobileNumber)) {
      this.errorMessage = 'Please enter a valid 10-digit mobile number';
      return;
    }

    // Check if this is a demo credential
    const isDemoCredential = this.mobileNumber === '9876543210' || this.mobileNumber === '9999999999';
    
    // For demo credentials, skip API call and show OTP input directly
    if (isDemoCredential) {
      this.otpSent = true;
      this.otpSentTime = Date.now();
      this.startResendTimer();
      this.errorMessage = '';
      // Store OTP for demo credentials
      this.authService.sendOtp(this.mobileNumber);
      return;
    }

    this.isSendingOtp = true;
    
    // Call API to generate OTP for non-demo credentials
    const url = this.apiService.getApiUrl('auth/generate-otp');
    const headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });

    const payload = {
      username: null, // Optional field
      contact_no: this.mobileNumber
    };

    this.http.post<any>(url, payload, { headers }).subscribe({
      next: (response: any) => {
        this.isSendingOtp = false;
        console.log('OTP generation response:', response);
        
        // Check if OTP was sent successfully
        // Show OTP input field if API call was successful (even if response format varies)
        // Assume success if we get a response (no error)
        this.otpSent = true;
        this.otpSentTime = Date.now();
        this.startResendTimer();
        this.errorMessage = '';
        
        // Also update the local auth service for backward compatibility
        this.authService.sendOtp(this.mobileNumber);
      },
      error: (error: any) => {
        this.isSendingOtp = false;
        console.error('Error generating OTP:', error);
        
        // Handle different error formats
        if (error.error) {
          if (error.error.message) {
            this.errorMessage = error.error.message;
          } else if (typeof error.error === 'string') {
            this.errorMessage = error.error;
      } else {
        this.errorMessage = 'Failed to send OTP. Please try again.';
      }
        } else if (error.message) {
          this.errorMessage = error.message;
        } else {
          this.errorMessage = 'Failed to send OTP. Please check your connection and try again.';
        }
      }
    });
  }

  onSubmit(): void {
    this.errorMessage = '';

    if (!this.mobileNumber) {
      this.errorMessage = 'Please enter your mobile number';
      return;
    }

    if (!this.validateMobileNumber(this.mobileNumber)) {
      this.errorMessage = 'Please enter a valid 10-digit mobile number';
      return;
    }

    if (!this.otpSent) {
      this.errorMessage = 'Please send OTP first';
      return;
    }

    if (!this.otp) {
      this.errorMessage = 'Please enter the OTP';
      return;
    }

    if (this.otp.length !== 6) {
      this.errorMessage = 'Please enter a valid 6-digit OTP';
      return;
    }

    // Check if this is a demo credential
    const isDemoCredential = this.mobileNumber === '9876543210' || this.mobileNumber === '9999999999';
    
    // For demo credentials, use local verification
    if (isDemoCredential && this.otp === '123456') {
    this.isSubmitting = true;
    const loginResult = this.authService.loginWithOtp(this.mobileNumber, this.otp);
    
    if (loginResult.success) {
      // Route based on mobile number (admin or DMS)
      if (loginResult.isDms) {
        this.router.navigate(['/dms/dashboard']);
      } else {
        this.router.navigate(['/admin/dashboard']);
      }
    } else {
      this.errorMessage = 'Invalid OTP. Please try again.';
      this.otp = '';
      this.isSubmitting = false;
    }
      return;
    }

    // For other credentials, call verify-otp API
    this.isSubmitting = true;
    
    const url = this.apiService.getApiUrl('auth/verify-otp');
    const headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });

    const payload = {
      username: null, // Optional field
      contact_no: this.mobileNumber,
      otp_code: this.otp
    };

    this.http.post<any>(url, payload, { headers }).subscribe({
      next: (response: any) => {
        this.isSubmitting = false;
        console.log('OTP verification response:', response);
        
        // Check if OTP verification was successful
        // The API might return different response formats, adjust based on actual response
        if (response.status_code === 200 || response.status_code === 1 || response.success || response.data) {
          // OTP verified successfully
          
          // Store token and company info from response
          if (response.data) {
            if (response.data.token) {
              this.authService.setAuthToken(response.data.token);
            }
            if (response.data.companies && Array.isArray(response.data.companies) && response.data.companies.length > 0) {
              this.authService.setCompanyInfo(response.data.companies);
            }
          }
          
          // Now login using auth service
          const loginResult = this.authService.loginWithOtp(this.mobileNumber, this.otp);
          
          if (loginResult.success) {
            // Route based on mobile number (admin or DMS)
            // You might want to check the API response to determine if it's DMS or Admin
            // For now, using the mobile number logic
            if (loginResult.isDms) {
              this.router.navigate(['/dms/dashboard']);
            } else {
              this.router.navigate(['/admin/dashboard']);
            }
          } else {
            this.errorMessage = 'Login failed. Please try again.';
            this.otp = '';
          }
        } else {
          this.errorMessage = response.message || 'Invalid OTP. Please try again.';
          this.otp = '';
        }
      },
      error: (error: any) => {
        this.isSubmitting = false;
        console.error('Error verifying OTP:', error);
        
        // Handle different error formats
        if (error.error) {
          if (error.error.message) {
            this.errorMessage = error.error.message;
          } else if (typeof error.error === 'string') {
            this.errorMessage = error.error;
          } else {
            this.errorMessage = 'Invalid OTP. Please try again.';
          }
        } else if (error.message) {
          this.errorMessage = error.message;
        } else {
          this.errorMessage = 'Failed to verify OTP. Please check your connection and try again.';
        }
        
        this.otp = '';
      }
    });
  }

  startResendTimer(): void {
    this.resendCooldown = 60;
    if (this.resendTimer) {
      clearInterval(this.resendTimer);
    }
    this.resendTimer = setInterval(() => {
      this.resendCooldown--;
      if (this.resendCooldown <= 0) {
        clearInterval(this.resendTimer);
        this.resendTimer = null;
      }
    }, 1000);
  }

  onResendOtp(): void {
    if (this.resendCooldown > 0) {
      return;
    }
    this.otp = '';
    this.onSendOtp();
  }

  onMobileNumberChange(): void {
    // Reset OTP fields if mobile number changes
    if (this.otpSent) {
      this.otpSent = false;
      this.otp = '';
      if (this.resendTimer) {
        clearInterval(this.resendTimer);
        this.resendTimer = null;
      }
      this.resendCooldown = 60;
    }
  }

  onMobileNumberKeyPress(event: KeyboardEvent): void {
    if (event.key === 'Enter' && !this.otpSent && !this.isSendingOtp) {
      event.preventDefault();
      if (this.mobileNumber && this.mobileNumber.length === 10) {
        this.onSendOtp();
      }
    }
  }

  ngOnDestroy(): void {
    if (this.resendTimer) {
      clearInterval(this.resendTimer);
    }
  }
}
