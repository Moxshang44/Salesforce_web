import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { SidebarComponent } from '../../core/layout/sidebar/sidebar.component';
import { HeaderComponent } from '../../core/layout/header/header.component';
import { ButtonComponent } from '../../shared/components/button/button.component';
import { ModalComponent } from '../../shared/components/modal/modal.component';
import { DistributorFormStep1Component } from './components/distributor-form-step1/distributor-form-step1.component';
import { DistributorFormStep2Component } from './components/distributor-form-step2/distributor-form-step2.component';
import { DistributorFormStep3Component } from './components/distributor-form-step3/distributor-form-step3.component';
import { AuthService } from '../../core/services/auth.service';
import { ApiService } from '../../core/services/api.service';

const API_URL = 'http://ec2-13-203-193-170.ap-south-1.compute.amazonaws.com/api/v1';

interface DistributorApiResponse {
  id: string;
  name: string;
  code: string;
  contact_person_name: string;
  mobile_number: string;
  address: string;
  area_id: number;
  area_name: string;
  route_count: number;
  is_active: boolean;
}

interface DistributorsApiResponse {
  status_code: number;
  data: DistributorApiResponse[];
  records_per_page: number;
  total_count: number;
}

interface Distributor {
  id: string;
  name: string;
  distributorId: string;
  contactName: string;
  contactPhone: string;
  areaAddress: string;
  routesCover: string;
}

interface Company {
  id: string;
  name: string;
}

@Component({
  selector: 'app-distributors',
  standalone: true,
  imports: [CommonModule, FormsModule, SidebarComponent, HeaderComponent, ButtonComponent, ModalComponent, DistributorFormStep1Component, DistributorFormStep2Component, DistributorFormStep3Component],
  templateUrl: './distributors.component.html',
  styleUrl: './distributors.component.scss'
})
export class DistributorsComponent implements OnInit {
  currentPage = 1;
  totalPages = 1;
  limit = 20;
  totalCount = 0;
  isLoading = false;
  loadError = '';
  isAddModalOpen = false;
  currentStep = 1; // Always start at step 1 (no company selection needed)

  // Company selection - using logged-in company
  selectedCompanyId: string = '';

  // Form data storage
  step1FormData: any = null;
  step2FormData: any = null;
  step3FormData: any = null;

  // API submission
  isSubmitting = false;
  submitError = '';
  submitSuccess = false;

  constructor(
    private router: Router,
    private http: HttpClient,
    private authService: AuthService,
    private apiService: ApiService
  ) {}

  ngOnInit(): void {
    // Get logged-in company from AuthService
    const companyInfo = this.authService.getCompanyInfo();
    if (companyInfo && companyInfo.company_id) {
      this.selectedCompanyId = companyInfo.company_id;
      this.loadDistributors();
    } else {
      console.error('No company information found. Please login again.');
      this.loadError = 'No company information found. Please login again.';
    }
  }

  loadDistributors(): void {
    if (!this.selectedCompanyId) {
      this.loadError = 'No company ID available';
      return;
    }

    this.isLoading = true;
    this.loadError = '';

    // Calculate offset based on current page
    const offset = (this.currentPage - 1) * this.limit;

    // Build query parameters
    const params: any = {
      limit: this.limit.toString(),
      offset: offset.toString(),
      is_active: 'true'
    };

    // Add area_id filter if selected
    if (this.selectedArea) {
      // Extract area_id from selectedArea if it's in the format "Area X"
      // For now, we'll skip area_id filter as areaOptions are static
      // You can enhance this later to map area names to area_ids
    }

    const queryString = Object.keys(params)
      .map(key => `${key}=${encodeURIComponent(params[key])}`)
      .join('&');

    const url = `${API_URL}/companies/${this.selectedCompanyId}/distributors?${queryString}`;
    const headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });

    this.http.get<DistributorsApiResponse>(url, { headers }).subscribe({
      next: (response) => {
        this.isLoading = false;
        // API returns status_code 200 for success
        if ((response.status_code === 200 || response.status_code === 1) && response.data) {
          // Map API response to display format
          this.distributors = response.data.map(item => this.mapApiResponseToDistributor(item));
          this.totalCount = response.total_count;
          this.totalPages = Math.ceil(response.total_count / this.limit);
        } else {
          this.loadError = 'Failed to load distributors';
          this.distributors = [];
        }
      },
      error: (error) => {
        this.isLoading = false;
        console.error('Error loading distributors:', error);
        
        if (error.error && error.error.message) {
          this.loadError = error.error.message;
        } else {
          this.loadError = 'Failed to load distributors. Please try again.';
        }
        this.distributors = [];
      }
    });
  }

  private mapApiResponseToDistributor(apiItem: DistributorApiResponse): Distributor {
    return {
      id: apiItem.id,
      name: apiItem.name,
      distributorId: `#${apiItem.code}`,
      contactName: apiItem.contact_person_name,
      contactPhone: apiItem.mobile_number,
      areaAddress: apiItem.area_name ? `${apiItem.area_name}, ${apiItem.address}` : apiItem.address,
      routesCover: `${apiItem.route_count} Route${apiItem.route_count !== 1 ? 's' : ''}`
    };
  }

  // Filter options
  selectedCountryZone = '';
  selectedRegion = '';
  selectedArea = '';
  selectedSuperStockist = '';

  countryZoneOptions = ['India - North', 'India - South', 'India - East', 'India - West', 'USA - East', 'USA - West'];
  regionOptions = ['North Region', 'South Region', 'East Region', 'West Region', 'Central Region'];
  areaOptions = ['Area A', 'Area B', 'Area C', 'Area D', 'Area E'];
  superStockistOptions = ['Super Stockist 1', 'Super Stockist 2', 'Super Stockist 3', 'Super Stockist 4'];

  distributors: Distributor[] = [];

  onBulkUpload(): void {
    console.log('Bulk Upload clicked');
  }

  onExcel(): void {
    console.log('Excel clicked');
  }

  getModalTitle(): string {
    switch (this.currentStep) {
      case 1:
        return 'Add Distributor — Step 1: Basic Details';
      case 2:
        return 'Add Distributor — Step 2: Vehicles, Channels & Bank Details';
      case 3:
        return 'Add Distributor — Step 3: Assign Routes';
      default:
        return 'Add Distributor';
    }
  }

  onAdd(): void {
    // Get logged-in company ID
    const companyInfo = this.authService.getCompanyInfo();
    if (!companyInfo || !companyInfo.company_id) {
      alert('No company information found. Please login again.');
      return;
    }
    this.selectedCompanyId = companyInfo.company_id;
    this.step1FormData = null;
    this.step2FormData = null;
    this.step3FormData = null;
    this.submitError = '';
    this.submitSuccess = false;
    this.currentStep = 1; // Start directly at step 1 (no company selection)
    this.isAddModalOpen = true;
  }

  onSaveStep1(formData: any): void {
    this.step1FormData = formData;
    this.currentStep = 2;
  }

  onSaveStep2(formData: any): void {
    this.step2FormData = formData;
    this.currentStep = 3;
  }

  onSaveStep3(formData: any): void {
    this.step3FormData = formData;
    this.submitDistributor();
  }

  submitDistributor(): void {
    // Company ID is already set from logged-in user
    if (!this.selectedCompanyId) {
      this.submitError = 'No company information found. Please login again.';
      return;
    }

    if (!this.step1FormData || !this.step2FormData || !this.step3FormData) {
      this.submitError = 'Please complete all form steps.';
      return;
    }

    this.isSubmitting = true;
    this.submitError = '';
    this.submitSuccess = false;

    // Combine all form data according to API specification
    const payload: any = {
      // Required fields
      name: this.step1FormData.name.trim(),
      contact_person_name: this.step1FormData.contact_person_name.trim(),
      mobile_number: this.step1FormData.mobile_number.trim(),
      gst_no: this.step1FormData.gst_no.trim(),
      pan_no: this.step1FormData.pan_no.trim(),
      address: this.step1FormData.address.trim(),
      pin_code: this.step1FormData.pin_code.trim(),
      vehicle_3: Number(this.step2FormData.vehicle_3) || 0,
      vehicle_4: Number(this.step2FormData.vehicle_4) || 0,
      salesman_count: Number(this.step2FormData.salesman_count) || 0,
      area_id: Number(this.step2FormData.area_id),
      bank_details: this.step2FormData.bank_details,
      // Optional nullable fields
      email: this.step1FormData.email && this.step1FormData.email.trim() ? this.step1FormData.email.trim() : null,
      license_no: this.step1FormData.license_no && this.step1FormData.license_no.trim() ? this.step1FormData.license_no.trim() : null,
      map_link: this.step1FormData.map_link && this.step1FormData.map_link.trim() ? this.step1FormData.map_link.trim() : null,
      documents: this.step1FormData.documents && this.step1FormData.documents.files && this.step1FormData.documents.files.length > 0 ? this.step1FormData.documents : null,
      store_images: this.step1FormData.store_images && this.step1FormData.store_images.files && this.step1FormData.store_images.files.length > 0 ? this.step1FormData.store_images : null,
      // Optional fields with defaults
      for_general: this.step2FormData.for_general || false,
      for_modern: this.step2FormData.for_modern || false,
      for_horeca: this.step2FormData.for_horeca || false,
      route_ids: Array.isArray(this.step3FormData.route_ids) ? this.step3FormData.route_ids : []
    };

    const url = `${API_URL}/companies/${this.selectedCompanyId}/distributors`;
    const headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });

    this.http.post<any>(url, payload, { headers }).subscribe({
      next: (response) => {
        this.isSubmitting = false;
        this.submitSuccess = true;
        console.log('Distributor created successfully:', response);
        
        // Close modal after a short delay to show success message
        setTimeout(() => {
          this.closeAddModal();
          // Reload distributors list
          this.loadDistributors();
        }, 1500);
      },
      error: (error) => {
        this.isSubmitting = false;
        console.error('Error creating distributor:', error);
        
        if (error.error && error.error.message) {
          this.submitError = error.error.message;
        } else if (error.error && typeof error.error === 'object') {
          // Handle validation errors
          const errorMessages = Object.values(error.error).flat().join(', ');
          this.submitError = errorMessages || 'Failed to create distributor. Please check all required fields.';
        } else {
          this.submitError = 'Failed to create distributor. Please try again.';
        }
      }
    });
  }

  closeAddModal(): void {
    this.isAddModalOpen = false;
    this.currentStep = 1;
    // Keep selectedCompanyId as it's the logged-in company
    this.step1FormData = null;
    this.step2FormData = null;
    this.step3FormData = null;
    this.submitError = '';
    this.submitSuccess = false;
  }

  onPreviousStep(): void {
    if (this.currentStep > 1) {
      this.currentStep--;
    }
  }

  onFilter(): void {
    console.log('Apply filters:', {
      countryZone: this.selectedCountryZone,
      region: this.selectedRegion,
      area: this.selectedArea,
      superStockist: this.selectedSuperStockist
    });
    // Reset to first page when filters change
    this.currentPage = 1;
    this.loadDistributors();
  }

  onEdit(distributor: Distributor): void {
    console.log('Edit distributor:', distributor);
  }

  onDelete(distributor: Distributor): void {
    console.log('Delete distributor:', distributor);
  }

  onView(distributor: Distributor): void {
    console.log('View distributor:', distributor);
    this.router.navigate(['/admin/distributors', distributor.id, 'stock']);
  }

  onRowClick(distributor: Distributor): void {
    this.router.navigate(['/admin/distributors', distributor.id, 'stock']);
  }

  onSearch(event: Event) {
    const input = event.target as HTMLInputElement;
    console.log('Search:', input.value);
  }

  goToPage(page: number) {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.loadDistributors();
    }
  }

  previousPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.loadDistributors();
    }
  }

  nextPage() {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.loadDistributors();
    }
  }

  getStartEntry(): number {
    return this.totalCount === 0 ? 0 : (this.currentPage - 1) * this.limit + 1;
  }

  getEndEntry(): number {
    const end = this.currentPage * this.limit;
    return end > this.totalCount ? this.totalCount : end;
  }

  getPageNumbers(): number[] {
    return Array.from({ length: this.totalPages }, (_, i) => i + 1);
  }
}
