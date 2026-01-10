import { Component, EventEmitter, Input, Output, OnChanges, SimpleChanges, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';

const API_URL = 'http://ec2-13-203-193-170.ap-south-1.compute.amazonaws.com/api/v1';

interface AreaOption {
  id: number;
  name: string;
  type: 'NATION' | 'ZONE' | 'REGION' | 'AREA' | 'DIVISION';
}

interface RouteFormData {
  routeName: string;
  routeCode: string;
  selectedCountryId: number | null;
  selectedZoneId: number | null;
  selectedRegionId: number | null;
  selectedAreaId: number | null;
  selectedDivisionId: number | null;
  is_general: boolean;
  is_modern: boolean;
  is_horeca: boolean;
  is_active: boolean;
  newCountry: string;
  newZone: string;
  newRegion: string;
  newArea: string;
}

@Component({
  selector: 'app-route-form-step1',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './route-form-step1.component.html',
  styleUrl: './route-form-step1.component.scss'
})
export class RouteFormStep1Component implements OnInit, OnChanges {
  @Input() selectedCompanyId: string = '';
  @Input() routeData: any = null; // Route data for editing
  @Input() routeId: number | null = null; // Route ID for editing
  @Input() isEditMode: boolean = false; // Flag to indicate edit mode
  @Output() save = new EventEmitter<RouteFormData>();
  @Output() cancel = new EventEmitter<void>();

  formData: RouteFormData = {
    routeName: '',
    routeCode: '',
    selectedCountryId: null,
    selectedZoneId: null,
    selectedRegionId: null,
    selectedAreaId: null,
    selectedDivisionId: null,
    is_general: false,
    is_modern: false,
    is_horeca: false,
    is_active: true,
    newCountry: '',
    newZone: '',
    newRegion: '',
    newArea: ''
  };

  isSubmitting = false;
  isLoadingAllAreas = false;
  isLoadingNations = false;
  isLoadingZones = false;
  isLoadingRegions = false;
  isLoadingAreas = false;
  isLoadingDivisions = false;

  // Store all areas fetched from the single API
  allAreas: any[] = [];

  // Dropdown options - filtered from allAreas
  countryOptions: AreaOption[] = [];
  zoneOptions: AreaOption[] = [];
  regionOptions: AreaOption[] = [];
  areaOptions: AreaOption[] = [];
  divisionOptions: AreaOption[] = [];

  errors: { [key: string]: string } = {};
  isLoadingCountry = false;
  isLoadingZone = false;
  isLoadingRegion = false;
  isLoadingArea = false;

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    // Fetch all areas when component initializes if company is already selected
    if (this.selectedCompanyId) {
      this.loadAllAreas();
    }
    
    // If in edit mode and route data is provided, populate the form
    if (this.isEditMode && this.routeData) {
      this.populateFormForEdit();
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    // Watch for changes to selectedCompanyId (including initial change)
    if (changes['selectedCompanyId']) {
      const newCompanyId = changes['selectedCompanyId'].currentValue;
      if (newCompanyId && newCompanyId !== changes['selectedCompanyId'].previousValue) {
        this.loadAllAreas();
      } else if (!newCompanyId) {
        // Reset all dropdowns if company is cleared
        this.allAreas = [];
        this.countryOptions = [];
        this.zoneOptions = [];
        this.regionOptions = [];
        this.areaOptions = [];
        this.divisionOptions = [];
        this.formData.selectedCountryId = null;
        this.formData.selectedZoneId = null;
        this.formData.selectedRegionId = null;
        this.formData.selectedAreaId = null;
        this.formData.selectedDivisionId = null;
      }
    }
    
    // Watch for route data changes (when editing)
    if (changes['routeData'] && this.isEditMode && this.routeData) {
      this.populateFormForEdit();
    }
  }

  // Populate form with route data for editing
  populateFormForEdit(): void {
    if (!this.routeData) return;
    
    this.formData.routeName = this.routeData.name || '';
    this.formData.routeCode = this.routeData.code || '';
    const routeAreaId = this.routeData.area_id || null;
    this.formData.selectedAreaId = routeAreaId;
    this.formData.is_general = this.routeData.is_general || false;
    this.formData.is_modern = this.routeData.is_modern || false;
    this.formData.is_horeca = this.routeData.is_horeca || false;
    this.formData.is_active = this.routeData.is_active !== undefined ? this.routeData.is_active : true;
    
    // Load all areas first to populate nations
    // The populateHierarchyFromCache will be called after allAreas loads
    if (this.selectedCompanyId) {
      this.loadAllAreas();
    }
  }

  // Load area hierarchy to populate parent selections (country, zone, region)
  // areaId is the AREA we want to select (from route.area_id)
  loadAreaHierarchy(areaId: number): void {
    if (!this.selectedCompanyId || !areaId) return;
    
    const url = `${API_URL}/companies/${this.selectedCompanyId}/areas/${areaId}`;
    const headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });

    this.http.get<any>(url, { headers }).subscribe({
      next: (response) => {
        const areaData = response.data || response;
        
        // Ensure the selected area ID is set
        this.formData.selectedAreaId = areaId;
        
        // Check if response includes parent IDs directly
        if (areaData.region_id) {
          this.formData.selectedRegionId = areaData.region_id;
          // Fetch regions for this zone to populate dropdown
          this.updateAreaOptions();
          // Load region hierarchy to get zone and country
          this.loadRegionHierarchy(areaData.region_id);
        } else if (areaData.type === 'AREA') {
          // If it's an AREA type but no region_id, we need to search differently
          // This shouldn't happen, but handle it gracefully
          console.warn('Area does not have region_id in response');
        }
      },
      error: (error) => {
        console.error('Error loading area details:', error);
        // If we can't fetch the area, at least the area_id is already set
        // User will need to manually select the hierarchy
      }
    });
  }

  // Helper method to load region hierarchy
  loadRegionHierarchy(regionId: number): void {
    if (!this.selectedCompanyId || !regionId) return;
    
    const url = `${API_URL}/companies/${this.selectedCompanyId}/areas/${regionId}`;
    const headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });

    this.http.get<any>(url, { headers }).subscribe({
      next: (response) => {
        const regionData = response.data || response;
        // Set region ID
        this.formData.selectedRegionId = regionId;
        
        if (regionData.zone_id) {
          this.formData.selectedZoneId = regionData.zone_id;
          // Fetch zones for this nation to populate dropdown
          this.updateRegionOptions();
          // Load zone hierarchy to get country
          this.loadZoneHierarchy(regionData.zone_id);
        }
      },
      error: (error) => {
        console.error('Error loading region details:', error);
      }
    });
  }

  // Helper method to load zone hierarchy
  loadZoneHierarchy(zoneId: number): void {
    if (!this.selectedCompanyId || !zoneId) return;
    
    const url = `${API_URL}/companies/${this.selectedCompanyId}/areas/${zoneId}`;
    const headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });

    this.http.get<any>(url, { headers }).subscribe({
      next: (response) => {
        const zoneData = response.data || response;
        // Set zone ID
        this.formData.selectedZoneId = zoneId;
        
        if (zoneData.nation_id) {
          this.formData.selectedCountryId = zoneData.nation_id;
          // Fetch zones for this nation to populate dropdown
          this.updateZoneOptions();
        }
      },
      error: (error) => {
        console.error('Error loading zone details:', error);
      }
    });
  }

  // Fetch all areas for the selected company using single API
  loadAllAreas(): void {
    if (!this.selectedCompanyId) {
      return;
    }

    this.isLoadingAllAreas = true;
    this.isLoadingNations = true;
    const url = `${API_URL}/companies/${this.selectedCompanyId}/areas`;
    const headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });

    this.http.get<any>(url, { headers }).subscribe({
      next: (response) => {
        this.isLoadingAllAreas = false;
        this.isLoadingNations = false;
        
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
        
        // If in edit mode and area_id is set, populate hierarchy from cached data
        if (this.isEditMode && this.formData.selectedAreaId) {
          this.populateHierarchyFromCache();
        }
      },
      error: (error) => {
        this.isLoadingAllAreas = false;
        this.isLoadingNations = false;
        console.error('Error loading areas:', error);
        this.allAreas = [];
        this.countryOptions = [];
      }
    });
  }

  // Populate hierarchy from cached allAreas data
  populateHierarchyFromCache(): void {
    if (!this.formData.selectedAreaId) return;
    
    // Since the flat list might not have parent relationships, 
    // fetch the specific area to get parent info
    this.loadAreaHierarchy(this.formData.selectedAreaId);
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

  // Fetch zones (type: ZONE) for selected nation using query parameters
  updateZoneOptions(): void {
    if (!this.formData.selectedCountryId || !this.selectedCompanyId) {
      this.zoneOptions = [];
      return;
    }

    this.isLoadingZones = true;
    const url = `${API_URL}/companies/${this.selectedCompanyId}/areas`;
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

  // Fetch regions (type: REGION) for selected zone using query parameters
  updateRegionOptions(): void {
    if (!this.formData.selectedZoneId || !this.selectedCompanyId) {
      this.regionOptions = [];
      return;
    }

    this.isLoadingRegions = true;
    const url = `${API_URL}/companies/${this.selectedCompanyId}/areas`;
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

  // Fetch areas (type: AREA) for selected region using query parameters
  updateAreaOptions(): void {
    if (!this.formData.selectedRegionId || !this.selectedCompanyId) {
      this.areaOptions = [];
      return;
    }

    this.isLoadingAreas = true;
    const url = `${API_URL}/companies/${this.selectedCompanyId}/areas`;
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

  // Fetch divisions (type: DIVISION) for selected area using query parameters
  updateDivisionOptions(): void {
    if (!this.formData.selectedAreaId || !this.selectedCompanyId) {
      this.divisionOptions = [];
      return;
    }

    this.isLoadingDivisions = true;
    const url = `${API_URL}/companies/${this.selectedCompanyId}/areas`;
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

  // Auto-generate route code
  generateRouteCode(): void {
    if (this.formData.routeName) {
      const prefix = this.formData.routeName.substring(0, 2).toUpperCase();
      const suffix = Math.random().toString(36).substring(2, 8).toUpperCase();
      this.formData.routeCode = `RT-${prefix}-${suffix}`;
    }
  }

  // Create NATION
  addCountry(): void {
    if (!this.selectedCompanyId) {
      this.errors['newCountry'] = 'Please select a company first';
      return;
    }

    if (!this.formData.newCountry || this.formData.newCountry.trim().length === 0) {
      this.errors['newCountry'] = 'Country name is required';
      return;
    }

    if (this.formData.newCountry.trim().length < 1 || this.formData.newCountry.trim().length > 64) {
      this.errors['newCountry'] = 'Country name must be between 1 and 64 characters';
      return;
    }

    this.isLoadingCountry = true;
    this.clearError('newCountry');

    // For NATION, only send name and type (no parent IDs)
    const payload: any = {
      name: this.formData.newCountry.trim(),
      type: 'NATION'
    };

    const url = `${API_URL}/companies/${this.selectedCompanyId}/areas`;
    const headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });

    this.http.post<any>(url, payload, { headers }).subscribe({
      next: (response) => {
        this.isLoadingCountry = false;
        const responseData = response.data || response;
        // Add to allAreas array and refresh country options
        const newNation = {
          id: responseData.id,
          name: responseData.name || this.formData.newCountry.trim(),
          type: 'NATION',
          is_active: true
        };
        this.allAreas.push(newNation);
        this.updateCountryOptions();
        // Select the newly created nation
        this.formData.selectedCountryId = newNation.id;
        this.formData.newCountry = '';
        // Refresh zone options after selecting the nation
        this.updateZoneOptions();
      },
      error: (error) => {
        this.isLoadingCountry = false;
        console.error('Error creating nation:', error);
        console.error('Full error object:', JSON.stringify(error, null, 2));
        if (error.error?.message) {
          this.errors['newCountry'] = error.error.message;
        } else if (error.error?.detail) {
          this.errors['newCountry'] = error.error.detail;
        } else if (error.error?.errors && Array.isArray(error.error.errors)) {
          this.errors['newCountry'] = error.error.errors[0]?.message || 'Failed to create nation';
        } else {
          this.errors['newCountry'] = 'Failed to create nation. Please try again.';
        }
      }
    });
  }

  // Create ZONE (requires nation_id)
  addZone(): void {
    if (!this.selectedCompanyId) {
      this.errors['newZone'] = 'Please select a company first';
      return;
    }

    if (!this.formData.selectedCountryId) {
      this.errors['newZone'] = 'Please select a country first';
      return;
    }

    if (!this.formData.newZone || this.formData.newZone.trim().length === 0) {
      this.errors['newZone'] = 'Zone name is required';
      return;
    }

    if (this.formData.newZone.trim().length < 1 || this.formData.newZone.trim().length > 64) {
      this.errors['newZone'] = 'Zone name must be between 1 and 64 characters';
      return;
    }

    this.isLoadingZone = true;
    this.clearError('newZone');

    // For ZONE, only send name, type, and nation_id (parent)
    const payload: any = {
      name: this.formData.newZone.trim(),
      type: 'ZONE',
      nation_id: this.formData.selectedCountryId
    };

    const url = `${API_URL}/companies/${this.selectedCompanyId}/areas`;
    const headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });

    this.http.post<any>(url, payload, { headers }).subscribe({
      next: (response) => {
        this.isLoadingZone = false;
        const responseData = response.data || response;
        // Refresh zone options to include the newly created zone
        this.updateZoneOptions();
        // Select the newly created zone
        this.formData.selectedZoneId = responseData.id;
        this.formData.newZone = '';
        // Refresh region options if zone is selected
        if (this.formData.selectedZoneId) {
          setTimeout(() => this.updateRegionOptions(), 100);
        }
      },
      error: (error) => {
        this.isLoadingZone = false;
        console.error('Error creating zone:', error);
        if (error.error?.message) {
          this.errors['newZone'] = error.error.message;
        } else if (error.error?.detail) {
          this.errors['newZone'] = error.error.detail;
        } else if (error.error?.errors && Array.isArray(error.error.errors)) {
          this.errors['newZone'] = error.error.errors[0]?.message || 'Failed to create zone';
        } else {
          this.errors['newZone'] = 'Failed to create zone. Please try again.';
        }
      }
    });
  }

  // Create REGION (requires zone_id)
  addRegion(): void {
    if (!this.selectedCompanyId) {
      this.errors['newRegion'] = 'Please select a company first';
      return;
    }

    if (!this.formData.selectedZoneId) {
      this.errors['newRegion'] = 'Please select a zone first';
      return;
    }

    if (!this.formData.newRegion || this.formData.newRegion.trim().length === 0) {
      this.errors['newRegion'] = 'Region name is required';
      return;
    }

    if (this.formData.newRegion.trim().length < 1 || this.formData.newRegion.trim().length > 64) {
      this.errors['newRegion'] = 'Region name must be between 1 and 64 characters';
      return;
    }

    this.isLoadingRegion = true;
    this.clearError('newRegion');

    // For REGION, only send name, type, and zone_id (parent)
    const payload: any = {
      name: this.formData.newRegion.trim(),
      type: 'REGION',
      zone_id: this.formData.selectedZoneId
    };

    const url = `${API_URL}/companies/${this.selectedCompanyId}/areas`;
    const headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });

    this.http.post<any>(url, payload, { headers }).subscribe({
      next: (response) => {
        this.isLoadingRegion = false;
        const responseData = response.data || response;
        // Refresh region options to include the newly created region
        this.updateRegionOptions();
        // Select the newly created region
        this.formData.selectedRegionId = responseData.id;
        this.formData.newRegion = '';
        // Refresh area options if region is selected
        if (this.formData.selectedRegionId) {
          setTimeout(() => this.updateAreaOptions(), 100);
        }
      },
      error: (error) => {
        this.isLoadingRegion = false;
        console.error('Error creating region:', error);
        if (error.error?.message) {
          this.errors['newRegion'] = error.error.message;
        } else if (error.error?.detail) {
          this.errors['newRegion'] = error.error.detail;
        } else if (error.error?.errors && Array.isArray(error.error.errors)) {
          this.errors['newRegion'] = error.error.errors[0]?.message || 'Failed to create region';
        } else {
          this.errors['newRegion'] = 'Failed to create region. Please try again.';
        }
      }
    });
  }

  // Create AREA (requires region_id)
  addArea(): void {
    if (!this.selectedCompanyId) {
      this.errors['newArea'] = 'Please select a company first';
      return;
    }

    if (!this.formData.selectedRegionId) {
      this.errors['newArea'] = 'Please select a region first';
      return;
    }

    if (!this.formData.newArea || this.formData.newArea.trim().length === 0) {
      this.errors['newArea'] = 'Area name is required';
      return;
    }

    if (this.formData.newArea.trim().length < 1 || this.formData.newArea.trim().length > 64) {
      this.errors['newArea'] = 'Area name must be between 1 and 64 characters';
      return;
    }

    this.isLoadingArea = true;
    this.clearError('newArea');

    // For AREA, only send name, type, and region_id (parent)
    const payload: any = {
      name: this.formData.newArea.trim(),
      type: 'AREA',
      region_id: this.formData.selectedRegionId
    };

    const url = `${API_URL}/companies/${this.selectedCompanyId}/areas`;
    const headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });

    this.http.post<any>(url, payload, { headers }).subscribe({
      next: (response) => {
        this.isLoadingArea = false;
        const responseData = response.data || response;
        // Refresh area options to include the newly created area
        this.updateAreaOptions();
        // Select the newly created area
        this.formData.selectedAreaId = responseData.id;
        this.formData.newArea = '';
        // Refresh division options if area is selected
        if (this.formData.selectedAreaId) {
          setTimeout(() => this.updateDivisionOptions(), 100);
        }
      },
      error: (error) => {
        this.isLoadingArea = false;
        console.error('Error creating area:', error);
        if (error.error?.message) {
          this.errors['newArea'] = error.error.message;
        } else if (error.error?.detail) {
          this.errors['newArea'] = error.error.detail;
        } else if (error.error?.errors && Array.isArray(error.error.errors)) {
          this.errors['newArea'] = error.error.errors[0]?.message || 'Failed to create area';
        } else {
          this.errors['newArea'] = 'Failed to create area. Please try again.';
        }
      }
    });
  }

  onSaveAndNext(): void {
    this.errors = {};
    let hasErrors = false;

    // Validation for route name
    if (!this.formData.routeName || this.formData.routeName.trim().length === 0) {
      this.errors['routeName'] = 'Route name is required';
      hasErrors = true;
    } else if (this.formData.routeName.trim().length < 1 || this.formData.routeName.trim().length > 32) {
      this.errors['routeName'] = 'Route name must be between 1 and 32 characters';
      hasErrors = true;
    }

    // Validation for route code (only required for add mode, not edit)
    if (!this.isEditMode) {
      if (!this.formData.routeCode || this.formData.routeCode.trim().length === 0) {
        this.errors['routeCode'] = 'Route code is required';
        hasErrors = true;
      } else if (this.formData.routeCode.trim().length < 1 || this.formData.routeCode.trim().length > 32) {
        this.errors['routeCode'] = 'Route code must be between 1 and 32 characters';
        hasErrors = true;
      }
    }

    // Validation for area_id (must select an area)
    if (!this.formData.selectedAreaId || this.formData.selectedAreaId <= 0) {
      this.errors['selectedAreaId'] = 'Please select an area';
      hasErrors = true;
    }

    // Validation for company selection
    if (!this.selectedCompanyId) {
      this.errors['company'] = 'Please select a company first';
      hasErrors = true;
    }

    // Validation for route ID in edit mode
    if (this.isEditMode && !this.routeId) {
      this.errors['submit'] = 'Route ID is required for editing';
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

    this.isSubmitting = true;
    const headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });

    if (this.isEditMode && this.routeId) {
      // PATCH API for editing - only send fields that can be updated
      const payload = {
        name: this.formData.routeName.trim(),
        area_id: this.formData.selectedAreaId,
        is_general: this.formData.is_general,
        is_modern: this.formData.is_modern,
        is_horeca: this.formData.is_horeca
      };

      const url = `${API_URL}/companies/${this.selectedCompanyId}/routes/${this.routeId}`;

      this.http.patch<any>(url, payload, { headers }).subscribe({
        next: (response) => {
          this.isSubmitting = false;
          console.log('Route updated successfully:', response);
          // Emit the form data for parent component to handle
          this.save.emit(this.formData);
        },
        error: (error) => {
          this.isSubmitting = false;
          console.error('Error updating route:', error);
          if (error.error?.message) {
            this.errors['submit'] = error.error.message;
          } else if (error.error?.detail) {
            this.errors['submit'] = error.error.detail;
          } else if (error.error?.errors && Array.isArray(error.error.errors)) {
            this.errors['submit'] = error.error.errors[0]?.message || 'Failed to update route';
          } else {
            this.errors['submit'] = 'Failed to update route. Please try again.';
          }
          // Scroll to error
          setTimeout(() => {
            const errorElement = document.querySelector('.error-message');
            if (errorElement) {
              errorElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
          }, 100);
        }
      });
    } else {
      // POST API for creating new route
      const payload = {
        name: this.formData.routeName.trim(),
        code: this.formData.routeCode.trim(),
        area_id: this.formData.selectedAreaId,
        is_general: this.formData.is_general,
        is_modern: this.formData.is_modern,
        is_horeca: this.formData.is_horeca,
        is_active: this.formData.is_active
      };

      const url = `${API_URL}/companies/${this.selectedCompanyId}/routes`;

      this.http.post<any>(url, payload, { headers }).subscribe({
        next: (response) => {
          this.isSubmitting = false;
          console.log('Route created successfully:', response);
          // Emit the form data for parent component to handle
    this.save.emit(this.formData);
        },
        error: (error) => {
          this.isSubmitting = false;
          console.error('Error creating route:', error);
          if (error.error?.message) {
            this.errors['submit'] = error.error.message;
          } else if (error.error?.detail) {
            this.errors['submit'] = error.error.detail;
          } else if (error.error?.errors && Array.isArray(error.error.errors)) {
            this.errors['submit'] = error.error.errors[0]?.message || 'Failed to create route';
          } else {
            this.errors['submit'] = 'Failed to create route. Please try again.';
          }
          // Scroll to error
          setTimeout(() => {
            const errorElement = document.querySelector('.error-message');
            if (errorElement) {
              errorElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
          }, 100);
        }
      });
    }
  }

  clearError(field: string): void {
    if (this.errors[field]) {
      delete this.errors[field];
    }
  }

  // Helper method to convert string to number
  toNumber(value: any): number | null {
    if (value === null || value === undefined || value === '') {
      return null;
    }
    const num = Number(value);
    return isNaN(num) ? null : num;
  }

  // Handle country selection change
  onCountryChange(value: any): void {
    const countryId = this.toNumber(value);
    this.formData.selectedCountryId = countryId;
    
    // Reset child selections and options
    this.formData.selectedZoneId = null;
    this.formData.selectedRegionId = null;
    this.formData.selectedAreaId = null;
    this.formData.selectedDivisionId = null;
    this.zoneOptions = [];
    this.regionOptions = [];
    this.areaOptions = [];
    this.divisionOptions = [];
    
    this.clearError('selectedCountryId');
    
    // Update zones from cached data
    this.updateZoneOptions();
  }

  // Handle zone selection change
  onZoneChange(value: any): void {
    const zoneId = this.toNumber(value);
    this.formData.selectedZoneId = zoneId;
    
    // Reset child selections and options
    this.formData.selectedRegionId = null;
    this.formData.selectedAreaId = null;
    this.formData.selectedDivisionId = null;
    this.regionOptions = [];
    this.areaOptions = [];
    this.divisionOptions = [];
    
    this.clearError('selectedZoneId');
    
    // Update regions from cached data
    this.updateRegionOptions();
  }

  // Handle region selection change
  onRegionChange(value: any): void {
    const regionId = this.toNumber(value);
    this.formData.selectedRegionId = regionId;
    
    // Reset child selection and options
    this.formData.selectedAreaId = null;
    this.formData.selectedDivisionId = null;
    this.areaOptions = [];
    this.divisionOptions = [];
    
    this.clearError('selectedRegionId');
    
    // Update areas from cached data
    this.updateAreaOptions();
  }

  // Handle area selection change
  onAreaChange(value: any): void {
    const areaId = this.toNumber(value);
    this.formData.selectedAreaId = areaId;
    
    // Reset division selection and options
    this.formData.selectedDivisionId = null;
    this.divisionOptions = [];
    
    this.clearError('selectedAreaId');
    
    // Update divisions from cached data
    this.updateDivisionOptions();
  }

  onCancel(): void {
    this.cancel.emit();
  }
}
