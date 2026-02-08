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

    // Required field validations according to API
    if (!this.formData.storeName || this.formData.storeName.trim() === '') {
      this.errors['storeName'] = 'Retailer store name is required';
      hasErrors = true;
    } else if (this.formData.storeName.trim().length < 1 || this.formData.storeName.trim().length > 255) {
      this.errors['storeName'] = 'Retailer store name must be between 1 and 255 characters';
      hasErrors = true;
    }

    if (!this.formData.retailerId || this.formData.retailerId.trim() === '') {
      this.errors['retailerId'] = 'Retailer ID is required';
      hasErrors = true;
    } else if (this.formData.retailerId.trim().length < 1 || this.formData.retailerId.trim().length > 50) {
      this.errors['retailerId'] = 'Retailer ID must be between 1 and 50 characters';
      hasErrors = true;
    }

    if (!this.formData.contactPersonName || this.formData.contactPersonName.trim() === '') {
      this.errors['contactPersonName'] = 'Contact person name is required';
      hasErrors = true;
    } else if (this.formData.contactPersonName.trim().length < 1 || this.formData.contactPersonName.trim().length > 255) {
      this.errors['contactPersonName'] = 'Contact person name must be between 1 and 255 characters';
      hasErrors = true;
    }

    // Mobile number validation - combine country code and mobile number
    const mobileNumber = this.formData.countryCode && this.formData.mobileNumber 
      ? `${this.formData.countryCode.replace('+', '')}${this.formData.mobileNumber}`
      : this.formData.mobileNumber || '';
    
    if (!this.formData.mobileNumber || this.formData.mobileNumber.trim() === '') {
      this.errors['mobileNumber'] = 'Mobile number is required';
      hasErrors = true;
    } else if (mobileNumber.length < 10 || mobileNumber.length > 15) {
      this.errors['mobileNumber'] = 'Mobile number must be between 10 and 15 characters';
      hasErrors = true;
    }

    if (!this.formData.gstNumber || this.formData.gstNumber.trim() === '') {
      this.errors['gstNumber'] = 'GST number is required';
      hasErrors = true;
    } else if (this.formData.gstNumber.trim().length !== 15) {
      this.errors['gstNumber'] = 'GST number must be exactly 15 characters';
      hasErrors = true;
    }

    if (!this.formData.panCardNumber || this.formData.panCardNumber.trim() === '') {
      this.errors['panCardNumber'] = 'PAN number is required';
      hasErrors = true;
    } else if (this.formData.panCardNumber.trim().length !== 10) {
      this.errors['panCardNumber'] = 'PAN number must be exactly 10 characters';
      hasErrors = true;
    }

    if (!this.formData.fullAddress || this.formData.fullAddress.trim() === '') {
      this.errors['fullAddress'] = 'Address is required';
      hasErrors = true;
    } else if (this.formData.fullAddress.trim().length < 1) {
      this.errors['fullAddress'] = 'Address must be at least 1 character';
      hasErrors = true;
    }

    if (!this.formData.pinCode || this.formData.pinCode.trim() === '') {
      this.errors['pinCode'] = 'PIN code is required';
      hasErrors = true;
    } else if (this.formData.pinCode.trim().length !== 6 || !/^\d{6}$/.test(this.formData.pinCode.trim())) {
      this.errors['pinCode'] = 'PIN code must be exactly 6 digits';
      hasErrors = true;
    }

    // Optional field validations
    if (this.formData.licenseNumber && this.formData.licenseNumber.trim().length > 255) {
      this.errors['licenseNumber'] = 'License number must not exceed 255 characters';
      hasErrors = true;
    }

    if (this.formData.email && this.formData.email.trim() !== '' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.formData.email.trim())) {
      this.errors['email'] = 'Please enter a valid email address';
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
