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

  onSaveAndNext(): void {
    // Basic validation
    if (!this.formData.selectedCountry) {
      alert('Please select country');
      return;
    }
    if (!this.formData.bankName) {
      alert('Please enter bank name');
      return;
    }
    if (!this.formData.accountNo) {
      alert('Please enter account number');
      return;
    }
    this.save.emit(this.formData);
  }

  onPrevious(): void {
    this.previous.emit();
  }
}
