import { Component, EventEmitter, Input, Output, OnChanges, SimpleChanges, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ButtonComponent } from '../../../../shared/components/button/button.component';

export interface LogoFile {
  id: string;
  name: string;
  mime_type: string;
  extra_info: { [key: string]: any };
}

export interface LogoData {
  files: LogoFile[];
}

export interface BrandFormStep1Data {
  name: string;
  code: string;
  for_general: boolean;
  for_modern: boolean;
  for_horeca: boolean;
  logo: LogoData | null;
  area_id: number[] | null;
  is_active?: boolean; // Optional, only used in edit mode
}

@Component({
  selector: 'app-brand-form-step1',
  standalone: true,
  imports: [CommonModule, FormsModule, ButtonComponent],
  templateUrl: './brand-form-step1.component.html',
  styleUrl: './brand-form-step1.component.scss'
})
export class BrandFormStep1Component implements OnInit, OnChanges {
  @Input() selectedCompanyId: string = '';
  @Input() brandData: any = null; // Brand data for editing
  @Input() brandId: number | null = null; // Brand ID for editing
  @Input() isEditMode: boolean = false; // Flag to indicate edit mode
  @Output() save = new EventEmitter<BrandFormStep1Data>();
  @Output() cancel = new EventEmitter<void>();

  formData: BrandFormStep1Data = {
    name: '',
    code: '',
    for_general: false,
    for_modern: false,
    for_horeca: false,
    logo: null,
    area_id: null,
    is_active: true
  };

  logoFile: File | null = null;
  logoPreview: string | null = null;
  isDragging = false;

  // These should ideally come from API - using placeholder for now
  areas: Array<{id: number, name: string}> = [
    { id: 1, name: 'Area 1' },
    { id: 2, name: 'Area 2' },
    { id: 3, name: 'Area 3' }
  ];

  selectedAreaIds: number[] = [];

  errors: { [key: string]: string } = {};

  ngOnInit(): void {
    // If in edit mode and brand data is provided, populate the form
    if (this.isEditMode && this.brandData) {
      this.populateFormForEdit();
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    // Watch for brand data changes (when editing)
    if (changes['brandData'] && this.isEditMode && this.brandData) {
      this.populateFormForEdit();
    }
  }

  // Populate form with brand data for editing
  populateFormForEdit(): void {
    if (!this.brandData) return;
    
    this.formData.name = this.brandData.name || '';
    this.formData.code = this.brandData.code || '';
    this.formData.for_general = this.brandData.for_general || false;
    this.formData.for_modern = this.brandData.for_modern || false;
    this.formData.for_horeca = this.brandData.for_horeca || false;
    this.formData.is_active = this.brandData.is_active !== undefined ? this.brandData.is_active : true;
    
    // Handle logo
    if (this.brandData.logo && this.brandData.logo.files && this.brandData.logo.files.length > 0) {
      this.formData.logo = this.brandData.logo;
      // If logo has an id, it's an existing logo (not a file upload)
      // For existing logos, we might want to show a preview URL if available
      // For now, we'll just keep the logo data structure
    }
    
    // Handle area_id - convert area array to area_id array
    if (this.brandData.area && Array.isArray(this.brandData.area)) {
      this.selectedAreaIds = this.brandData.area.map((area: any) => area.id).filter((id: any) => id !== undefined);
      this.formData.area_id = this.selectedAreaIds.length > 0 ? [...this.selectedAreaIds] : null;
    }
  }

  // Auto-generate brand code (only in add mode)
  generateBrandCode(): void {
    if (this.isEditMode) return; // Don't auto-generate in edit mode
    if (this.formData.name) {
      const prefix = this.formData.name.substring(0, 4).toUpperCase().replace(/\s/g, '');
      const randomNum = Math.floor(1000 + Math.random() * 9000);
      this.formData.code = `${prefix}${randomNum}`;
    }
  }

  // File upload handlers
  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      this.handleFile(input.files[0]);
    }
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging = true;
  }

  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging = false;
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging = false;

    if (event.dataTransfer?.files && event.dataTransfer.files[0]) {
      this.handleFile(event.dataTransfer.files[0]);
    }
  }

  private handleFile(file: File): void {
    if (file.type.startsWith('image/')) {
      this.logoFile = file;
      
      const reader = new FileReader();
      reader.onload = (e: ProgressEvent<FileReader>) => {
        this.logoPreview = e.target?.result as string;
        
        // Create logo data structure for API
        this.formData.logo = {
          files: [{
            id: '',
            name: file.name,
            mime_type: file.type,
            extra_info: {}
          }]
        };
      };
      reader.readAsDataURL(file);
    } else {
      alert('Please select an image file (PNG, JPG, JPEG, etc.)');
    }
  }

  removeLogo(): void {
    this.logoFile = null;
    this.logoPreview = null;
    this.formData.logo = null;
  }

  toggleArea(areaId: number): void {
    const index = this.selectedAreaIds.indexOf(areaId);
    if (index > -1) {
      this.selectedAreaIds.splice(index, 1);
    } else {
      this.selectedAreaIds.push(areaId);
    }
    this.formData.area_id = this.selectedAreaIds.length > 0 ? [...this.selectedAreaIds] : null;
  }

  isAreaSelected(areaId: number): boolean {
    return this.selectedAreaIds.includes(areaId);
  }

  onSaveAndNext(): void {
    this.errors = {};
    let hasErrors = false;

    // Basic validation
    if (!this.formData.name || this.formData.name.trim() === '') {
      this.errors['name'] = 'Brand name is required';
      hasErrors = true;
    }
    if (!this.formData.code || this.formData.code.trim() === '') {
      this.errors['code'] = 'Brand code is required';
      hasErrors = true;
    }

    if (hasErrors) {
      // Scroll to first error
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
}
