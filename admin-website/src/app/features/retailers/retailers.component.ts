import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { SidebarComponent } from '../../core/layout/sidebar/sidebar.component';
import { HeaderComponent } from '../../core/layout/header/header.component';
import { ButtonComponent } from '../../shared/components/button/button.component';
import { ModalComponent } from '../../shared/components/modal/modal.component';
import { RetailerFormStep1Component } from './components/retailer-form-step1/retailer-form-step1.component';
import { RetailerFormStep2Component } from './components/retailer-form-step2/retailer-form-step2.component';
import { ApiService } from '../../core/services/api.service';
import { AuthService } from '../../core/services/auth.service';
import { LogoLoaderComponent } from '../../shared/components/logo-loader/logo-loader.component';

interface Retailer {
  id: string;
  name: string;
  code: string;
  contact: string;
  route: string;
  address: string;
  isDisabled: boolean;
  contactPersonName?: string;
  mobileNumber?: string;
  routeId?: number;
  routeName?: string;
}

@Component({
  selector: 'app-retailers',
  standalone: true,
  imports: [CommonModule, FormsModule, SidebarComponent, HeaderComponent, ButtonComponent, ModalComponent, RetailerFormStep1Component, RetailerFormStep2Component, LogoLoaderComponent],
  templateUrl: './retailers.component.html',
  styleUrl: './retailers.component.scss'
})
export class RetailersComponent implements OnInit {
  currentPage = 1;
  totalPages = 1;
  totalCount = 0;
  recordsPerPage = 20;
  isAddModalOpen = false;
  currentStep = 1;
  pendingApprovalsCount = 5;
  isLoading = false;
  isLoadingRetailers = false;
  retailersError = '';

  // Filter options
  selectedCountryZone = '';
  selectedRegion = '';
  selectedArea = '';
  selectedDivision = '';

  countryZoneOptions = ['India - North', 'India - South', 'India - East', 'India - West', 'USA - East'];
  regionOptions = ['North Region', 'South Region', 'East Region', 'West Region', 'Central Region'];
  areaOptions = ['Area A', 'Area B', 'Area C', 'Area D', 'Area E'];
  divisionOptions = ['Division 1', 'Division 2', 'Division 3', 'Division 4'];

  retailers: Retailer[] = [];
  selectedCompanyId: string = '';
  
  // Store form data between steps
  step1Data: any = null;

  constructor(
    private http: HttpClient,
    private apiService: ApiService,
    private authService: AuthService
  ) {
    // Get logged-in company from AuthService
    const companyInfo = this.authService.getCompanyInfo();
    if (companyInfo && companyInfo.company_id) {
      this.selectedCompanyId = companyInfo.company_id;
    }
  }

  ngOnInit(): void {
    if (this.selectedCompanyId) {
      this.loadRetailers();
    }
  }

  onPendingApproval(): void {
    console.log('Pending Approval clicked');
  }

  onBulkUpload(): void {
    console.log('Bulk Upload clicked');
  }

  onExcel(): void {
    console.log('Excel clicked');
  }

  onAdd(): void {
    this.currentStep = 1;
    this.isAddModalOpen = true;
  }

  closeAddModal(): void {
    this.isAddModalOpen = false;
    this.currentStep = 1;
    this.step1Data = null;
  }

  getModalTitle(): string {
    switch (this.currentStep) {
      case 1:
        return 'Add Retailer — Step 1: Basic Retailer/Outlets Details';
      case 2:
        return 'Add Retailer — Step 2: Assign Route and Bank Details';
      default:
        return 'Add Retailer';
    }
  }

  onSaveStep1(formData: any): void {
    console.log('Save step 1:', formData);
    this.step1Data = formData;
    this.currentStep = 2;
  }

  onSaveStep2(formData: any): void {
    console.log('Save step 2:', formData);
    
    if (!this.step1Data) {
      alert('Step 1 data is missing. Please go back and complete step 1.');
      return;
    }

    if (!this.selectedCompanyId) {
      alert('Company information not found. Please login again.');
      return;
    }

    this.isLoading = true;

    // Combine step1 and step2 data and map to API payload
    const payload = this.buildRetailerPayload(this.step1Data, formData);

    const url = this.apiService.getApiUrl(`companies/${this.selectedCompanyId}/retailers`);
    const headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });

    console.log('Submitting retailer payload:', JSON.stringify(payload, null, 2));
    console.log('URL:', url);

    this.http.post(url, payload, { headers }).subscribe({
      next: (response: any) => {
        console.log('Retailer created successfully:', response);
        alert('Retailer created successfully!');
        this.isLoading = false;
        this.isAddModalOpen = false;
        this.currentStep = 1;
        this.step1Data = null;
        // Reload retailers list after successful creation
        this.loadRetailers();
      },
      error: (error: any) => {
        console.error('Error creating retailer:', error);
        console.error('Error details:', error.error);
        console.error('Error status:', error.status);
        
        let errorMessage = 'Error creating retailer. ';
        if (error.error) {
          if (error.error.message) {
            errorMessage += error.error.message;
          } else if (error.error.detail) {
            errorMessage += error.error.detail;
          } else if (typeof error.error === 'string') {
            errorMessage += error.error;
          } else if (error.error.errors && Array.isArray(error.error.errors)) {
            const errorDetails = error.error.errors.map((e: any) => e.message || e).join(', ');
            errorMessage += errorDetails;
          } else {
            errorMessage += JSON.stringify(error.error);
          }
        } else {
          errorMessage += 'Please check the console for details.';
        }
        
        alert(errorMessage);
        this.isLoading = false;
      }
    });
  }

  private buildRetailerPayload(step1Data: any, step2Data: any): any {
    // Map mobile number - combine country code and mobile number
    const mobileNumber = step1Data.countryCode && step1Data.mobileNumber 
      ? `${step1Data.countryCode.replace('+', '')}${step1Data.mobileNumber}`
      : step1Data.mobileNumber || '';

    // Map account type from step2
    const accountType = step2Data.accountType === 'Current Account' ? 'CURRENT' : 'SAVINGS';

    // Build documents array from uploaded files
    const documentFiles = (step1Data.uploadedDocuments || []).map((file: File) => ({
      id: '', // File ID should be obtained from file upload API first
      name: file.name,
      mime_type: file.type || 'application/octet-stream',
      extra_info: {}
    }));

    // Build store images array from uploaded files
    const storeImageFiles = (step1Data.storeImages || []).map((file: File) => ({
      id: '', // File ID should be obtained from file upload API first
      name: file.name,
      mime_type: file.type || 'image/jpeg',
      extra_info: {}
    }));

    // Extract route_id from step2 - now it's directly an ID
    const routeId = step2Data.selectedRouteId || 1;

    const payload: any = {
      name: step1Data.storeName || '',
      code: step1Data.retailerId || '',
      contact_person_name: step1Data.contactPersonName || '',
      mobile_number: mobileNumber,
      email: step1Data.email || null,
      gst_no: step1Data.gstNumber || '',
      pan_no: step1Data.panCardNumber || '',
      license_no: step1Data.licenseNumber || null,
      address: step1Data.fullAddress || '',
      category_id: 1, // Default category_id - should be selected from form
      pin_code: step1Data.pinCode || '',
      map_link: step1Data.mapLink || null,
      documents: documentFiles.length > 0 ? { files: documentFiles } : null,
      store_images: storeImageFiles.length > 0 ? { files: storeImageFiles } : null,
      route_id: routeId,
      bank_details: {
        account_number: step2Data.accountNo || '',
        account_name: step2Data.accountName || '',
        bank_name: step2Data.bankName || '',
        bank_branch: step2Data.bankBranch || '',
        account_type: accountType,
        ifsc_code: step2Data.ifscCode || ''
      },
      is_verified: false,
      is_type_a: step2Data.retailerType === 'A',
      is_type_b: step2Data.retailerType === 'B',
      is_type_c: step2Data.retailerType === 'C'
    };

    return payload;
  }

  onPreviousStep(): void {
    if (this.currentStep > 1) {
      this.currentStep--;
    }
  }

  onEdit(retailer: Retailer): void {
    console.log('Edit retailer:', retailer);
  }

  onDelete(retailer: Retailer): void {
    console.log('Delete retailer:', retailer);
  }

  onView(retailer: Retailer): void {
    console.log('View retailer:', retailer);
  }

  toggleDisable(retailer: Retailer): void {
    retailer.isDisabled = !retailer.isDisabled;
  }

  previousPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.loadRetailers();
    }
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.loadRetailers();
    }
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.loadRetailers();
    }
  }

  loadRetailers(): void {
    if (!this.selectedCompanyId) {
      console.warn('No company ID available. Cannot load retailers.');
      return;
    }

    this.isLoadingRetailers = true;
    this.retailersError = '';

    const url = this.apiService.getApiUrl(`companies/${this.selectedCompanyId}/retailers`);
    const headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });

    // Calculate offset based on current page
    const offset = (this.currentPage - 1) * this.recordsPerPage;

    // Build query parameters
    let params = new HttpParams()
      .set('limit', this.recordsPerPage.toString())
      .set('offset', offset.toString());

    // Add optional filters if they are set
    // Note: route_id, category_id, is_active filters can be added here when needed

    this.http.get<any>(url, { headers, params }).subscribe({
      next: (response: any) => {
        this.isLoadingRetailers = false;
        console.log('Retailers API response:', response);

        // Extract data from response
        let retailersData: any[] = [];
        if (response.data && Array.isArray(response.data)) {
          retailersData = response.data;
        } else if (Array.isArray(response)) {
          retailersData = response;
        }

        // Map API response to Retailer interface
        this.retailers = retailersData.map((retailer: any) => this.mapApiRetailerToRetailer(retailer));

        // Update pagination info
        if (response.total_count !== undefined) {
          this.totalCount = response.total_count;
          this.totalPages = Math.ceil(this.totalCount / this.recordsPerPage) || 1;
        } else if (response.records_per_page !== undefined) {
          this.recordsPerPage = response.records_per_page;
          this.totalCount = response.total_count || this.retailers.length;
          this.totalPages = Math.ceil(this.totalCount / this.recordsPerPage) || 1;
        } else {
          this.totalCount = this.retailers.length;
          this.totalPages = Math.ceil(this.totalCount / this.recordsPerPage) || 1;
        }
      },
      error: (error: any) => {
        this.isLoadingRetailers = false;
        console.error('Error loading retailers:', error);
        
        let errorMessage = 'Failed to load retailers. ';
        if (error.error) {
          if (error.error.message) {
            errorMessage += error.error.message;
          } else if (error.error.detail) {
            errorMessage += error.error.detail;
          } else if (typeof error.error === 'string') {
            errorMessage += error.error;
          } else {
            errorMessage += 'Please try again.';
          }
        } else {
          errorMessage += 'Please try again.';
        }
        
        this.retailersError = errorMessage;
        this.retailers = [];
      }
    });
  }

  private mapApiRetailerToRetailer(apiRetailer: any): Retailer {
    // Combine contact person name and mobile number for contact field
    const contactParts: string[] = [];
    if (apiRetailer.contact_person_name) {
      contactParts.push(apiRetailer.contact_person_name);
    }
    if (apiRetailer.mobile_number) {
      contactParts.push(apiRetailer.mobile_number);
    }
    const contact = contactParts.join(' - ') || 'N/A';

    return {
      id: apiRetailer.id || '',
      name: apiRetailer.name || 'N/A',
      code: apiRetailer.code || 'N/A',
      contact: contact,
      route: apiRetailer.route_name || 'N/A',
      address: apiRetailer.address || 'N/A',
      isDisabled: !apiRetailer.is_active, // Invert is_active to isDisabled
      contactPersonName: apiRetailer.contact_person_name,
      mobileNumber: apiRetailer.mobile_number,
      routeId: apiRetailer.route_id,
      routeName: apiRetailer.route_name
    };
  }

  onSearch(event: Event): void {
    const input = event.target as HTMLInputElement;
    console.log('Search:', input.value);
    // TODO: Implement search functionality with API
    // For now, reset to page 1 and reload
    this.currentPage = 1;
    this.loadRetailers();
  }

  onRowClick(retailer: Retailer): void {
    console.log('Row clicked:', retailer);
  }

  getContactName(contact: string): string {
    // If contact contains a phone number pattern, return the name part
    if (contact.includes('+91') || /^\d/.test(contact.trim())) {
      return '';
    }
    return contact;
  }

  getContactPhone(contact: string, address: string): string {
    // Check if contact is a phone number
    if (contact.includes('+91') || /^\d/.test(contact.trim())) {
      return contact;
    }
    // Check if address is a phone number
    if (address && (address.includes('+91') || /^\d/.test(address.trim()))) {
      return address;
    }
    return '';
  }

  isPhoneNumber(text: string): boolean {
    return text.includes('+91') || /^\d/.test(text.trim());
  }

  getStartEntry(): number {
    if (this.totalCount === 0) return 0;
    return (this.currentPage - 1) * this.recordsPerPage + 1;
  }

  getEndEntry(): number {
    return Math.min(this.currentPage * this.recordsPerPage, this.totalCount);
  }

  getPageNumbers(): number[] {
    const pages: number[] = [];
    const maxPagesToShow = 5; // Show max 5 page numbers
    let startPage = Math.max(1, this.currentPage - Math.floor(maxPagesToShow / 2));
    let endPage = Math.min(this.totalPages, startPage + maxPagesToShow - 1);
    
    // Adjust start page if we're near the end
    if (endPage - startPage < maxPagesToShow - 1) {
      startPage = Math.max(1, endPage - maxPagesToShow + 1);
    }
    
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    
    return pages;
  }
}
