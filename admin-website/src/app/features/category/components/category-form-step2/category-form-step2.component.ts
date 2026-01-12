import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ButtonComponent } from '../../../../shared/components/button/button.component';

export interface CategoryMargin {
  area_id: number | null;
  margins: {
    super_stockist: {
      type: string;
      value: number | null;
    };
    distributor: {
      type: string;
      value: number | null;
    };
    retailer: {
      type: string;
      value: number | null;
    };
  };
}

export interface CategoryFormStep2Data {
  margins: CategoryMargin[];
}

@Component({
  selector: 'app-category-form-step2',
  standalone: true,
  imports: [CommonModule, FormsModule, ButtonComponent],
  templateUrl: './category-form-step2.component.html',
  styleUrl: './category-form-step2.component.scss'
})
export class CategoryFormStep2Component {
  @Output() save = new EventEmitter<CategoryFormStep2Data>();
  @Output() previous = new EventEmitter<void>();

  formData: CategoryFormStep2Data = {
    margins: []
  };

  // These should ideally come from API - using placeholder for now
  areas: Array<{id: number, name: string}> = [
    { id: 1, name: 'Area 1' },
    { id: 2, name: 'Area 2' },
    { id: 3, name: 'Area 3' }
  ];

  marginTypes = ['MARKUP', 'MARKDOWN'];
  
  errors: { [key: string]: string } = {};

  addMargin() {
    this.formData.margins.push({
      area_id: null,
      margins: {
        super_stockist: {
          type: 'MARKUP',
          value: null
        },
        distributor: {
          type: 'MARKUP',
          value: null
        },
        retailer: {
          type: 'MARKUP',
          value: null
        }
      }
    });
  }

  removeMargin(index: number) {
    this.formData.margins.splice(index, 1);
  }

  onSaveAndFinish() {
    this.errors = {};
    let hasErrors = false;

    // Validation can be added here if needed

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

  clearError(fieldName: string): void {
    if (this.errors[fieldName]) {
      delete this.errors[fieldName];
    }
  }

  onPrevious() {
    this.previous.emit();
  }
}

