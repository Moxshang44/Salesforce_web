import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface RetailerFormData {
  storeName: string;
  retailerId: string;
  contactPersonName: string;
  countryCode: string;
  mobileNumber: string;
  email: string;
  licenseNumber: string;
  gstNumber: string;
  panCardNumber: string;
  pinCode: string;
  fullAddress: string;
  mapLink: string;
  uploadedDocuments: File[];
  storeImages: File[];
}

@Component({
  selector: 'app-retailer-form-step1',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './retailer-form-step1.component.html',
  styleUrl: './retailer-form-step1.component.scss'
})
export class RetailerFormStep1Component {
  @Output() save = new EventEmitter<RetailerFormData>();
  @Output() cancel = new EventEmitter<void>();

  formData: RetailerFormData = {
    storeName: '',
    retailerId: '',
    contactPersonName: '',
    countryCode: '+91',
    mobileNumber: '',
    email: '',
    licenseNumber: '',
    gstNumber: '',
    panCardNumber: '',
    pinCode: '',
    fullAddress: '',
    mapLink: '',
    uploadedDocuments: [],
    storeImages: []
  };

  countryCodeOptions = ['+91', '+1', '+44', '+86', '+81', '+61'];
  
  isDraggingDocs = false;
  isDraggingImages = false;
  documentPreviews: Array<{file: File, preview: string}> = [];
  imagePreviews: Array<{file: File, preview: string}> = [];
  
  errors: { [key: string]: string } = {};

  // Auto-generate retailer ID
  generateRetailerId(): void {
    if (this.formData.storeName) {
      const prefix = 'SR-EMP';
      const randomNum = Math.floor(100 + Math.random() * 900);
      this.formData.retailerId = `${prefix}-${randomNum}`;
      this.clearError('storeName');
      this.clearError('retailerId');
    }
  }

  // Document Upload Handlers
  onDocumentFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files) {
      this.handleDocumentFiles(Array.from(input.files));
    }
  }

  onDocumentDragOver(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDraggingDocs = true;
  }

  onDocumentDragLeave(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDraggingDocs = false;
  }

  onDocumentDrop(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDraggingDocs = false;

    if (event.dataTransfer?.files) {
      this.handleDocumentFiles(Array.from(event.dataTransfer.files));
    }
  }

  private handleDocumentFiles(files: File[]): void {
    files.forEach(file => {
      this.formData.uploadedDocuments.push(file);
      
      const reader = new FileReader();
      reader.onload = (e: ProgressEvent<FileReader>) => {
        this.documentPreviews.push({
          file: file,
          preview: e.target?.result as string
        });
      };
      
      if (file.type.startsWith('image/')) {
        reader.readAsDataURL(file);
      } else {
        this.documentPreviews.push({
          file: file,
          preview: 'assets/images/file-icon.png'
        });
      }
    });
  }

  removeDocument(index: number): void {
    this.documentPreviews.splice(index, 1);
    this.formData.uploadedDocuments.splice(index, 1);
  }

  // Store Image Upload Handlers
  onImageFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files) {
      this.handleImageFiles(Array.from(input.files));
    }
  }

  onImageDragOver(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDraggingImages = true;
  }

  onImageDragLeave(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDraggingImages = false;
  }

  onImageDrop(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDraggingImages = false;

    if (event.dataTransfer?.files) {
      this.handleImageFiles(Array.from(event.dataTransfer.files));
    }
  }

  private handleImageFiles(files: File[]): void {
    files.forEach(file => {
      if (file.type.startsWith('image/')) {
        this.formData.storeImages.push(file);
        
        const reader = new FileReader();
        reader.onload = (e: ProgressEvent<FileReader>) => {
          this.imagePreviews.push({
            file: file,
            preview: e.target?.result as string
          });
        };
        reader.readAsDataURL(file);
      } else {
        alert('Please select image files only for Store Image');
      }
    });
  }

  removeImage(index: number): void {
    this.imagePreviews.splice(index, 1);
    this.formData.storeImages.splice(index, 1);
  }

  onSaveAndNext(): void {
    // Clear previous errors
    this.errors = {};
    let hasErrors = false;

    // Basic validation
    if (!this.formData.storeName || this.formData.storeName.trim() === '') {
      this.errors['storeName'] = 'Please enter retailer store name';
      hasErrors = true;
    }
    if (!this.formData.retailerId || this.formData.retailerId.trim() === '') {
      this.errors['retailerId'] = 'Please enter retailer ID';
      hasErrors = true;
    }
    if (!this.formData.contactPersonName || this.formData.contactPersonName.trim() === '') {
      this.errors['contactPersonName'] = 'Please enter contact person name';
      hasErrors = true;
    }
    if (!this.formData.mobileNumber || this.formData.mobileNumber.trim() === '') {
      this.errors['mobileNumber'] = 'Please enter mobile number';
      hasErrors = true;
    }

    if (hasErrors) {
      // Scroll to first error
      const firstErrorField = document.querySelector('.error-message');
      if (firstErrorField) {
        firstErrorField.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      return;
    }

    this.save.emit(this.formData);
  }

  clearError(fieldName: string): void {
    if (this.errors[fieldName]) {
      delete this.errors[fieldName];
    }
  }

  onCancel(): void {
    this.cancel.emit();
  }
}
