import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface RetailerFormStep2Data {
  selectedCountry: string;
  selectedZone: string;
  selectedRegion: string;
  selectedArea: string;
  selectedDivision: string;
  selectedRoute: string;
  bankName: string;
  bankBranch: string;
  ifscCode: string;
  accountType: string;
  accountNo: string;
  accountName: string;
}

@Component({
  selector: 'app-retailer-form-step2',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './retailer-form-step2.component.html',
  styleUrl: './retailer-form-step2.component.scss'
})
export class RetailerFormStep2Component {
  @Output() save = new EventEmitter<RetailerFormStep2Data>();
  @Output() previous = new EventEmitter<void>();

  formData: RetailerFormStep2Data = {
    selectedCountry: 'India',
    selectedZone: '',
    selectedRegion: '',
    selectedArea: '',
    selectedDivision: '',
    selectedRoute: '',
    bankName: '',
    bankBranch: '',
    ifscCode: '',
    accountType: 'Current Account',
    accountNo: '',
    accountName: ''
  };

  countryOptions = ['India', 'USA', 'UK', 'Germany', 'Japan'];
  zoneOptions = ['North Zone', 'South Zone', 'East Zone', 'West Zone', 'Central Zone'];
  regionOptions = ['North Region', 'South Region', 'East Region', 'West Region', 'Central Region'];
  areaOptions = ['Area A', 'Area B', 'Area C', 'Area D', 'Area E'];
  divisionOptions = ['Division 1', 'Division 2', 'Division 3', 'Division 4'];
  routeOptions = ['Route 1', 'Route 2', 'Route 3', 'Route 4', 'Route 5'];
  
  errors: { [key: string]: string } = {};

  onSaveAndNext(): void {
    // Clear previous errors
    this.errors = {};
    let hasErrors = false;

    // Basic validation
    if (!this.formData.selectedCountry || this.formData.selectedCountry.trim() === '') {
      this.errors['selectedCountry'] = 'Please select country';
      hasErrors = true;
    }
    if (!this.formData.bankName || this.formData.bankName.trim() === '') {
      this.errors['bankName'] = 'Please enter bank name';
      hasErrors = true;
    }
    if (!this.formData.accountNo || this.formData.accountNo.trim() === '') {
      this.errors['accountNo'] = 'Please enter account number';
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

  onPrevious(): void {
    this.previous.emit();
  }
}
