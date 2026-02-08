import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { ApiService } from '../../../../core/services/api.service';

interface AreaOption {
  id: number;
  name: string;
  type: 'NATION' | 'ZONE' | 'REGION' | 'AREA' | 'DIVISION';
}

interface RouteOption {
  id: number;
  name: string;
  code: string;
}

interface RetailerFormStep2Data {
  selectedCountryId: number | null;
  selectedZoneId: number | null;
  selectedRegionId: number | null;
  selectedAreaId: number | null;
  selectedDivisionId: number | null;
  selectedRouteId: number | null;
  bankName: string;
  bankBranch: string;
  ifscCode: string;
  accountType: string;
  accountNo: string;
  accountName: string;
  retailerType: string | null;
}

@Component({
  selector: 'app-retailer-form-step2',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './retailer-form-step2.component.html',
  styleUrl: './retailer-form-step2.component.scss'
})
export class RetailerFormStep2Component implements OnInit, OnChanges {
  @Input() selectedCompanyId: string = '';
  @Output() save = new EventEmitter<RetailerFormStep2Data>();
  @Output() previous = new EventEmitter<void>();

  formData: RetailerFormStep2Data = {
    selectedCountryId: null,
    selectedZoneId: null,
    selectedRegionId: null,
    selectedAreaId: null,
    selectedDivisionId: null,
    selectedRouteId: null,
    bankName: '',
    bankBranch: '',
    ifscCode: '',
    accountType: 'Current Account',
    accountNo: '',
    accountName: '',
    retailerType: null
  };

  countryOptions: AreaOption[] = [];
  zoneOptions: AreaOption[] = [];
  regionOptions: AreaOption[] = [];
  areaOptions: AreaOption[] = [];
  divisionOptions: AreaOption[] = [];
  routeOptions: RouteOption[] = [];

  isLoadingCountries = false;
  isLoadingZones = false;
  isLoadingRegions = false;
  isLoadingAreas = false;
  isLoadingDivisions = false;
  isLoadingRoutes = false;

  errors: { [key: string]: string } = {};

  constructor(
    private http: HttpClient,
    private apiService: ApiService
  ) {}

  ngOnInit(): void {
    if (this.selectedCompanyId) {
      this.loadCountries();
      this.loadRoutes();
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['selectedCompanyId'] && this.selectedCompanyId) {
      this.loadCountries();
      this.loadRoutes();
    }
  }

  loadCountries(): void {
    if (!this.selectedCompanyId) {
      return;
    }

    this.isLoadingCountries = true;
    const url = this.apiService.getApiUrl(`companies/${this.selectedCompanyId}/areas`);
    const headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });
    const params = new HttpParams().set('area_type', 'NATION');

    this.http.get<any>(url, { headers, params }).subscribe({
      next: (response) => {
        this.isLoadingCountries = false;
        let countries: any[] = [];
        if (Array.isArray(response)) {
          countries = response;
        } else if (response.data && Array.isArray(response.data)) {
          countries = response.data;
        }

        this.countryOptions = countries.map((country: any) => ({
          id: country.id,
          name: country.name,
          type: 'NATION' as const
        }));
      },
      error: (error) => {
        this.isLoadingCountries = false;
        console.error('Error loading countries:', error);
        this.countryOptions = [];
      }
    });
  }

  onCountryChange(value: any): void {
    const countryId = this.toNumber(value);
    this.formData.selectedCountryId = countryId;
    this.formData.selectedZoneId = null;
    this.formData.selectedRegionId = null;
    this.formData.selectedAreaId = null;
    this.formData.selectedDivisionId = null;
    this.zoneOptions = [];
    this.regionOptions = [];
    this.areaOptions = [];
    this.divisionOptions = [];
    this.clearError('selectedCountryId');

    if (countryId) {
      this.updateZoneOptions();
    }
  }

  updateZoneOptions(): void {
    if (!this.formData.selectedCountryId || !this.selectedCompanyId) {
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
      .set('parent_id', this.formData.selectedCountryId.toString())
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
    this.formData.selectedZoneId = zoneId;
    this.formData.selectedRegionId = null;
    this.formData.selectedAreaId = null;
    this.formData.selectedDivisionId = null;
    this.regionOptions = [];
    this.areaOptions = [];
    this.divisionOptions = [];
    this.clearError('selectedZoneId');

    if (zoneId) {
      this.updateRegionOptions();
    }
  }

  updateRegionOptions(): void {
    if (!this.formData.selectedZoneId || !this.selectedCompanyId) {
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
      .set('parent_id', this.formData.selectedZoneId.toString())
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
    this.formData.selectedRegionId = regionId;
    this.formData.selectedAreaId = null;
    this.formData.selectedDivisionId = null;
    this.areaOptions = [];
    this.divisionOptions = [];
    this.clearError('selectedRegionId');

    if (regionId) {
      this.updateAreaOptions();
    }
  }

  updateAreaOptions(): void {
    if (!this.formData.selectedRegionId || !this.selectedCompanyId) {
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
      .set('parent_id', this.formData.selectedRegionId.toString())
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
    this.formData.selectedAreaId = areaId;
    this.formData.selectedDivisionId = null;
    this.divisionOptions = [];
    this.clearError('selectedAreaId');

    if (areaId) {
      this.updateDivisionOptions();
    }
  }

  updateDivisionOptions(): void {
    if (!this.formData.selectedAreaId || !this.selectedCompanyId) {
      this.divisionOptions = [];
      return;
    }

    this.isLoadingDivisions = true;
    const url = this.apiService.getApiUrl(`companies/${this.selectedCompanyId}/areas`);
    const headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });
    const params = new HttpParams()
      .set('area_type', 'DIVISION')
      .set('parent_id', this.formData.selectedAreaId.toString())
      .set('parent_type', 'AREA');

    this.http.get<any>(url, { headers, params }).subscribe({
      next: (response) => {
        this.isLoadingDivisions = false;
        let divisions: any[] = [];
        if (Array.isArray(response)) {
          divisions = response;
        } else if (response.data && Array.isArray(response.data)) {
          divisions = response.data;
        }

        this.divisionOptions = divisions.map((division: any) => ({
          id: division.id,
          name: division.name,
          type: 'DIVISION' as const
        }));
      },
      error: (error) => {
        this.isLoadingDivisions = false;
        console.error('Error loading divisions:', error);
        this.divisionOptions = [];
      }
    });
  }

  onDivisionChange(value: any): void {
    this.formData.selectedDivisionId = this.toNumber(value);
    this.clearError('selectedDivisionId');
  }

  loadRoutes(): void {
    if (!this.selectedCompanyId) {
      return;
    }

    this.isLoadingRoutes = true;
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
        let routesData: any[] = [];
        if (response.data && Array.isArray(response.data)) {
          routesData = response.data;
        } else if (Array.isArray(response)) {
          routesData = response;
        }

        this.routeOptions = routesData.map((route: any) => ({
          id: route.id,
          name: route.name || 'N/A',
          code: route.code || 'N/A'
        }));
      },
      error: (error) => {
        this.isLoadingRoutes = false;
        console.error('Error loading routes:', error);
        this.routeOptions = [];
      }
    });
  }

  onRouteChange(value: any): void {
    this.formData.selectedRouteId = this.toNumber(value);
    this.clearError('selectedRouteId');
  }

  toNumber(value: any): number | null {
    if (value === null || value === undefined || value === '') {
      return null;
    }
    const num = Number(value);
    return isNaN(num) ? null : num;
  }

  onSaveAndNext(): void {
    // Clear previous errors
    this.errors = {};
    let hasErrors = false;

    // Basic validation
    if (!this.formData.selectedCountryId) {
      this.errors['selectedCountryId'] = 'Please select country';
      hasErrors = true;
    }
    if (!this.formData.selectedRouteId) {
      this.errors['selectedRouteId'] = 'Please select route';
      hasErrors = true;
    }
    if (!this.formData.bankName || this.formData.bankName.trim() === '') {
      this.errors['bankName'] = 'Bank name is required';
      hasErrors = true;
    }
    if (!this.formData.accountNo || this.formData.accountNo.trim() === '') {
      this.errors['accountNo'] = 'Account number is required';
      hasErrors = true;
    }
    if (!this.formData.accountName || this.formData.accountName.trim() === '') {
      this.errors['accountName'] = 'Account name is required';
      hasErrors = true;
    }
    if (!this.formData.bankBranch || this.formData.bankBranch.trim() === '') {
      this.errors['bankBranch'] = 'Bank branch is required';
      hasErrors = true;
    }
    if (!this.formData.ifscCode || this.formData.ifscCode.trim() === '') {
      this.errors['ifscCode'] = 'IFSC code is required';
      hasErrors = true;
    }
    if (!this.formData.retailerType) {
      this.errors['retailerType'] = 'Please select retailer type';
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

  onPrevious(): void {
    this.previous.emit();
  }
}
