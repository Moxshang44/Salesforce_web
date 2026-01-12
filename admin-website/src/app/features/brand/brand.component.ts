import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { SidebarComponent } from '../../core/layout/sidebar/sidebar.component';
import { HeaderComponent } from '../../core/layout/header/header.component';
import { ButtonComponent } from '../../shared/components/button/button.component';
import { ModalComponent } from '../../shared/components/modal/modal.component';
import { BrandFormStep1Component, BrandFormStep1Data } from './components/brand-form-step1/brand-form-step1.component';
import { BrandFormStep2Component, BrandFormStep2Data } from './components/brand-form-step2/brand-form-step2.component';
import { ApiService } from '../../core/services/api.service';
import { AuthService } from '../../core/services/auth.service';

const API_URL = 'http://ec2-13-203-193-170.ap-south-1.compute.amazonaws.com/api/v1';

interface Company {
  id: string;
  name: string;
}

interface BrandAPIResponse {
  id: number;
  name: string;
  code: string;
  no_of_categories: number;
  no_of_products: number;
  is_active: boolean;
  created_at: string;
}

interface Brand {
  id: number;
  brandName: string;
  brandCode: string;
  categoriesCount: number;
  productsCount: number;
  createdDate: string;
  createdAgo: string;
  description: string;
  isActive: boolean;
}

@Component({
  selector: 'app-brand',
  standalone: true,
  imports: [CommonModule, FormsModule, SidebarComponent, HeaderComponent, ButtonComponent, ModalComponent, BrandFormStep1Component, BrandFormStep2Component],
  templateUrl: './brand.component.html',
  styleUrl: './brand.component.scss'
})
export class BrandComponent implements OnInit {
  currentPage = 1;
  totalPages = 1;
  isAddModalOpen = false;
  isEditModalOpen = false;
  currentStep: number = 1; // Always start at step 1 (no company selection needed)
  isEditMode = false;
  editingBrandId: number | null = null;
  editingCompanyId: string = '';

  // Form data storage
  step1Data: BrandFormStep1Data | null = null;
  step2Data: BrandFormStep2Data | null = null;

  // Company selection - using logged-in company
  selectedCompanyId: string = '';
  selectedCompanyForBrands: string = ''; // Company ID from logged-in user
  isLoadingBrand = false;
  isLoadingBrands = false;
  brandsError = '';
  brandDataForEdit: any = null;

  // Brands data
  brands: Brand[] = [];
  recordsPerPage = 20;
  totalCount = 0;

  // View brand
  isViewModalOpen = false;
  viewingBrand: any = null;
  viewErrorMessage = '';
  isLoadingView = false;

  constructor(
    private http: HttpClient,
    private apiService: ApiService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    // Get logged-in company from AuthService
    const companyInfo = this.authService.getCompanyInfo();
    if (companyInfo && companyInfo.company_id) {
      this.selectedCompanyForBrands = companyInfo.company_id;
      this.selectedCompanyId = companyInfo.company_id;
      this.loadBrands(companyInfo.company_id);
        } else {
      console.error('No company information found. Please login again.');
      this.brandsError = 'No company information found. Please login again.';
      }
  }

  loadBrands(companyId: string, page: number = 1): void {
    if (!companyId) {
      this.brandsError = 'Please select a company first.';
      return;
    }

    this.isLoadingBrands = true;
    this.brandsError = '';
    this.selectedCompanyForBrands = companyId;
    const url = this.apiService.getApiUrl(`companies/${companyId}/brands`);
    const headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });

    // Calculate offset from page number
    const offset = (page - 1) * this.recordsPerPage;
    const params = new HttpParams()
      .set('limit', this.recordsPerPage.toString())
      .set('offset', offset.toString());

    this.http.get<any>(url, { headers, params }).subscribe({
      next: (response) => {
        this.isLoadingBrands = false;
        console.log('Brands API response:', response);
        
        // Handle response format
        let brandsData: BrandAPIResponse[] = [];
        if (response.data && Array.isArray(response.data)) {
          brandsData = response.data;
          this.totalCount = response.total_count || 0;
          this.recordsPerPage = response.records_per_page || 20;
        } else if (Array.isArray(response)) {
          brandsData = response;
        }

        // Map API response to Brand interface for display
        this.brands = brandsData.map((brand: BrandAPIResponse) => {
          // Format created_at date
          const createdDate = new Date(brand.created_at);
          const formattedDate = createdDate.toLocaleDateString('en-GB', {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
          });
          
          // Calculate time ago
          const now = new Date();
          const diffTime = Math.abs(now.getTime() - createdDate.getTime());
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
          let timeAgo = '';
          if (diffDays < 30) {
            timeAgo = `${diffDays} ${diffDays === 1 ? 'day' : 'days'}`;
          } else if (diffDays < 365) {
            const months = Math.floor(diffDays / 30);
            timeAgo = `${months} ${months === 1 ? 'month' : 'months'}`;
          } else {
            const years = Math.floor(diffDays / 365);
            timeAgo = `${years} ${years === 1 ? 'year' : 'years'}`;
          }

          return {
            id: brand.id,
            brandName: brand.name || 'N/A',
            brandCode: brand.code || 'N/A',
            categoriesCount: brand.no_of_categories || 0,
            productsCount: brand.no_of_products || 0,
            createdDate: formattedDate,
            createdAgo: timeAgo,
            description: '',
            isActive: brand.is_active
          };
        });

        // Calculate total pages
        this.totalPages = Math.ceil(this.totalCount / this.recordsPerPage) || 1;
        this.currentPage = page;
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

  // Removed onCompanyChange - no longer needed as company is always the logged-in one

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages && page !== this.currentPage && this.selectedCompanyForBrands) {
      this.loadBrands(this.selectedCompanyForBrands, page);
    }
  }

  getPageNumbers(): number[] {
    const pages: number[] = [];
    const maxVisible = 5;
    let start = Math.max(1, this.currentPage - Math.floor(maxVisible / 2));
    let end = Math.min(this.totalPages, start + maxVisible - 1);
    
    if (end - start < maxVisible - 1) {
      start = Math.max(1, end - maxVisible + 1);
    }
    
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    return pages;
  }

  getStartRecord(): number {
    if (this.totalCount === 0) return 0;
    return (this.currentPage - 1) * this.recordsPerPage + 1;
  }

  getEndRecord(): number {
    return Math.min(this.currentPage * this.recordsPerPage, this.totalCount);
  }

  retryLoadBrands(): void {
    if (this.selectedCompanyForBrands) {
      this.loadBrands(this.selectedCompanyForBrands, this.currentPage);
    }
  }

  onBulkUpload(): void {
    console.log('Bulk Upload clicked');
  }

  onExcel(): void {
    console.log('Excel clicked');
  }

  onAdd(): void {
    // Get logged-in company ID
    const companyInfo = this.authService.getCompanyInfo();
    if (!companyInfo || !companyInfo.company_id) {
      alert('No company information found. Please login again.');
      return;
    }
    // Reset form data
    this.step1Data = null;
    this.step2Data = null;
    this.selectedCompanyId = companyInfo.company_id;
    this.currentStep = 1; // Start directly at step 1 (no company selection)
    this.isAddModalOpen = true;
  }

  closeAddModal(): void {
    this.isAddModalOpen = false;
    this.currentStep = 0;
    this.selectedCompanyId = '';
    // Reset form data
    this.step1Data = null;
    this.step2Data = null;
  }

  closeEditModal(): void {
    this.isEditModalOpen = false;
    this.isEditMode = false;
    this.currentStep = 0;
    this.selectedCompanyId = '';
    this.editingBrandId = null;
    this.editingCompanyId = '';
    this.brandDataForEdit = null;
    // Reset form data
    this.step1Data = null;
    this.step2Data = null;
  }

  onCompanySelected(): void {
    if (this.selectedCompanyId) {
    this.currentStep = 1;
    }
  }

  getModalTitle(): string {
    switch (this.currentStep) {
      case 0:
        return 'Add Brand — Select Company';
      case 1:
        return 'Add Brand — Step 1: Basic Brand Information';
      case 2:
        return 'Add Brand — Step 2: Margins & Configuration';
      default:
        return 'Add Brand';
    }
  }

  onSaveStep1(formData: BrandFormStep1Data): void {
    console.log('Save step 1:', formData);
    this.step1Data = formData;
    
    if (this.isEditMode) {
      // In edit mode, submit after step 1 (PATCH doesn't support margins/area_id)
      this.submitBrand();
    } else {
      // In add mode, proceed to step 2
    this.currentStep = 2;
    }
  }

  onSaveStep2(formData: BrandFormStep2Data): void {
    console.log('Save step 2:', formData);
    this.step2Data = formData;
    
    // Combine all step data and submit to API (only for add mode)
    // Company ID is already set from logged-in user
    this.submitBrand();
  }

  submitBrand() {
    if (!this.step1Data) {
      alert('Please complete all required steps');
      return;
    }

    if (this.isEditMode) {
      // Edit mode - use PATCH
      if (!this.editingBrandId || !this.editingCompanyId) {
        alert('Missing brand ID or company ID for update');
        return;
      }

      this.isLoadingBrand = true;

      // PATCH payload - only includes fields that can be updated
      const payload: any = {};
      
      if (this.step1Data.name) {
        payload.name = this.step1Data.name;
      }
      if (this.step1Data.code) {
        payload.code = this.step1Data.code;
      }
      if (this.step1Data.for_general !== undefined) {
        payload.for_general = this.step1Data.for_general;
      }
      if (this.step1Data.for_modern !== undefined) {
        payload.for_modern = this.step1Data.for_modern;
      }
      if (this.step1Data.for_horeca !== undefined) {
        payload.for_horeca = this.step1Data.for_horeca;
      }
      if (this.step1Data.logo) {
        payload.logo = this.step1Data.logo;
      }
      if (this.step1Data.is_active !== undefined) {
        payload.is_active = this.step1Data.is_active;
      }
      // Note: area_id and margins are NOT included in PATCH (only in POST)

      const url = `${API_URL}/companies/${this.editingCompanyId}/brands/${this.editingBrandId}`;
      const headers = new HttpHeaders({
        'Content-Type': 'application/json'
      });

      console.log('Updating brand payload:', JSON.stringify(payload, null, 2));
      
      this.http.patch(url, payload, { headers }).subscribe({
        next: (response) => {
          console.log('Brand updated successfully:', response);
          alert('Brand updated successfully!');
          this.isLoadingBrand = false;
          this.closeEditModal();
          // Reload brands list
          if (this.selectedCompanyForBrands) {
            this.loadBrands(this.selectedCompanyForBrands, this.currentPage);
          }
        },
        error: (error) => {
          console.error('Error updating brand:', error);
          console.error('Error details:', error.error);
          console.error('Error status:', error.status);
          
          let errorMessage = 'Error updating brand. ';
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
          this.isLoadingBrand = false;
        }
      });
    } else {
      // Add mode - use POST
      // Company ID is already set from logged-in user
      if (!this.selectedCompanyId) {
        alert('No company information found. Please login again.');
        return;
      }

      this.isLoadingBrand = true;

      // Build the request payload according to API structure
      const payload: any = {
        name: this.step1Data.name,
        code: this.step1Data.code,
        for_general: this.step1Data.for_general,
        for_modern: this.step1Data.for_modern,
        for_horeca: this.step1Data.for_horeca
      };

      // Add optional fields from step 1
      if (this.step1Data.area_id && this.step1Data.area_id.length > 0) {
        payload.area_id = this.step1Data.area_id;
      }
      if (this.step1Data.logo) {
        payload.logo = this.step1Data.logo;
      }

      // Add step 2 data (margins)
      if (this.step2Data && this.step2Data.margins && this.step2Data.margins.length > 0) {
        payload.margins = this.step2Data.margins;
      }

      const url = `${API_URL}/companies/${this.selectedCompanyId}/brands`;
      const headers = new HttpHeaders({
        'Content-Type': 'application/json'
      });

      console.log('Submitting brand payload:', JSON.stringify(payload, null, 2));
      
      this.http.post(url, payload, { headers }).subscribe({
        next: (response) => {
          console.log('Brand created successfully:', response);
          alert('Brand created successfully!');
          this.isLoadingBrand = false;
          this.closeAddModal();
          // Reload brands list
          if (this.selectedCompanyForBrands) {
            this.loadBrands(this.selectedCompanyForBrands, this.currentPage);
          }
        },
        error: (error) => {
          console.error('Error creating brand:', error);
          console.error('Error details:', error.error);
          console.error('Error status:', error.status);
          
          let errorMessage = 'Error creating brand. ';
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
          this.isLoadingBrand = false;
        }
      });
    }
  }

  onPreviousStep(): void {
    if (this.currentStep > 1) {
      this.currentStep--;
    }
  }

  onFilter(): void {
    console.log('Filter clicked');
  }

  onEdit(brand: Brand): void {
    this.editingBrandId = brand.id;
    this.isEditMode = true;
    
    // Use logged-in company ID
    const companyInfo = this.authService.getCompanyInfo();
    const companyId = companyInfo?.company_id || this.selectedCompanyForBrands || '';
    
    if (companyId) {
      this.editingCompanyId = companyId;
      this.selectedCompanyId = companyId;
      this.currentStep = 1;
      this.loadBrandForEdit(brand.id, companyId);
    } else {
      alert('No company information found. Please login again.');
    }
  }

  loadBrandForEdit(brandId: number, companyId: string): void {
    const url = this.apiService.getApiUrl(`companies/${companyId}/brands/${brandId}`);
    const headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });

    this.http.get<any>(url, { headers }).subscribe({
      next: (response) => {
        const brandData = response.data || response;
        this.editingCompanyId = companyId;
        this.selectedCompanyId = companyId;
        this.currentStep = 1; // Start at step 1 (skip company selection in edit mode)
        this.isEditModalOpen = true;
        this.brandDataForEdit = brandData;
      },
      error: (error) => {
        console.error('Error loading brand for edit:', error);
        alert('Failed to load brand details. Please try again.');
      }
    });
  }

  onDelete(brand: Brand): void {
    if (confirm(`Are you sure you want to delete brand "${brand.brandName}"? This action cannot be undone.`)) {
      if (!brand.id) {
        alert('Brand ID is missing. Cannot delete.');
        return;
      }

      // Use logged-in company ID
      const companyInfo = this.authService.getCompanyInfo();
      const companyId = companyInfo?.company_id || this.selectedCompanyForBrands || '';
      
      if (!companyId) {
        alert('No company information found. Please login again.');
        return;
      }

      this.deleteBrand(brand, companyId, 0);
    }
  }

  deleteBrand(brand: Brand, companyId: string, companyIndex: number = 0): void {
    const deleteUrl = this.apiService.getApiUrl(`companies/${companyId}/brands/${brand.id}`);

    console.log('Deleting brand:', brand.brandName);
    console.log('Delete URL:', deleteUrl);

    this.http.delete(deleteUrl).subscribe({
      next: (response: any) => {
        console.log('Delete success response:', response);
        alert(`Brand "${brand.brandName}" deleted successfully!`);
        // Reload brands list
        if (this.selectedCompanyForBrands) {
          this.loadBrands(this.selectedCompanyForBrands, this.currentPage);
        }
      },
      error: (error: any) => {
        console.error('Error deleting brand:', error);
        console.error('Error status:', error.status);
        console.error('Error body:', error.error);
        
        // If 404, brand not found with this company
        // (No need to try other companies as we only have one logged-in company)
        
        let errorMessage = 'Failed to delete brand. Please try again.';
        if (error.error) {
          if (error.error.message) {
            errorMessage = error.error.message;
          } else if (error.error.detail) {
            errorMessage = error.error.detail;
          } else if (typeof error.error === 'string') {
            errorMessage = error.error;
          } else if (error.error.errors && Array.isArray(error.error.errors) && error.error.errors.length > 0) {
            errorMessage = error.error.errors[0].message || errorMessage;
          }
        } else if (error.message) {
          errorMessage = error.message;
        }
        
        alert(`Error: ${errorMessage}`);
      }
    });
  }

  onView(brand: Brand): void {
    if (!brand.id) {
      alert('Brand ID is missing. Cannot view details.');
      return;
    }

    // Use logged-in company ID
    const companyInfo = this.authService.getCompanyInfo();
    const companyId = companyInfo?.company_id || this.selectedCompanyForBrands || '';
    
    if (!companyId) {
      alert('No company information found. Please login again.');
      return;
    }

    this.viewingBrand = null;
    this.viewErrorMessage = '';
    this.isViewModalOpen = true;
    this.isLoadingView = true;

    this.loadBrandForView(brand.id, companyId, 0);
  }

  loadBrandForView(brandId: number, companyId: string, companyIndex: number = 0): void {
    const viewUrl = this.apiService.getApiUrl(`companies/${companyId}/brands/${brandId}`);
    const headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });

    console.log('Fetching brand details:', brandId);
    console.log('View URL:', viewUrl);

    this.http.get<any>(viewUrl, { headers }).subscribe({
      next: (response: any) => {
        console.log('View success response:', response);
        this.isLoadingView = false;
        // Handle different response formats
        if (response.data) {
          this.viewingBrand = response.data;
        } else {
          this.viewingBrand = response;
        }
      },
      error: (error: any) => {
        console.error('Error fetching brand details:', error);
        console.error('Error status:', error.status);
        console.error('Error body:', error.error);
        
        // If 404, brand not found with this company
        // (No need to try other companies as we only have one logged-in company)
        
        this.isLoadingView = false;
        if (error.error) {
          if (error.error.message) {
            this.viewErrorMessage = error.error.message;
          } else if (error.error.detail) {
            this.viewErrorMessage = error.error.detail;
          } else if (typeof error.error === 'string') {
            this.viewErrorMessage = error.error;
          } else {
            this.viewErrorMessage = JSON.stringify(error.error);
          }
        } else if (error.message) {
          this.viewErrorMessage = error.message;
        } else {
          this.viewErrorMessage = `Failed to load brand details. Status: ${error.status || 'Unknown'}. Please check the console for more details.`;
        }
      }
    });
  }

  closeViewModal(): void {
    this.isViewModalOpen = false;
    this.viewingBrand = null;
    this.viewErrorMessage = '';
    this.isLoadingView = false;
  }

  toggleActive(brand: Brand): void {
    brand.isActive = !brand.isActive;
  }
}
