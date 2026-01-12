import { Component, EventEmitter, Output, Input, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { ApiService } from '../../../../core/services/api.service';

interface AreaOption {
  id: number;
  name: string;
  type: 'NATION' | 'ZONE' | 'REGION' | 'AREA' | 'DIVISION';
}

interface Role {
  name: string;
  description: string;
  is_active: boolean;
}

interface Route {
  id: number;
  name: string;
  code: string;
}

interface DayRoute {
  day: string;
  route_id: number | null;
}

interface BankDetails {
  account_number: string;
  account_name: string;
  bank_name: string;
  bank_branch: string;
  account_type: 'SAVINGS' | 'CURRENT';
  ifsc_code: string;
}

export interface EmployeeFormData {
  username: string;
  name: string;
  contact_no: string;
  role: string;
  area_id: number | null;
  bank_details: BankDetails | null;
  company_id: string;
}

@Component({
  selector: 'app-employee-form-step1',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './employee-form-step1.component.html',
  styleUrl: './employee-form-step1.component.scss'
})
export class EmployeeFormStep1Component implements OnInit, OnChanges {
  @Input() selectedCompanyId: string = '';
  @Input() employeeData: any = null; // Employee data for editing
  @Input() isEditMode: boolean = false; // Flag to indicate edit mode
  @Output() save = new EventEmitter<EmployeeFormData>();
  @Output() cancel = new EventEmitter<void>();

  formData: EmployeeFormData = {
    username: '',
    name: '',
    contact_no: '',
    role: '',
    area_id: null,
    bank_details: null,
    company_id: ''
  };

  // Bank details
  bankDetails: BankDetails = {
    account_number: '',
    account_name: '',
    bank_name: '',
    bank_branch: '',
    account_type: 'SAVINGS',
    ifsc_code: ''
  };

  // Week schedule (for display only, not part of API)
  weekSchedule: DayRoute[] = [
    { day: 'Monday', route_id: null },
    { day: 'Tuesday', route_id: null },
    { day: 'Wednesday', route_id: null },
    { day: 'Thursday', route_id: null },
    { day: 'Friday', route_id: null },
    { day: 'Saturday', route_id: null }
  ];

  // Area hierarchy
  allAreas: any[] = [];
  countryOptions: AreaOption[] = [];
  zoneOptions: AreaOption[] = [];
  regionOptions: AreaOption[] = [];
  areaOptions: AreaOption[] = [];

  selectedCountryId: number | null = null;
  selectedZoneId: number | null = null;
  selectedRegionId: number | null = null;
  selectedAreaId: number | null = null;

  isLoadingAllAreas = false;
  isLoadingZones = false;
  isLoadingRegions = false;
  isLoadingAreas = false;

  // Roles
  roles: Role[] = [];
  isLoadingRoles = false;
  rolesError = '';

  // Routes
  routes: Route[] = [];
  isLoadingRoutes = false;
  routesError = '';

  // Account types
  accountTypes: ('SAVINGS' | 'CURRENT')[] = ['SAVINGS', 'CURRENT'];

  errors: { [key: string]: string } = {};

  constructor(
    private http: HttpClient,
    private apiService: ApiService
  ) {}

  ngOnInit(): void {
    if (this.selectedCompanyId) {
      this.loadAllAreas();
      this.loadRoles();
      this.loadRoutes();
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['selectedCompanyId']) {
      const newCompanyId = changes['selectedCompanyId'].currentValue;
      if (newCompanyId && newCompanyId !== changes['selectedCompanyId'].previousValue) {
        this.formData.company_id = newCompanyId;
        this.loadAllAreas();
        this.loadRoles();
        this.loadRoutes();
      } else if (!newCompanyId) {
        this.resetAllDropdowns();
      }
    }
    // Watch for changes to employeeData in edit mode
    if (changes['employeeData'] && this.isEditMode && this.employeeData) {
      // Wait for areas and roles to load before populating
      setTimeout(() => {
        this.populateFormForEdit();
      }, 500);
    }
  }

  resetAllDropdowns(): void {
    this.allAreas = [];
    this.countryOptions = [];
    this.zoneOptions = [];
    this.regionOptions = [];
    this.areaOptions = [];
    this.selectedCountryId = null;
    this.selectedZoneId = null;
    this.selectedRegionId = null;
    this.selectedAreaId = null;
    this.formData.area_id = null;
    this.roles = [];
    this.routes = [];
  }

  // Load all areas
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
        
        if (Array.isArray(response)) {
          this.allAreas = response;
        } else if (response.data && Array.isArray(response.data)) {
          this.allAreas = response.data;
        } else if (response.areas && Array.isArray(response.areas)) {
          this.allAreas = response.areas;
        } else {
          this.allAreas = [];
        }

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

  updateCountryOptions(): void {
    this.countryOptions = this.allAreas
      .filter((area: any) => area.type === 'NATION')
      .map((area: any) => ({
        id: area.id,
        name: area.name,
        type: 'NATION' as const
      }));
  }

  onCountryChange(value: any): void {
    const countryId = this.toNumber(value);
    this.selectedCountryId = countryId;
    
    this.selectedZoneId = null;
    this.selectedRegionId = null;
    this.selectedAreaId = null;
    this.formData.area_id = null;
    this.zoneOptions = [];
    this.regionOptions = [];
    this.areaOptions = [];
    
    this.clearError('selectedCountryId');
    this.updateZoneOptions();
  }

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

  onZoneChange(value: any): void {
    const zoneId = this.toNumber(value);
    this.selectedZoneId = zoneId;
    
    this.selectedRegionId = null;
    this.selectedAreaId = null;
    this.formData.area_id = null;
    this.regionOptions = [];
    this.areaOptions = [];
    
    this.clearError('selectedZoneId');
    this.updateRegionOptions();
  }

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

  onRegionChange(value: any): void {
    const regionId = this.toNumber(value);
    this.selectedRegionId = regionId;
    
    this.selectedAreaId = null;
    this.formData.area_id = null;
    this.areaOptions = [];
    
    this.clearError('selectedRegionId');
    this.updateAreaOptions();
  }

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

  onAreaChange(value: any): void {
    const areaId = this.toNumber(value);
    this.selectedAreaId = areaId;
    this.formData.area_id = areaId;
    this.clearError('selectedAreaId');
  }

  // Load roles
  loadRoles(): void {
    if (!this.selectedCompanyId) {
      this.rolesError = 'No company selected. Cannot load roles.';
      this.roles = [];
      return;
    }

    this.isLoadingRoles = true;
    this.rolesError = '';
    const url = this.apiService.getApiUrl(`companies/${this.selectedCompanyId}/roles`);
    const headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });
    const params = new HttpParams()
      .set('is_active', 'true')
      .set('limit', '20')
      .set('offset', '0');

    this.http.get<any>(url, { headers, params }).subscribe({
      next: (response) => {
        this.isLoadingRoles = false;
        console.log('Roles API response:', response);
        
        let rolesData: any[] = [];
        if (response.data && Array.isArray(response.data)) {
          rolesData = response.data;
        } else if (Array.isArray(response)) {
          rolesData = response;
        }

        this.roles = rolesData.map((role: any) => ({
          name: role.name || 'N/A',
          description: role.description || '',
          is_active: role.is_active !== undefined ? role.is_active : true
        }));
      },
      error: (error) => {
        this.isLoadingRoles = false;
        console.error('Error loading roles:', error);
        
        let errorMessage = 'Failed to load roles. Please try again.';
        if (error.error) {
          if (error.error.message) {
            errorMessage = error.error.message;
          } else if (error.error.detail) {
            errorMessage = error.error.detail;
          } else if (typeof error.error === 'string') {
            errorMessage = error.error;
          }
        }
        this.rolesError = errorMessage;
        this.roles = [];
      }
    });
  }

  // Load routes
  loadRoutes(): void {
    if (!this.selectedCompanyId) {
      this.routesError = 'No company selected. Cannot load routes.';
      this.routes = [];
      return;
    }

    this.isLoadingRoutes = true;
    this.routesError = '';
    const url = this.apiService.getApiUrl(`companies/${this.selectedCompanyId}/routes`);
    const headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });
    const params = new HttpParams()
      .set('page', '1')
      .set('per_page', '100');

    this.http.get<any>(url, { headers, params }).subscribe({
      next: (response) => {
        this.isLoadingRoutes = false;
        console.log('Routes API response:', response);
        
        let routesData: any[] = [];
        if (response.data && Array.isArray(response.data)) {
          routesData = response.data;
        } else if (Array.isArray(response)) {
          routesData = response;
        }

        this.routes = routesData.map((route: any) => ({
          id: route.id,
          name: route.name || 'N/A',
          code: route.code || 'N/A'
        }));
      },
      error: (error) => {
        this.isLoadingRoutes = false;
        console.error('Error loading routes:', error);
        
        let errorMessage = 'Failed to load routes. Please try again.';
        if (error.error) {
          if (error.error.message) {
            errorMessage = error.error.message;
          } else if (error.error.detail) {
            errorMessage = error.error.detail;
          } else if (typeof error.error === 'string') {
            errorMessage = error.error;
          }
        }
        this.routesError = errorMessage;
        this.routes = [];
      }
    });
  }

  toNumber(value: any): number | null {
    if (value === null || value === undefined || value === '') {
      return null;
    }
    const num = Number(value);
    return isNaN(num) ? null : num;
  }

  onSave(): void {
    // Clear previous errors
    this.errors = {};
    let hasErrors = false;

    // Validation
    if (!this.formData.name || this.formData.name.trim() === '') {
      this.errors['name'] = 'Name is required';
      hasErrors = true;
    }

    if (!this.formData.contact_no || this.formData.contact_no.trim() === '') {
      this.errors['contact_no'] = 'Contact number is required';
      hasErrors = true;
    }

    if (hasErrors) {
      const firstErrorField = document.querySelector('.error-message');
      if (firstErrorField) {
        firstErrorField.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      return;
    }

    // Build form data with company_id
    const submitData: EmployeeFormData = {
      username: this.formData.username || '',
      name: this.formData.name,
      contact_no: this.formData.contact_no,
      role: this.formData.role || '',
      area_id: this.formData.area_id,
      bank_details: this.hasBankDetails() ? this.bankDetails : null,
      company_id: this.selectedCompanyId
    };

    this.save.emit(submitData);
  }

  hasBankDetails(): boolean {
    return !!(
      this.bankDetails.account_number ||
      this.bankDetails.account_name ||
      this.bankDetails.bank_name ||
      this.bankDetails.bank_branch ||
      this.bankDetails.ifsc_code
    );
  }

  clearError(fieldName: string): void {
    if (this.errors[fieldName]) {
      delete this.errors[fieldName];
    }
  }

  onCancel(): void {
    this.cancel.emit();
  }

  populateFormForEdit(): void {
    if (!this.employeeData) {
      return;
    }

    // Populate basic fields
    this.formData.username = this.employeeData.username || '';
    this.formData.name = this.employeeData.name || '';
    this.formData.contact_no = this.employeeData.contact_no || '';
    this.formData.role = this.employeeData.role || '';
    this.formData.area_id = this.employeeData.area_id || null;
    this.formData.company_id = this.employeeData.company_id || this.selectedCompanyId;

    // Set selected area ID for hierarchy
    if (this.employeeData.area_id) {
      this.selectedAreaId = this.employeeData.area_id;
      // Try to find and set the hierarchy (country, zone, region) based on area_id
      // This would require finding the area in allAreas and setting the hierarchy
      const area = this.allAreas.find(a => a.id === this.employeeData.area_id);
      if (area) {
        // Set hierarchy based on area type and parent relationships
        // This is a simplified version - you may need to adjust based on your area structure
      }
    }

    // Populate bank details
    if (this.employeeData.bank_details) {
      this.bankDetails = {
        account_number: this.employeeData.bank_details.account_number || '',
        account_name: this.employeeData.bank_details.account_name || '',
        bank_name: this.employeeData.bank_details.bank_name || '',
        bank_branch: this.employeeData.bank_details.bank_branch || '',
        account_type: this.employeeData.bank_details.account_type || 'SAVINGS',
        ifsc_code: this.employeeData.bank_details.ifsc_code || ''
      };
      this.formData.bank_details = { ...this.bankDetails };
    }
  }
}
