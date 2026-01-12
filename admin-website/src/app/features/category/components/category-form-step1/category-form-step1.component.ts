import { Component, Output, EventEmitter, Input, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { ButtonComponent } from '../../../../shared/components/button/button.component';
import { ApiService } from '../../../../core/services/api.service';

interface AreaOption {
  id: number;
  name: string;
  type: 'NATION' | 'ZONE' | 'REGION' | 'AREA' | 'DIVISION';
}

interface CategoryFormStep1Data {
  name: string;
  code: string;
  brand_id: number | null;
  parent_category_id: number | null;
  for_general: boolean;
  for_modern: boolean;
  for_horeca: boolean;
  logo: any | null;
  area_id: number[] | null;
  margins: Array<{
    area_id: number | null;
    margins: {
      super_stockist: { type: string; value: number | null };
      distributor: { type: string; value: number | null };
      retailer: { type: string; value: number | null };
    };
  }>;
}

interface Brand {
  id: number;
  name: string;
  code: string;
}

@Component({
  selector: 'app-category-form-step1',
  standalone: true,
  imports: [CommonModule, FormsModule, ButtonComponent],
  templateUrl: './category-form-step1.component.html',
  styleUrl: './category-form-step1.component.scss'
})
export class CategoryFormStep1Component implements OnInit, OnChanges {
  @Input() selectedCompanyId: string = '';
  @Input() categoryData: any = null; // Category data for editing
  @Input() isEditMode: boolean = false; // Flag to indicate edit mode
  @Output() save = new EventEmitter<CategoryFormStep1Data>();
  @Output() cancel = new EventEmitter<void>();

  formData: CategoryFormStep1Data = {
    name: '',
    code: '',
    brand_id: null,
    parent_category_id: null,
    for_general: false,
    for_modern: false,
    for_horeca: false,
    logo: null,
    area_id: null,
    margins: []
  };

  // Brand selection
  brands: Brand[] = [];
  isLoadingBrands = false;
  brandsError = '';

  // Area hierarchy loading
  isLoadingAllAreas = false;
  isLoadingZones = false;
  isLoadingRegions = false;
  isLoadingAreas = false;

  // Store all areas fetched from the single API
  allAreas: any[] = [];

  // Dropdown options - filtered from allAreas
  countryOptions: AreaOption[] = [];
  zoneOptions: AreaOption[] = [];
  regionOptions: AreaOption[] = [];
  areaOptions: AreaOption[] = [];

  // Selected IDs for hierarchy
  selectedCountryId: number | null = null;
  selectedZoneId: number | null = null;
  selectedRegionId: number | null = null;
  selectedAreaIds: number[] = [];

  // Logo file handling
  logoFile: File | null = null;
  logoPreview: string | null = null;
  isDragging = false;

  errors: { [key: string]: string } = {};

  // Margin management
  marginTypes = ['MARKUP', 'MARKDOWN'];

  constructor(
    private http: HttpClient,
    private apiService: ApiService
  ) {}

  ngOnInit(): void {
    // Fetch brands when component initializes if company is already selected
    if (this.selectedCompanyId) {
      this.loadBrands();
      this.loadAllAreas();
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    // Watch for changes to selectedCompanyId
    if (changes['selectedCompanyId']) {
      const newCompanyId = changes['selectedCompanyId'].currentValue;
      if (newCompanyId && newCompanyId !== changes['selectedCompanyId'].previousValue) {
        this.loadBrands();
        this.loadAllAreas();
      } else if (!newCompanyId) {
        // Reset all dropdowns if company is cleared
        this.brands = [];
        this.formData.brand_id = null;
        this.allAreas = [];
        this.countryOptions = [];
        this.zoneOptions = [];
        this.regionOptions = [];
        this.areaOptions = [];
        this.selectedCountryId = null;
        this.selectedZoneId = null;
        this.selectedRegionId = null;
        this.selectedAreaIds = [];
        this.formData.area_id = null;
      }
    }
    // Watch for changes to categoryData in edit mode
    if (changes['categoryData'] && this.isEditMode && this.categoryData) {
      // Wait for brands and areas to load before populating
      setTimeout(() => {
        this.populateFormForEdit();
      }, 500);
    }
  }

  loadBrands(): void {
    if (!this.selectedCompanyId) {
      return;
    }

    this.isLoadingBrands = true;
    this.brandsError = '';
    const url = this.apiService.getApiUrl(`companies/${this.selectedCompanyId}/brands`);
    const headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });

    this.http.get<any>(url, { headers }).subscribe({
      next: (response) => {
        this.isLoadingBrands = false;
        console.log('Brands API response:', response);
        
        // Handle response format
        let brandsData: any[] = [];
        if (response.data && Array.isArray(response.data)) {
          brandsData = response.data;
        } else if (Array.isArray(response)) {
          brandsData = response;
        }

        // Map to Brand interface
        this.brands = brandsData.map((brand: any) => ({
          id: brand.id,
          name: brand.name || 'N/A',
          code: brand.code || 'N/A'
        }));
      },
      error: (error) => {
        this.isLoadingBrands = false;
        console.error('Error loading brands:', error);
        
        if (error.error) {
          if (error.error.message) {
            this.brandsError = error.error.message;
          } else if (error.error.detail) {
            this.brandsError = error.error.detail;
          } else if (typeof error.error === 'string') {
            this.brandsError = error.error;
          } else {
            this.brandsError = 'Failed to load brands. Please try again.';
          }
        } else {
          this.brandsError = `Failed to load brands. Status: ${error.status || 'Unknown'}.`;
        }
        
        this.brands = [];
      }
    });
  }

  // Fetch all areas for the selected company using single API
  loadAllAreas(): void {
    if (!this.selectedCompanyId) {
      return;
    }

    this.isLoadingAllAreas = true;
    const url = this.apiService.getApiUrl(`companies/${this.selectedCompanyId}/areas`);
    const headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });

    this.http.get<any>(url, { headers }).subscribe({
      next: (response) => {
        this.isLoadingAllAreas = false;
        
        // Handle different response formats
        if (Array.isArray(response)) {
          this.allAreas = response;
        } else if (response.data && Array.isArray(response.data)) {
          this.allAreas = response.data;
        } else if (response.areas && Array.isArray(response.areas)) {
          this.allAreas = response.areas;
        } else {
          this.allAreas = [];
        }

        // Filter and populate nations (countries)
        this.updateCountryOptions();
      },
      error: (error) => {
        this.isLoadingAllAreas = false;
        console.error('Error loading areas:', error);
        this.allAreas = [];
        this.countryOptions = [];
      }
    });
  }

  // Filter nations (type: NATION) from all areas
  updateCountryOptions(): void {
    this.countryOptions = this.allAreas
      .filter((area: any) => area.type === 'NATION')
      .map((area: any) => ({
        id: area.id,
        name: area.name,
        type: 'NATION' as const
      }));
  }

  // Handle country selection change
  onCountryChange(value: any): void {
    const countryId = this.toNumber(value);
    this.selectedCountryId = countryId;
    
    // Reset child selections and options
    this.selectedZoneId = null;
    this.selectedRegionId = null;
    this.selectedAreaIds = [];
    this.zoneOptions = [];
    this.regionOptions = [];
    this.areaOptions = [];
    this.formData.area_id = null;
    
    this.clearError('selectedCountryId');
    
    // Update zones
    this.updateZoneOptions();
  }

  // Fetch zones (type: ZONE) for selected nation using query parameters
  updateZoneOptions(): void {
    if (!this.selectedCountryId || !this.selectedCompanyId) {
      this.zoneOptions = [];
      return;
    }

    this.isLoadingZones = true;
    const url = this.apiService.getApiUrl(`companies/${this.selectedCompanyId}/areas`);
    const headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });
    const params = new HttpParams()
      .set('area_type', 'ZONE')
      .set('parent_id', this.selectedCountryId.toString())
      .set('parent_type', 'NATION');

    this.http.get<any>(url, { headers, params }).subscribe({
      next: (response) => {
        this.isLoadingZones = false;
        let zones: any[] = [];
        if (Array.isArray(response)) {
          zones = response;
        } else if (response.data && Array.isArray(response.data)) {
          zones = response.data;
        }

        this.zoneOptions = zones.map((zone: any) => ({
          id: zone.id,
          name: zone.name,
          type: 'ZONE' as const
        }));
      },
      error: (error) => {
        this.isLoadingZones = false;
        console.error('Error loading zones:', error);
        this.zoneOptions = [];
      }
    });
  }

  // Handle zone selection change
  onZoneChange(value: any): void {
    const zoneId = this.toNumber(value);
    this.selectedZoneId = zoneId;
    
    // Reset child selections and options
    this.selectedRegionId = null;
    this.selectedAreaIds = [];
    this.regionOptions = [];
    this.areaOptions = [];
    this.formData.area_id = null;
    
    this.clearError('selectedZoneId');
    
    // Update regions
    this.updateRegionOptions();
  }

  // Fetch regions (type: REGION) for selected zone using query parameters
  updateRegionOptions(): void {
    if (!this.selectedZoneId || !this.selectedCompanyId) {
      this.regionOptions = [];
      return;
    }

    this.isLoadingRegions = true;
    const url = this.apiService.getApiUrl(`companies/${this.selectedCompanyId}/areas`);
    const headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });
    const params = new HttpParams()
      .set('area_type', 'REGION')
      .set('parent_id', this.selectedZoneId.toString())
      .set('parent_type', 'ZONE');

    this.http.get<any>(url, { headers, params }).subscribe({
      next: (response) => {
        this.isLoadingRegions = false;
        let regions: any[] = [];
        if (Array.isArray(response)) {
          regions = response;
        } else if (response.data && Array.isArray(response.data)) {
          regions = response.data;
        }

        this.regionOptions = regions.map((region: any) => ({
          id: region.id,
          name: region.name,
          type: 'REGION' as const
        }));
      },
      error: (error) => {
        this.isLoadingRegions = false;
        console.error('Error loading regions:', error);
        this.regionOptions = [];
      }
    });
  }

  // Handle region selection change
  onRegionChange(value: any): void {
    const regionId = this.toNumber(value);
    this.selectedRegionId = regionId;
    
    // Reset area selections
    this.selectedAreaIds = [];
    this.areaOptions = [];
    this.formData.area_id = null;
    
    this.clearError('selectedRegionId');
    
    // Update areas
    this.updateAreaOptions();
  }

  // Fetch areas (type: AREA) for selected region using query parameters
  updateAreaOptions(): void {
    if (!this.selectedRegionId || !this.selectedCompanyId) {
      this.areaOptions = [];
      return;
    }

    this.isLoadingAreas = true;
    const url = this.apiService.getApiUrl(`companies/${this.selectedCompanyId}/areas`);
    const headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });
    const params = new HttpParams()
      .set('area_type', 'AREA')
      .set('parent_id', this.selectedRegionId.toString())
      .set('parent_type', 'REGION');

    this.http.get<any>(url, { headers, params }).subscribe({
      next: (response) => {
        this.isLoadingAreas = false;
        let areas: any[] = [];
        if (Array.isArray(response)) {
          areas = response;
        } else if (response.data && Array.isArray(response.data)) {
          areas = response.data;
        }

        this.areaOptions = areas.map((area: any) => ({
          id: area.id,
          name: area.name,
          type: 'AREA' as const
        }));
      },
      error: (error) => {
        this.isLoadingAreas = false;
        console.error('Error loading areas:', error);
        this.areaOptions = [];
      }
    });
  }

  // Toggle area selection
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

  // Auto-generate category code
  generateCategoryCode(): void {
    if (this.formData.name) {
      const prefix = this.formData.name.substring(0, 3).toUpperCase().replace(/\s/g, '');
      const randomNum = Math.floor(1000 + Math.random() * 9000);
      this.formData.code = `CAT-${prefix}-${randomNum}`;
    }
  }

  // Logo file handling
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

    const files = event.dataTransfer?.files;
    if (files && files.length > 0) {
      this.handleFile(files[0]);
    }
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.handleFile(input.files[0]);
    }
  }

  handleFile(file: File): void {
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

  // Margin management
  addMargin(): void {
    this.formData.margins.push({
      area_id: null,
      margins: {
        super_stockist: { type: 'MARKUP', value: null },
        distributor: { type: 'MARKUP', value: null },
        retailer: { type: 'MARKUP', value: null }
      }
    });
  }

  removeMargin(index: number): void {
    this.formData.margins.splice(index, 1);
  }

  // Validation and save
  onSave(): void {
    this.errors = {};
    let hasErrors = false;

    if (!this.formData.name || this.formData.name.trim() === '') {
      this.errors['name'] = 'Category name is required';
      hasErrors = true;
    }

    if (!this.formData.code || this.formData.code.trim() === '') {
      this.errors['code'] = 'Category code is required';
      hasErrors = true;
    }

    if (!this.formData.brand_id) {
      this.errors['brand_id'] = 'Brand is required';
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

  onCancel(): void {
    this.cancel.emit();
  }

  // Helper to convert value to number
  private toNumber(value: any): number | null {
    if (value === null || value === undefined || value === '') {
      return null;
    }
    const num = Number(value);
    return isNaN(num) ? null : num;
  }

  populateFormForEdit(): void {
    if (!this.categoryData) {
      return;
    }

    // Populate basic fields
    this.formData.name = this.categoryData.name || '';
    this.formData.code = this.categoryData.code || '';
    this.formData.brand_id = this.categoryData.brand_id || null;
    this.formData.parent_category_id = this.categoryData.parent_category_id || null;
    this.formData.for_general = this.categoryData.for_general || false;
    this.formData.for_modern = this.categoryData.for_modern || false;
    this.formData.for_horeca = this.categoryData.for_horeca || false;
    this.formData.logo = this.categoryData.logo || null;

    // Populate area IDs
    if (this.categoryData.area && this.categoryData.area.length > 0) {
      this.formData.area_id = this.categoryData.area.map((a: any) => a.id);
      this.selectedAreaIds = this.formData.area_id ? [...this.formData.area_id] : [];
    }

    // Populate margins
    if (this.categoryData.margins && this.categoryData.margins.length > 0) {
      this.formData.margins = this.categoryData.margins.map((margin: any) => ({
        area_id: margin.area_id || null,
        margins: {
          super_stockist: {
            type: margin.margins?.super_stockist?.type || 'MARKUP',
            value: margin.margins?.super_stockist?.value || 0
          },
          distributor: {
            type: margin.margins?.distributor?.type || 'MARKUP',
            value: margin.margins?.distributor?.value || 0
          },
          retailer: {
            type: margin.margins?.retailer?.type || 'MARKUP',
            value: margin.margins?.retailer?.value || 0
          }
        }
      }));
    }

    // Set logo preview if logo exists
    if (this.categoryData.logo && this.categoryData.logo.files && this.categoryData.logo.files.length > 0) {
      const logoFile = this.categoryData.logo.files[0];
      // If there's a URL or base64 data, set preview
      if (logoFile.extra_info && logoFile.extra_info.url) {
        this.logoPreview = logoFile.extra_info.url;
      }
    }
  }
}
