import { Component, Output, EventEmitter, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ButtonComponent } from '../../../../shared/components/button/button.component';

export interface Margin {
  type: string;
  value: number;
}

export interface Margins {
  super_stockist: Margin;
  distributor: Margin;
  retailer: Margin;
}

export interface MinOrderQuantity {
  super_stockist: number;
  distributor: number;
  retailer: number;
}

export interface ProductPrice {
  area_id: number | null;
  mrp: number;
  margins: Margins | null;
  min_order_quantity: MinOrderQuantity | null;
}

export interface ProductFormStep3Data {
  prices: ProductPrice[];
}

@Component({
  selector: 'app-product-form-step3',
  standalone: true,
  imports: [CommonModule, FormsModule, ButtonComponent],
  templateUrl: './product-form-step3.component.html',
  styleUrl: './product-form-step3.component.scss'
})
export class ProductFormStep3Component {
  @Input() step1Data: any = null;
  @Input() step2Data: any = null;
  @Output() save = new EventEmitter<ProductFormStep3Data>();
  @Output() previous = new EventEmitter<void>();

  formData: ProductFormStep3Data = {
    prices: [
      {
        area_id: null,
        mrp: 0,
        margins: {
          super_stockist: {
            type: 'MARKUP',
            value: 0
          },
          distributor: {
            type: 'MARKUP',
            value: 0
          },
          retailer: {
            type: 'MARKUP',
            value: 0
          }
        },
        min_order_quantity: {
          super_stockist: 0,
          distributor: 0,
          retailer: 0
        }
      }
    ]
  };

  // These should ideally come from API - using placeholder for now
  areas: Array<{id: number, name: string}> = [
    { id: 1, name: 'Area 1' },
    { id: 2, name: 'Area 2' },
    { id: 3, name: 'Area 3' }
  ];

  marginTypes = ['MARKUP', 'MARKDOWN'];
  
  errors: { [key: string]: string } = {};

  addPrice() {
    this.formData.prices.push({
      area_id: null,
      mrp: 0,
      margins: {
        super_stockist: {
          type: 'MARKUP',
          value: 0
        },
        distributor: {
          type: 'MARKUP',
          value: 0
        },
        retailer: {
          type: 'MARKUP',
          value: 0
        }
      },
      min_order_quantity: {
        super_stockist: 0,
        distributor: 0,
        retailer: 0
      }
    });
  }

  removePrice(index: number) {
    this.formData.prices.splice(index, 1);
  }

  onSave() {
    this.errors = {};
    let hasErrors = false;

    // Validate required fields
    if (!this.formData.prices || this.formData.prices.length === 0) {
      this.errors['prices'] = 'At least one price entry is required';
      hasErrors = true;
    } else {
      // Validate each price entry
      this.formData.prices.forEach((price, index) => {
        if (price.mrp === null || price.mrp === undefined || price.mrp <= 0) {
          this.errors[`price_${index}_mrp`] = 'MRP is required and must be greater than 0';
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
