import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface DistributorFormStep2Data {
  vehicles3Wheeler: string;
  vehicles4Wheeler: string;
  salesmanCount: string;
  channelVisibility: {
    generalTrade: boolean;
    modernTrade: boolean;
    horecaTrade: boolean;
  };
  bankName: string;
  bankBranch: string;
  ifscCode: string;
  accountType: string;
  accountNumber: string;
  accountName: string;
}

@Component({
  selector: 'app-distributor-form-step2',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './distributor-form-step2.component.html',
  styleUrl: './distributor-form-step2.component.scss'
})
export class DistributorFormStep2Component {
  @Output() save = new EventEmitter<DistributorFormStep2Data>();
  @Output() previous = new EventEmitter<void>();

  formData: DistributorFormStep2Data = {
    vehicles3Wheeler: '',
    vehicles4Wheeler: '',
    salesmanCount: '',
    channelVisibility: {
      generalTrade: false,
      modernTrade: false,
      horecaTrade: true
    },
    bankName: '',
    bankBranch: '',
    ifscCode: '',
    accountType: 'Current Account',
    accountNumber: '',
    accountName: ''
  };
  
  errors: { [key: string]: string } = {};

  onSaveAndFinish(): void {
    // Clear previous errors
    this.errors = {};
    let hasErrors = false;

    // Basic validation
    if (!this.formData.bankName || this.formData.bankName.trim() === '') {
      this.errors['bankName'] = 'Please enter bank name';
      hasErrors = true;
    }
    if (!this.formData.accountNumber || this.formData.accountNumber.trim() === '') {
      this.errors['accountNumber'] = 'Please enter account number';
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
