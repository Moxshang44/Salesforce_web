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

const API_URL = 'http://ec2-13-203-193-170.ap-south-1.compute.amazonaws.com/api/v1';

interface Distributor {
  id: number;
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
  totalPages = 2;
  isAddModalOpen = false;
  currentStep = 1;

  // Company selection
  companies: Company[] = [];
  selectedCompanyId: string = '';
  isLoadingCompanies = false;
  companyError = '';

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
    private http: HttpClient
  ) {}

  ngOnInit(): void {
    this.loadCompanies();
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

  distributors: Distributor[] = [
    {
      id: 1,
      name: 'Shree Balaji Distributors',
      distributorId: '#DST-10234',
      contactName: 'Rahul Mehta',
      contactPhone: '+91 98765 43210',
      areaAddress: 'Ahmedabad West CG Road, Navrangpura',
      routesCover: '42 Routes Urban & Semi-'
    },
    {
      id: 2,
      name: 'Patel Pharma Agency',
      distributorId: '#DST-10235',
      contactName: 'Amit Patel',
      contactPhone: '+91 98250 12345',
      areaAddress: 'Surat Central Ring Road',
      routesCover: '35 Routes Urban'
    },
    {
      id: 3,
      name: 'Om Sai Distributors',
      distributorId: '#DST-10236',
      contactName: 'Suresh Verma',
      contactPhone: '+91 97654 88990',
      areaAddress: 'Indore East Vijay Nagar',
      routesCover: '28 Routes Urban'
    },
    {
      id: 4,
      name: 'Krishna Medical Store',
      distributorId: '#DST-10237',
      contactName: 'Vikas Sharma',
      contactPhone: '+91 98111 22334',
      areaAddress: 'Delhi NCR Laxmi Nagar',
      routesCover: '50 Routes Urban & Rural'
    },
    {
      id: 5,
      name: 'Shivam Healthcare',
      distributorId: '#DST-10238',
      contactName: 'Neeraj Singh',
      contactPhone: '+91 99009 11223',
      areaAddress: 'Bangalore North Yelahanka',
      routesCover: '31 Routes Urban'
    },
    {
      id: 6,
      name: 'Laxmi Pharma',
      distributorId: '#DST-10239',
      contactName: 'Ramesh Gupta',
      contactPhone: '+91 98876 66443',
      areaAddress: 'Jaipur South Tonk Road',
      routesCover: '26 Routes Semi-Urban'
    },
    {
      id: 7,
      name: 'Universal Distributors',
      distributorId: '#DST-10240',
      contactName: 'Ankit Joshi',
      contactPhone: '+91 90123 77889',
      areaAddress: 'Pune Urban Hinjewadi',
      routesCover: '40 Routes Urban'
    },
    {
      id: 8,
      name: 'Green Cross Pharma',
      distributorId: '#DST-10241',
      contactName: 'Deepak Nair',
      contactPhone: '+91 94477 66554',
      areaAddress: 'Kochi Central MG Road',
      routesCover: '22 Routes Urban'
    },
    {
      id: 9,
      name: 'HealthFirst Distributors',
      distributorId: '#DST-10242',
      contactName: 'Manoj Kulkarni',
      contactPhone: '+91 98901 33445',
      areaAddress: 'Nagpur West Dharampeth',
      routesCover: '34 Routes Urban & Rural'
    }
  ];

  onBulkUpload(): void {
    console.log('Bulk Upload clicked');
  }

  onExcel(): void {
    console.log('Excel clicked');
  }

  loadCompanies(): void {
    this.isLoadingCompanies = true;
    this.companyError = '';
    const url = `${API_URL}/companies`;

    this.http.get<any>(url).subscribe({
      next: (response) => {
        this.isLoadingCompanies = false;
        // Handle different response formats
        if (Array.isArray(response)) {
          this.companies = response.map((item: any) => ({
            id: item.id || item.company_id || '',
            name: item.name || ''
          })).filter((c: Company) => c.id && c.name);
        } else if (response.data && Array.isArray(response.data)) {
          this.companies = response.data.map((item: any) => ({
            id: item.id || item.company_id || '',
            name: item.name || ''
          })).filter((c: Company) => c.id && c.name);
        } else if (response.companies && Array.isArray(response.companies)) {
          this.companies = response.companies.map((item: any) => ({
            id: item.id || item.company_id || '',
            name: item.name || ''
          })).filter((c: Company) => c.id && c.name);
        }
        
        if (this.companies.length === 0) {
          this.companyError = 'No companies found. Please create a company first.';
        }
      },
      error: (error) => {
        this.isLoadingCompanies = false;
        console.error('Error loading companies:', error);
        this.companyError = 'Failed to load companies. Please try again.';
      }
    });
  }

  getModalTitle(): string {
    switch (this.currentStep) {
      case 0:
        return 'Add Distributor — Select Company';
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
    if (this.companies.length === 0) {
      alert('Please ensure at least one company exists before adding a distributor.');
      this.loadCompanies();
      return;
    }
    this.selectedCompanyId = '';
    this.step1FormData = null;
    this.step2FormData = null;
    this.step3FormData = null;
    this.submitError = '';
    this.submitSuccess = false;
    this.currentStep = 0; // Start with company selection
    this.isAddModalOpen = true;
  }

  onSaveStep1(formData: any): void {
    if (!this.selectedCompanyId) {
      alert('Please select a company first.');
      return;
    }
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
    if (!this.selectedCompanyId) {
      this.submitError = 'Please select a company.';
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
          // Reload distributors list if needed
          // this.loadDistributors();
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
    this.currentStep = 0;
    this.selectedCompanyId = '';
    this.step1FormData = null;
    this.step2FormData = null;
    this.step3FormData = null;
    this.submitError = '';
    this.submitSuccess = false;
  }

  onPreviousStep(): void {
    if (this.currentStep > 0) {
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
    this.currentPage = page;
  }

  previousPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
    }
  }

  nextPage() {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
    }
  }
}
