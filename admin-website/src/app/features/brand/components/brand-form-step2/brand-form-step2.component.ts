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

  errors: { [key: string]: string } = {};

  onSaveAndFinish(): void {
    this.errors = {};
    let hasErrors = false;

    if (!this.formData.status) {
      this.errors['status'] = 'Please select status';
      hasErrors = true;
    }

    if (hasErrors) {
      setTimeout(() => {
        const firstError = document.querySelector('.error');
        if (firstError) {
          firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 100);
      return;
    }

    this.save.emit(this.formData);
  }

  clearError(field: string): void {
    if (this.errors[field]) {
      delete this.errors[field];
    }
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

