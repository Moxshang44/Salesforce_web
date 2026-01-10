import { Injectable } from '@angular/core';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly AUTH_KEY = 'isAuthenticated';
  private readonly DMS_AUTH_KEY = 'isDmsAuthenticated';
  
  // Store OTPs temporarily (in production, this would be handled by backend)
  // Format: { mobileNumber: { otp: string, expiresAt: number } }
  private otpStorage: Map<string, { otp: string; expiresAt: number }> = new Map();
  
  // Valid mobile numbers for demo (in production, this would be validated against database)
  private readonly VALID_ADMIN_MOBILE = '9876543210';
  private readonly VALID_DMS_MOBILE = '9999999999';
  
  // OTP validity duration (5 minutes)
  private readonly OTP_VALIDITY_MS = 5 * 60 * 1000;

  constructor(private router: Router) {}

  // Unified OTP method - works for both Admin and DMS
  sendOtp(mobileNumber: string): boolean {
    // In production, this would call an API to send OTP via SMS
    // For demo, we'll generate a static OTP for the valid mobile number
    try {
      // Generate a 6-digit OTP (for demo, using static '123456')
      // In production, generate random OTP and send via SMS service
      const otp = '123456';
      const expiresAt = Date.now() + this.OTP_VALIDITY_MS;
      
      this.otpStorage.set(mobileNumber, { otp, expiresAt });
      
      // Log for demo purposes (remove in production)
      console.log(`[DEMO] OTP sent to ${mobileNumber}: ${otp}`);
      
      return true;
    } catch (error) {
      console.error('Error sending OTP:', error);
      return false;
    }
  }

  // Unified login method - determines admin or DMS based on mobile number
  loginWithOtp(mobileNumber: string, otp: string): { success: boolean; isDms: boolean } {
    // Validate mobile number format (10 digits)
    if (!/^\d{10}$/.test(mobileNumber)) {
      return { success: false, isDms: false };
    }

    // Check if OTP exists and is valid
    const otpData = this.otpStorage.get(mobileNumber);
    
    if (!otpData) {
      return { success: false, isDms: false };
    }

    // Check if OTP has expired
    if (Date.now() > otpData.expiresAt) {
      this.otpStorage.delete(mobileNumber);
      return { success: false, isDms: false };
    }

    // Verify OTP
    if (otpData.otp !== otp) {
      return { success: false, isDms: false };
    }

    // Determine if this is DMS or Admin based on mobile number
    const isDms = mobileNumber === this.VALID_DMS_MOBILE;
    
    // Clear OTP after successful login
    this.otpStorage.delete(mobileNumber);
    
    if (isDms) {
      // DMS login
      localStorage.setItem(this.DMS_AUTH_KEY, 'true');
      localStorage.setItem('dmsUserMobile', mobileNumber);
      // Clear any admin auth that might exist
      localStorage.removeItem(this.AUTH_KEY);
      localStorage.removeItem('userMobile');
    } else {
      // Admin login
      localStorage.setItem(this.AUTH_KEY, 'true');
      localStorage.setItem('userMobile', mobileNumber);
      // Clear any DMS auth that might exist
      localStorage.removeItem(this.DMS_AUTH_KEY);
      localStorage.removeItem('dmsUserMobile');
    }
    
    return { success: true, isDms };
  }

  // Legacy methods for backward compatibility
  sendDmsOtp(mobileNumber: string): boolean {
    return this.sendOtp(mobileNumber);
  }

  dmsLoginWithOtp(mobileNumber: string, otp: string): boolean {
    const result = this.loginWithOtp(mobileNumber, otp);
    return result.success && result.isDms;
  }

  // Legacy methods (kept for backward compatibility if needed)
  login(username: string, password: string): boolean {
    // Deprecated: Use loginWithOtp instead
    return false;
  }

  dmsLogin(username: string, password: string): boolean {
    // Deprecated: Use dmsLoginWithOtp instead
    return false;
  }

  logout(): void {
    // Clear all auth data
    localStorage.removeItem(this.AUTH_KEY);
    localStorage.removeItem('userMobile');
    localStorage.removeItem(this.DMS_AUTH_KEY);
    localStorage.removeItem('dmsUserMobile');
    this.router.navigate(['/login']);
  }

  dmsLogout(): void {
    // Clear all auth data
    localStorage.removeItem(this.AUTH_KEY);
    localStorage.removeItem('userMobile');
    localStorage.removeItem(this.DMS_AUTH_KEY);
    localStorage.removeItem('dmsUserMobile');
    this.router.navigate(['/login']);
  }

  isAuthenticated(): boolean {
    return localStorage.getItem(this.AUTH_KEY) === 'true';
  }

  isDmsAuthenticated(): boolean {
    return localStorage.getItem(this.DMS_AUTH_KEY) === 'true';
  }
}
