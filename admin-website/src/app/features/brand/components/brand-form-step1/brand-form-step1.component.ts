import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface BrandFormData {
  brandName: string;
  brandCode: string;
  availableInAllRegions: boolean;
  limitedLaunch: boolean;
  selectedCountries: string[];
  selectedRegions: string[];
  selectedZones: string[];
  selectedAreas: string[];
  channelVisibility: {
    generalTrade: boolean;
    modernTrade: boolean;
    horecaTrade: boolean;
  };
  brandLogo: File | null;
  brandLogoPreview: string | null;
}

@Component({
  selector: 'app-brand-form-step1',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './brand-form-step1.component.html',
  styleUrl: './brand-form-step1.component.scss'
})
export class BrandFormStep1Component {
  @Output() save = new EventEmitter<BrandFormData>();
  @Output() cancel = new EventEmitter<void>();

  formData: BrandFormData = {
    brandName: '',
    brandCode: '',
    availableInAllRegions: false,
    limitedLaunch: false,
    selectedCountries: [],
    selectedRegions: [],
    selectedZones: [],
    selectedAreas: [],
    channelVisibility: {
      generalTrade: false,
      modernTrade: false,
      horecaTrade: false
    },
    brandLogo: null,
    brandLogoPreview: null
  };

  isDragging = false;

  // Dropdown options
  countryOptions = ['India', 'USA', 'UK', 'Germany', 'Japan', 'China', 'Australia', 'Canada'];
  regionOptions = ['North', 'South', 'East', 'West', 'Central', 'North-East'];
  zoneOptions = ['Zone 1', 'Zone 2', 'Zone 3', 'Zone 4', 'Zone 5'];
  areaOptions = ['Area A', 'Area B', 'Area C', 'Area D', 'Area E'];

  // Auto-generate brand code
  generateBrandCode(): void {
    if (this.formData.brandName) {
      const prefix = this.formData.brandName.substring(0, 4).toUpperCase();
      const randomNum = Math.floor(1000 + Math.random() * 9000);
      this.formData.brandCode = `${prefix}${randomNum}`;
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
      this.formData.brandLogo = file;
      
      const reader = new FileReader();
      reader.onload = (e: ProgressEvent<FileReader>) => {
        this.formData.brandLogoPreview = e.target?.result as string;
      };
      reader.readAsDataURL(file);
    } else {
      alert('Please select an image file (PNG, JPG, JPEG, etc.)');
    }
  }

  removeLogo(): void {
    this.formData.brandLogo = null;
    this.formData.brandLogoPreview = null;
  }

  // Multi-select handlers
  toggleCountry(country: string): void {
    const index = this.formData.selectedCountries.indexOf(country);
    if (index > -1) {
      this.formData.selectedCountries.splice(index, 1);
    } else {
      this.formData.selectedCountries.push(country);
    }
  }

  toggleRegion(region: string): void {
    const index = this.formData.selectedRegions.indexOf(region);
    if (index > -1) {
      this.formData.selectedRegions.splice(index, 1);
    } else {
      this.formData.selectedRegions.push(region);
    }
  }

  toggleZone(zone: string): void {
    const index = this.formData.selectedZones.indexOf(zone);
    if (index > -1) {
      this.formData.selectedZones.splice(index, 1);
    } else {
      this.formData.selectedZones.push(zone);
    }
  }

  toggleArea(area: string): void {
    const index = this.formData.selectedAreas.indexOf(area);
    if (index > -1) {
      this.formData.selectedAreas.splice(index, 1);
    } else {
      this.formData.selectedAreas.push(area);
    }
  }

  isCountrySelected(country: string): boolean {
    return this.formData.selectedCountries.includes(country);
  }

  isRegionSelected(region: string): boolean {
    return this.formData.selectedRegions.includes(region);
  }

  isZoneSelected(zone: string): boolean {
    return this.formData.selectedZones.includes(zone);
  }

  isAreaSelected(area: string): boolean {
    return this.formData.selectedAreas.includes(area);
  }

  getSelectedCountriesText(): string {
    if (this.formData.selectedCountries.length === 0) {
      return 'Select Countries';
    } else if (this.formData.selectedCountries.length === this.countryOptions.length) {
      return 'All Selected';
    } else {
      return `${this.formData.selectedCountries.length} selected`;
    }
  }

  getSelectedRegionsText(): string {
    if (this.formData.selectedRegions.length === 0) {
      return 'Select Regions';
    } else if (this.formData.selectedRegions.length === this.regionOptions.length) {
      return 'All Selected';
    } else {
      return `${this.formData.selectedRegions.length} selected`;
    }
  }

  getSelectedZonesText(): string {
    if (this.formData.selectedZones.length === 0) {
      return 'Select Zones';
    } else if (this.formData.selectedZones.length === this.zoneOptions.length) {
      return 'All Selected';
    } else {
      return `${this.formData.selectedZones.length} selected`;
    }
  }

  getSelectedAreasText(): string {
    if (this.formData.selectedAreas.length === 0) {
      return 'Select Areas';
    } else if (this.formData.selectedAreas.length === this.areaOptions.length) {
      return 'All Selected';
    } else {
      return `${this.formData.selectedAreas.length} selected`;
    }
  }

  errors: { [key: string]: string } = {};

  onSaveAndNext(): void {
    this.errors = {};
    let hasErrors = false;

    // Basic validation
    if (!this.formData.brandName) {
      this.errors['brandName'] = 'Please enter brand name';
      hasErrors = true;
    }
    if (!this.formData.brandCode) {
      this.errors['brandCode'] = 'Please enter brand code';
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

