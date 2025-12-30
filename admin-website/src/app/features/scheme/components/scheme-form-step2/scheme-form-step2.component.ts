import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface SchemeVisibilityData {
  label: string;
  selectCountry: string;
  selectZone: string;
  selectRegions: string;
  selectAreas: string;
  startDate: string;
  endDate: string;
  totalDays: string;
  selectClaimType: string;
  selectLead: string;
}

@Component({
  selector: 'app-scheme-form-step2',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './scheme-form-step2.component.html',
  styleUrl: './scheme-form-step2.component.scss'
})
export class SchemeFormStep2Component {
  @Output() save = new EventEmitter<SchemeVisibilityData>();
  @Output() previous = new EventEmitter<void>();

  formData: SchemeVisibilityData = {
    label: '',
    selectCountry: '1 Selected',
    selectZone: 'All Selected',
    selectRegions: 'Select Regions',
    selectAreas: 'All Selected',
    startDate: '26-Nov-2025',
    endDate: '31-Dec-2025',
    totalDays: '57',
    selectClaimType: 'Select',
    selectLead: 'Retailer'
  };

  onPrevious(): void {
    this.previous.emit();
  }

  onSaveAndNext(): void {
    this.save.emit(this.formData);
  }
}
