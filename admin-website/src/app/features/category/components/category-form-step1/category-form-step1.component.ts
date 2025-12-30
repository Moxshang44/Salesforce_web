import { Component, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ButtonComponent } from '../../../../shared/components/button/button.component';

@Component({
  selector: 'app-category-form-step1',
  standalone: true,
  imports: [CommonModule, FormsModule, ButtonComponent],
  templateUrl: './category-form-step1.component.html',
  styleUrl: './category-form-step1.component.scss'
})
export class CategoryFormStep1Component {
  @Output() save = new EventEmitter<any>();
  @Output() cancel = new EventEmitter<void>();

  categoryData = {
    categoryName: '',
    categoryCode: '',
    subCategoryNames: [] as string[],
    selectedBrand: '',
    selectedCountry: '1 Selected',
    selectedZone: 'All Selected',
    selectedRegions: 'Select Regions',
    selectedAreas: 'All Selected',
    channelVisibility: {
      generalTrade: false,
      modernTrade: false,
      horecaTrade: false
    },
    categoryImage: null as File | null
  };

  newSubCategory = '';
  dragOver = false;

  addSubCategory() {
    if (this.newSubCategory.trim()) {
      this.categoryData.subCategoryNames.push(this.newSubCategory.trim());
      this.newSubCategory = '';
    }
  }

  removeSubCategory(index: number) {
    this.categoryData.subCategoryNames.splice(index, 1);
  }

  onDragOver(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.dragOver = true;
  }

  onDragLeave(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.dragOver = false;
  }

  onDrop(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.dragOver = false;

    const files = event.dataTransfer?.files;
    if (files && files.length > 0) {
      const file = files[0];
      if (file.type.startsWith('image/')) {
        this.categoryData.categoryImage = file;
      }
    }
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      if (file.type.startsWith('image/')) {
        this.categoryData.categoryImage = file;
      }
    }
  }

  onSave() {
    this.save.emit(this.categoryData);
  }

  onCancel() {
    this.cancel.emit();
  }
}
