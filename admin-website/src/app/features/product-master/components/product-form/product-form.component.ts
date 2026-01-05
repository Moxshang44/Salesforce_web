import { Component, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ButtonComponent } from '../../../../shared/components/button/button.component';

interface ProductFormData {
  brand: string;
  category: string;
  subcategory: string;
  skuCode: string;
  productName: string;
  shortDescription: string;
  images: File[];
  ingredientsCompliance: string;
  height: string;
  width: string;
  hsnCode: string;
}

@Component({
  selector: 'app-product-form',
  standalone: true,
  imports: [CommonModule, FormsModule, ButtonComponent],
  templateUrl: './product-form.component.html',
  styleUrl: './product-form.component.scss'
})
export class ProductFormComponent {
  @Output() save = new EventEmitter<ProductFormData>();
  @Output() cancel = new EventEmitter<void>();

  formData: ProductFormData = {
    brand: '',
    category: '',
    subcategory: '',
    skuCode: '',
    productName: '',
    shortDescription: '',
    images: [],
    ingredientsCompliance: '',
    height: '',
    width: '',
    hsnCode: ''
  };

  imagePreviews: string[] = [];

  brands = ['Nutribion', 'Alembic', 'Zydus Healthcare', 'Cipla', 'Sun Pharma', 'Mankind', 'Dr. Reddy\'s', 'Abbott'];
  categories = ['Sherbha', 'Food', 'Protein', 'Supplements', 'Wellness', 'Healthcare'];
  subcategories = ['Baked Sub category', 'Supplements', 'Nutrition Drinks'];

  onImageSelect(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files) {
      const filesArray = Array.from(input.files);
      this.formData.images = [...this.formData.images, ...filesArray];
      
      // Create preview URLs
      filesArray.forEach(file => {
        const reader = new FileReader();
        reader.onload = (e) => {
          this.imagePreviews.push(e.target?.result as string);
        };
        reader.readAsDataURL(file);
      });
    }
  }

  removeImage(index: number) {
    this.formData.images.splice(index, 1);
    this.imagePreviews.splice(index, 1);
  }

  errors: { [key: string]: string } = {};

  onSave() {
    this.errors = {};
    let hasErrors = false;

    if (!this.formData.brand) {
      this.errors['brand'] = 'Please select brand';
      hasErrors = true;
    }
    if (!this.formData.category) {
      this.errors['category'] = 'Please select category';
      hasErrors = true;
    }
    if (!this.formData.skuCode) {
      this.errors['skuCode'] = 'Please enter SKU code';
      hasErrors = true;
    }
    if (!this.formData.productName) {
      this.errors['productName'] = 'Please enter product name';
      hasErrors = true;
    }
    if (!this.formData.shortDescription) {
      this.errors['shortDescription'] = 'Please enter short description';
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

  onCancel() {
    this.cancel.emit();
  }
}

