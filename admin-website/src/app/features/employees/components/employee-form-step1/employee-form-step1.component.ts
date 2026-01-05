import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface DayRoute {
  day: string;
  route: string;
}

interface EmployeeFormData {
  employeeName: string;
  employeeId: string;
  countryCode: string;
  mobileNumber: string;
  aadhaarNumber: string;
  role: string;
  reportingManager: string;
  selectedCountry: string;
  selectedZone: string;
  selectedRegion: string;
  selectedArea: string;
  employeeRoute: string;
  startDate: string;
  endDate: string;
  weekSchedule: DayRoute[];
}

@Component({
  selector: 'app-employee-form-step1',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './employee-form-step1.component.html',
  styleUrl: './employee-form-step1.component.scss'
})
export class EmployeeFormStep1Component {
  @Output() save = new EventEmitter<EmployeeFormData>();
  @Output() cancel = new EventEmitter<void>();

  weekSchedule: DayRoute[] = [
    { day: 'Monday', route: '' },
    { day: 'Tuesday', route: '' },
    { day: 'Wednesday', route: '' },
    { day: 'Thursday', route: '' },
    { day: 'Friday', route: '' },
    { day: 'Saturday', route: '' }
  ];

  formData: EmployeeFormData = {
    employeeName: '',
    employeeId: '',
    countryCode: '+91',
    mobileNumber: '',
    aadhaarNumber: '',
    role: 'SR',
    reportingManager: '',
    selectedCountry: 'India',
    selectedZone: '1 Selected',
    selectedRegion: '1 Selected',
    selectedArea: 'India',
    employeeRoute: 'Permanent',
    startDate: '',
    endDate: '',
    weekSchedule: this.weekSchedule
  };

  countryCodeOptions = ['+91', '+1', '+44', '+86', '+81', '+61'];
  roleOptions = ['SR', 'ASM', 'RSM', 'ZSM', 'NSM', 'SO'];
  reportingManagerOptions = ['Rahul Sharma', 'Pooja Mehta', 'Sanjay Khamla', 'Amit Verma', 'Manoj Deo'];
  countryOptions = ['India', 'USA', 'UK', 'Germany', 'Japan'];
  zoneOptions = ['1 Selected', 'North Zone', 'South Zone', 'East Zone', 'West Zone'];
  regionOptions = ['1 Selected', 'North Region', 'South Region', 'East Region', 'West Region'];
  areaOptions = ['India', 'Area 1', 'Area 2', 'Area 3'];
  routeOptions = ['Route 1 Name', 'Route 2 Name', 'Route 3 Name', 'Route 4 Name', 'Route 5 Name', 'Disable'];
  
  errors: { [key: string]: string } = {};

  // Auto-generate employee ID
  generateEmployeeId(): void {
    if (this.formData.employeeName) {
      const prefix = 'SR-EMP';
      const randomNum = Math.floor(100 + Math.random() * 900);
      this.formData.employeeId = `${prefix}-${randomNum}`;
      this.clearError('employeeName');
      this.clearError('employeeId');
    }
  }

  onSaveAndNext(): void {
    // Clear previous errors
    this.errors = {};
    let hasErrors = false;

    // Basic validation
    if (!this.formData.employeeName || this.formData.employeeName.trim() === '') {
      this.errors['employeeName'] = 'Please enter employee name';
      hasErrors = true;
    }
    if (!this.formData.employeeId || this.formData.employeeId.trim() === '') {
      this.errors['employeeId'] = 'Please enter employee ID';
      hasErrors = true;
    }
    if (!this.formData.mobileNumber || this.formData.mobileNumber.trim() === '') {
      this.errors['mobileNumber'] = 'Please enter mobile number';
      hasErrors = true;
    }

    if (hasErrors) {
      // Scroll to first error
      const firstErrorField = document.querySelector('.error-message');
      if (firstErrorField) {
        firstErrorField.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      return;
    }

    this.save.emit(this.formData);
  }

  clearError(fieldName: string): void {
    if (this.errors[fieldName]) {
      delete this.errors[fieldName];
    }
  }

  onCancel(): void {
    this.cancel.emit();
  }
}
