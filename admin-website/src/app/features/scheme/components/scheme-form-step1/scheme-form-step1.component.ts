import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface SchemeFormData {
  schemeBasedOn: string;
  schemeName: string;
  schemeCode: string;
  selectOne: string;
  buyUnits: string;
  buyUnitsValue: string;
  getFreeUnits: string;
  getFreeUnitsValue: string;
  maxFreeUnits: string;
}

@Component({
  selector: 'app-scheme-form-step1',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './scheme-form-step1.component.html',
  styleUrl: './scheme-form-step1.component.scss'
})
export class SchemeFormStep1Component {
  @Output() save = new EventEmitter<SchemeFormData>();
  @Output() cancel = new EventEmitter<void>();

  formData: SchemeFormData = {
    schemeBasedOn: 'Individual Product Based',
    schemeName: '',
    schemeCode: '',
    selectOne: 'buy-x-get-y-free',
    buyUnits: 'Pcs',
    buyUnitsValue: '1000',
    getFreeUnits: 'Pcs',
    getFreeUnitsValue: '10',
    maxFreeUnits: '10'
  };

  schemeBasedOptions = [
    'Individual Product Based',
    'Brand Based',
    'Category Based',
    'Individual Product Based',
    'Invoice Based',
    'List Based'
  ];

  unitOptions = ['Pcs', 'Box', 'Kg', 'Ltr'];

  errors: { [key: string]: string } = {};

  onSaveAndNext(): void {
    this.errors = {};
    let hasErrors = false;

    if (!this.formData.schemeName) {
      this.errors['schemeName'] = 'Please enter scheme name';
      hasErrors = true;
    }
    if (!this.formData.schemeCode) {
      this.errors['schemeCode'] = 'Please enter scheme code';
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

  onCancel(): void {
    this.cancel.emit();
  }

  onAddSchemeRule(): void {
    console.log('Add Scheme Rule clicked');
  }

  onRemove(): void {
    console.log('Remove clicked');
  }
}
