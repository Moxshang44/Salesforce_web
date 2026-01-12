import { Component, Output, EventEmitter, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ButtonComponent } from '../../../../shared/components/button/button.component';

export interface ImageFile {
  id: string;
  name: string;
  mime_type: string;
  extra_info: { [key: string]: any };
}

export interface ImageData {
  files: ImageFile[];
}

export interface ProductVisibility {
  area_id: number | null;
  for_general: boolean;
  for_modern: boolean;
  for_horeca: boolean;
  for_type_a: boolean;
  for_type_b: boolean;
  for_type_c: boolean;
}

export interface ProductFormStep4Data {
  images: ImageData[];
  visibility: ProductVisibility[];
}

@Component({
  selector: 'app-product-form-step4',
  standalone: true,
  imports: [CommonModule, FormsModule, ButtonComponent],
  templateUrl: './product-form-step4.component.html',
  styleUrl: './product-form-step4.component.scss'
})
export class ProductFormStep4Component {
  @Input() step1Data: any = null;
  @Input() step2Data: any = null;
  @Input() step3Data: any = null;
  @Output() save = new EventEmitter<ProductFormStep4Data>();
  @Output() previous = new EventEmitter<void>();

  formData: ProductFormStep4Data = {
    images: [],
    visibility: [
      {
        area_id: null,
        for_general: false,
        for_modern: false,
        for_horeca: false,
        for_type_a: false,
        for_type_b: false,
        for_type_c: false
      }
    ]
  };

  imageFiles: File[] = [];
  imagePreviews: string[] = [];

  // These should ideally come from API - using placeholder for now
  areas: Array<{id: number, name: string}> = [
    { id: 1, name: 'Area 1' },
    { id: 2, name: 'Area 2' },
    { id: 3, name: 'Area 3' }
  ];

  errors: { [key: string]: string } = {};

  onImageSelect(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files) {
      const filesArray = Array.from(input.files);
      this.imageFiles = [...this.imageFiles, ...filesArray];
      
      // Create preview URLs
      filesArray.forEach(file => {
        const reader = new FileReader();
        reader.onload = (e) => {
          this.imagePreviews.push(e.target?.result as string);
          
          // Add to images array
          this.formData.images.push({
            files: [{
              id: '',
              name: file.name,
              mime_type: file.type,
              extra_info: {}
            }]
          });
        };
        reader.readAsDataURL(file);
      });
    }
  }

  removeImage(index: number) {
    this.imageFiles.splice(index, 1);
    this.imagePreviews.splice(index, 1);
    this.formData.images.splice(index, 1);
  }

  addVisibility() {
    this.formData.visibility.push({
      area_id: null,
      for_general: false,
      for_modern: false,
      for_horeca: false,
      for_type_a: false,
      for_type_b: false,
      for_type_c: false
    });
  }

  removeVisibility(index: number) {
    this.formData.visibility.splice(index, 1);
  }

  onSave() {
    this.errors = {};
    let hasErrors = false;

    // Validate required fields
    if (!this.formData.visibility || this.formData.visibility.length === 0) {
      this.errors['visibility'] = 'At least one visibility entry is required';
      hasErrors = true;
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
