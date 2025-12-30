import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface DistributorFormData {
  companyName: string;
  distributorId: string;
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
  selector: 'app-distributor-form-step1',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './distributor-form-step1.component.html',
  styleUrl: './distributor-form-step1.component.scss'
})
export class DistributorFormStep1Component {
  @Output() save = new EventEmitter<DistributorFormData>();
  @Output() cancel = new EventEmitter<void>();

  formData: DistributorFormData = {
    companyName: '',
    distributorId: '',
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

  // Auto-generate distributor ID
  generateDistributorId(): void {
    if (this.formData.companyName) {
      const prefix = this.formData.companyName.substring(0, 3).toUpperCase();
      const randomNum = Math.floor(100 + Math.random() * 900);
      this.formData.distributorId = `SR-EMP-${randomNum}`;
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
        // For non-image files, use a placeholder
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
    // Basic validation
    if (!this.formData.companyName) {
      alert('Please enter distributor company name');
      return;
    }
    if (!this.formData.distributorId) {
      alert('Please enter distributor ID');
      return;
    }
    if (!this.formData.contactPersonName) {
      alert('Please enter contact person name');
      return;
    }
    if (!this.formData.mobileNumber) {
      alert('Please enter mobile number');
      return;
    }
    this.save.emit(this.formData);
  }

  onCancel(): void {
    this.cancel.emit();
  }
}
