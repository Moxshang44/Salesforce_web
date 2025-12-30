import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface BrandFormStep2Data {
  status: string;
  isActive: boolean;
  visibleToDistributors: boolean;
  visibleToStockists: boolean;
  allowOnlineOrders: boolean;
  minimumOrderQuantity: string;
  manufacturingCountry: string;
  certifications: string;
  tags: string[];
  notes: string;
}

@Component({
  selector: 'app-brand-form-step2',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './brand-form-step2.component.html',
  styleUrl: './brand-form-step2.component.scss'
})
export class BrandFormStep2Component {
  @Output() save = new EventEmitter<BrandFormStep2Data>();
  @Output() previous = new EventEmitter<void>();

  formData: BrandFormStep2Data = {
    status: 'Active',
    isActive: true,
    visibleToDistributors: true,
    visibleToStockists: true,
    allowOnlineOrders: true,
    minimumOrderQuantity: '',
    manufacturingCountry: 'India',
    certifications: '',
    tags: [],
    notes: ''
  };

  statusOptions = ['Active', 'Inactive', 'Pending', 'Discontinued'];
  countryOptions = ['India', 'USA', 'UK', 'Germany', 'Japan', 'China', 'Other'];
  tagInput: string = '';

  onSaveAndFinish(): void {
    this.save.emit(this.formData);
  }

  onPrevious(): void {
    this.previous.emit();
  }

  addTag(): void {
    if (this.tagInput.trim() && !this.formData.tags.includes(this.tagInput.trim())) {
      this.formData.tags.push(this.tagInput.trim());
      this.tagInput = '';
    }
  }

  removeTag(tag: string): void {
    this.formData.tags = this.formData.tags.filter(t => t !== tag);
  }
}

