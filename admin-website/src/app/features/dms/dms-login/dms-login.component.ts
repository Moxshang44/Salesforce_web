import { Component, OnDestroy } from '@angular/core';
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
export class DmsLoginComponent implements OnDestroy {
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
    private router: Router
  ) {
    // Redirect if already logged in to DMS
    if (this.authService.isDmsAuthenticated()) {
      this.router.navigate(['/dms/dashboard']);
    }
  }

  validateMobileNumber(mobile: string): boolean {
    // DMS mobile number validation (10 digits, can start with 0-9)
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

    this.isSendingOtp = true;
    
    // Simulate OTP sending (replace with actual API call)
    setTimeout(() => {
      if (this.authService.sendDmsOtp(this.mobileNumber)) {
        this.otpSent = true;
        this.otpSentTime = Date.now();
        this.startResendTimer();
        this.errorMessage = '';
      } else {
        this.errorMessage = 'Failed to send OTP. Please try again.';
      }
      this.isSendingOtp = false;
    }, 1000);
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

    this.isSubmitting = true;

    if (this.authService.dmsLoginWithOtp(this.mobileNumber, this.otp)) {
      this.router.navigate(['/dms/dashboard']);
    } else {
      this.errorMessage = 'Invalid OTP. Please try again.';
      this.otp = '';
      this.isSubmitting = false;
    }
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

