import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface DistributorFormStep2Data {
  vehicle_3: number;
  vehicle_4: number;
  salesman_count: number;
  area_id: number;
  for_general: boolean;
  for_modern: boolean;
  for_horeca: boolean;
  bank_details: {
    account_number: string;
    account_name: string;
    bank_name: string;
    bank_branch: string;
    account_type: string;
    ifsc_code: string;
  };
}

@Component({
  selector: 'app-distributor-form-step2',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './distributor-form-step2.component.html',
  styleUrl: './distributor-form-step2.component.scss'
})
export class DistributorFormStep2Component {
  @Input() step1Data: any = null;
  @Output() save = new EventEmitter<DistributorFormStep2Data>();
  @Output() previous = new EventEmitter<void>();

  formData: DistributorFormStep2Data = {
    vehicle_3: 0,
    vehicle_4: 0,
    salesman_count: 0,
    area_id: 0,
    for_general: false,
    for_modern: false,
    for_horeca: false,
    bank_details: {
      account_number: '',
      account_name: '',
      bank_name: '',
      bank_branch: '',
      account_type: 'SAVINGS',
      ifsc_code: ''
    }
  };

  accountTypeOptions = ['SAVINGS', 'CURRENT'];
  
  errors: { [key: string]: string } = {};

  onSaveAndFinish(): void {
    // Clear previous errors
    this.errors = {};
    let hasErrors = false;

    // Required field validations
    if (this.formData.vehicle_3 < 0) {
      this.errors['vehicle_3'] = 'Vehicle 3 count must be 0 or greater';
      hasErrors = true;
    }

    if (this.formData.vehicle_4 < 0) {
      this.errors['vehicle_4'] = 'Vehicle 4 count must be 0 or greater';
      hasErrors = true;
    }

    if (this.formData.salesman_count < 0) {
      this.errors['salesman_count'] = 'Salesman count must be 0 or greater';
      hasErrors = true;
    }

    // Ensure area_id is a number and valid
    this.formData.area_id = Number(this.formData.area_id);
    if (!this.formData.area_id || this.formData.area_id < 1 || isNaN(this.formData.area_id)) {
      this.errors['area_id'] = 'Area ID must be at least 1';
      hasErrors = true;
    }

    // Bank details validation (all required)
    if (!this.formData.bank_details.account_number || this.formData.bank_details.account_number.trim() === '') {
      this.errors['account_number'] = 'Account number is required';
      hasErrors = true;
    }

    if (!this.formData.bank_details.account_name || this.formData.bank_details.account_name.trim() === '') {
      this.errors['account_name'] = 'Account name is required';
      hasErrors = true;
    }

    if (!this.formData.bank_details.bank_name || this.formData.bank_details.bank_name.trim() === '') {
      this.errors['bank_name'] = 'Bank name is required';
      hasErrors = true;
    }

    if (!this.formData.bank_details.bank_branch || this.formData.bank_details.bank_branch.trim() === '') {
      this.errors['bank_branch'] = 'Bank branch is required';
      hasErrors = true;
    }

    if (!this.formData.bank_details.ifsc_code || this.formData.bank_details.ifsc_code.trim() === '') {
      this.errors['ifsc_code'] = 'IFSC code is required';
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
