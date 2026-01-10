import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface FileData {
  id?: string;
  name: string;
  mime_type: string;
  extra_info: { [key: string]: any };
}

interface DistributorFormData {
  name: string;
  contact_person_name: string;
  mobile_number: string;
  email: string; // Will be converted to null if empty
  gst_no: string;
  pan_no: string;
  license_no: string; // Will be converted to null if empty
  address: string;
  pin_code: string;
  map_link: string; // Will be converted to null if empty
  documents: {
    files: FileData[];
  } | null;
  store_images: {
    files: FileData[];
  } | null;
}

@Component({
  selector: 'app-distributor-form-step1',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './distributor-form-step1.component.html',
  styleUrl: './distributor-form-step1.component.scss'
})
export class DistributorFormStep1Component {
  @Input() selectedCompanyId: string = '';
  @Output() save = new EventEmitter<DistributorFormData>();
  @Output() cancel = new EventEmitter<void>();

  formData: DistributorFormData = {
    name: '',
    contact_person_name: '',
    mobile_number: '',
    email: '',
    gst_no: '',
    pan_no: '',
    license_no: '',
    address: '',
    pin_code: '',
    map_link: '',
    documents: null,
    store_images: null
  };
  
  isDraggingDocs = false;
  isDraggingImages = false;
  documentFiles: File[] = [];
  storeImageFiles: File[] = [];
  documentPreviews: Array<{file: File, preview: string}> = [];
  imagePreviews: Array<{file: File, preview: string}> = [];
  
  errors: { [key: string]: string } = {};

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
      this.documentFiles.push(file);
      
      // Initialize documents if null
      if (!this.formData.documents) {
        this.formData.documents = { files: [] };
      }
      
      const fileData: FileData = {
        id: '',
        name: file.name,
        mime_type: file.type || 'application/octet-stream',
        extra_info: {}
      };
      this.formData.documents.files.push(fileData);
      
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
    this.documentFiles.splice(index, 1);
    if (this.formData.documents) {
      this.formData.documents.files.splice(index, 1);
      // Set to null if no files remaining
      if (this.formData.documents.files.length === 0) {
        this.formData.documents = null;
      }
    }
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
        this.storeImageFiles.push(file);
        
        // Initialize store_images if null
        if (!this.formData.store_images) {
          this.formData.store_images = { files: [] };
        }
        
        const fileData: FileData = {
          id: '',
          name: file.name,
          mime_type: file.type || 'image/jpeg',
          extra_info: {}
        };
        this.formData.store_images.files.push(fileData);
        
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
    this.storeImageFiles.splice(index, 1);
    if (this.formData.store_images) {
      this.formData.store_images.files.splice(index, 1);
      // Set to null if no files remaining
      if (this.formData.store_images.files.length === 0) {
        this.formData.store_images = null;
      }
    }
  }

  onSaveAndNext(): void {
    // Clear previous errors
    this.errors = {};
    let hasErrors = false;

    // Required field validations according to API
    if (!this.formData.name || this.formData.name.trim() === '') {
      this.errors['name'] = 'Distributor name is required';
      hasErrors = true;
    } else if (this.formData.name.trim().length < 1 || this.formData.name.trim().length > 255) {
      this.errors['name'] = 'Distributor name must be between 1 and 255 characters';
      hasErrors = true;
    }

    if (!this.formData.contact_person_name || this.formData.contact_person_name.trim() === '') {
      this.errors['contact_person_name'] = 'Contact person name is required';
      hasErrors = true;
    } else if (this.formData.contact_person_name.trim().length < 1 || this.formData.contact_person_name.trim().length > 255) {
      this.errors['contact_person_name'] = 'Contact person name must be between 1 and 255 characters';
      hasErrors = true;
    }

    if (!this.formData.mobile_number || this.formData.mobile_number.trim() === '') {
      this.errors['mobile_number'] = 'Mobile number is required';
      hasErrors = true;
    } else if (this.formData.mobile_number.trim().length < 10 || this.formData.mobile_number.trim().length > 15) {
      this.errors['mobile_number'] = 'Mobile number must be between 10 and 15 characters';
      hasErrors = true;
    }

    if (!this.formData.gst_no || this.formData.gst_no.trim() === '') {
      this.errors['gst_no'] = 'GST number is required';
      hasErrors = true;
    } else if (this.formData.gst_no.trim().length !== 15) {
      this.errors['gst_no'] = 'GST number must be exactly 15 characters';
      hasErrors = true;
    }

    if (!this.formData.pan_no || this.formData.pan_no.trim() === '') {
      this.errors['pan_no'] = 'PAN number is required';
      hasErrors = true;
    } else if (this.formData.pan_no.trim().length !== 10) {
      this.errors['pan_no'] = 'PAN number must be exactly 10 characters';
      hasErrors = true;
    }

    if (!this.formData.address || this.formData.address.trim() === '') {
      this.errors['address'] = 'Address is required';
      hasErrors = true;
    } else if (this.formData.address.trim().length < 1) {
      this.errors['address'] = 'Address must be at least 1 character';
      hasErrors = true;
    }

    if (!this.formData.pin_code || this.formData.pin_code.trim() === '') {
      this.errors['pin_code'] = 'PIN code is required';
      hasErrors = true;
    } else if (this.formData.pin_code.trim().length !== 6) {
      this.errors['pin_code'] = 'PIN code must be exactly 6 characters';
      hasErrors = true;
    }

    // Optional field validations
    if (this.formData.license_no && this.formData.license_no.trim().length > 255) {
      this.errors['license_no'] = 'License number must not exceed 255 characters';
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

    // Clean up optional fields - trim whitespace (conversion to null will happen in parent component)
    if (this.formData.email) {
      this.formData.email = this.formData.email.trim();
    }
    if (this.formData.license_no) {
      this.formData.license_no = this.formData.license_no.trim();
    }
    if (this.formData.map_link) {
      this.formData.map_link = this.formData.map_link.trim();
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
