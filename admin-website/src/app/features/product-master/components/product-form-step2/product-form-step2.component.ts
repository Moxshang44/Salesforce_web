import { Component, Output, EventEmitter, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ButtonComponent } from '../../../../shared/components/button/button.component';

export interface Dimensions {
  length: number | null;
  width: number | null;
  height: number | null;
  weight: number | null;
  unit: string;
}

export interface MeasurementDetails {
  type: string;
  shelf_life: string | null;
  net: number | null;
  net_unit: string;
  gross: number | null;
  gross_unit: string;
}

export interface PackagingDetail {
  name: string;
  qty: number;
  parent: string | null;
  base_qty: number;
  base_unit: string;
  is_default: boolean;
}

export interface ProductFormStep2Data {
  dimensions: Dimensions;
  measurement_details: MeasurementDetails;
  packaging_type: string | null;
  packaging_details: PackagingDetail[];
  compliance: string | null;
}

@Component({
  selector: 'app-product-form-step2',
  standalone: true,
  imports: [CommonModule, FormsModule, ButtonComponent],
  templateUrl: './product-form-step2.component.html',
  styleUrl: './product-form-step2.component.scss'
})
export class ProductFormStep2Component {
  @Input() step1Data: any = null;
  @Output() save = new EventEmitter<ProductFormStep2Data>();
  @Output() previous = new EventEmitter<void>();

  formData: ProductFormStep2Data = {
    dimensions: {
      length: null,
      width: null,
      height: null,
      weight: null,
      unit: 'cm'
    },
    measurement_details: {
      type: '',
      shelf_life: null,
      net: null,
      net_unit: 'g',
      gross: null,
      gross_unit: 'g'
    },
    packaging_type: null,
    packaging_details: [
      {
        name: '',
        qty: 0,
        parent: null,
        base_qty: 0,
        base_unit: 'g',
        is_default: false
      }
    ],
    compliance: null
  };

  packagingTypes = ['Packet', 'Box', 'Container', 'Bottle', 'Jar', 'Pouch'];
  measureTypes = ['Weight', 'Volume', 'Count'];
  weightUnits = ['g', 'kg', 'mg', 'oz', 'lb'];
  volumeUnits = ['ml', 'l', 'cl'];
  dimensionUnits = ['cm', 'm', 'mm', 'in', 'ft'];
  shelfLifeUnits = ['Days', 'Months', 'Years'];

  errors: { [key: string]: string } = {};

  addPackagingDetail() {
    this.formData.packaging_details.push({
      name: '',
      qty: 0,
      parent: null,
      base_qty: 0,
      base_unit: 'g',
      is_default: false
    });
  }

  removePackagingDetail(index: number) {
    this.formData.packaging_details.splice(index, 1);
  }

  onSaveAndNext() {
    this.errors = {};
    let hasErrors = false;

    // Validate required fields
    if (!this.formData.packaging_type || this.formData.packaging_type.trim() === '') {
      this.errors['packaging_type'] = 'Packaging type is required';
      hasErrors = true;
    }

    if (!this.formData.packaging_details || this.formData.packaging_details.length === 0) {
      this.errors['packaging_details'] = 'At least one packaging detail is required';
      hasErrors = true;
    } else {
      // Validate each packaging detail
      this.formData.packaging_details.forEach((detail, index) => {
        if (!detail.name || detail.name.trim() === '') {
          this.errors[`packaging_detail_${index}_name`] = 'Packaging detail name is required';
          hasErrors = true;
        }
        if (detail.qty === null || detail.qty === undefined || detail.qty < 0) {
          this.errors[`packaging_detail_${index}_qty`] = 'Quantity is required and must be 0 or greater';
          hasErrors = true;
        }
        if (detail.base_qty === null || detail.base_qty === undefined || detail.base_qty < 0) {
          this.errors[`packaging_detail_${index}_base_qty`] = 'Base quantity is required and must be 0 or greater';
          hasErrors = true;
        }
        if (!detail.base_unit || detail.base_unit.trim() === '') {
          this.errors[`packaging_detail_${index}_base_unit`] = 'Base unit is required';
          hasErrors = true;
        }
      });
    }

    if (hasErrors) {
      setTimeout(() => {
        const firstError = document.querySelector('.error-message, .error');
        if (firstError) {
          firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 100);
      return;
    }

    this.save.emit(this.formData);
  }

  clearError(fieldName: string): void {
    if (this.errors[fieldName]) {
      delete this.errors[fieldName];
    }
  }

  onPrevious() {
    this.previous.emit();
  }
}
