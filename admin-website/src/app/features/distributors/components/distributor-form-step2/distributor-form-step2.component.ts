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

  onSaveAndFinish(): void {
    // Basic validation
    if (!this.formData.bankName) {
      alert('Please enter bank name');
      return;
    }
    if (!this.formData.accountNumber) {
      alert('Please enter account number');
      return;
    }
    this.save.emit(this.formData);
  }

  onPrevious(): void {
    this.previous.emit();
  }
}
