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

  onSave() {
    this.save.emit(this.formData);
  }

  onCancel() {
    this.cancel.emit();
  }
}

