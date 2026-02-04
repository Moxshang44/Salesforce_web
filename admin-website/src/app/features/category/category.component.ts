import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { SidebarComponent } from '../../core/layout/sidebar/sidebar.component';
import { HeaderComponent } from '../../core/layout/header/header.component';
import { ButtonComponent } from '../../shared/components/button/button.component';
import { ModalComponent } from '../../shared/components/modal/modal.component';
import { ApiService } from '../../core/services/api.service';
import { AuthService } from '../../core/services/auth.service';
import { CategoryFormStep1Component } from './components/category-form-step1/category-form-step1.component';

interface Company {
  id: string;
  name: string;
}

interface Category {
  id: number;
  categoryName: string;
  categoryCode: string;
  productsCount: number;
  createdDate: string;
  createdAgo: string;
  isActive: boolean;
}

// Form data interfaces - will be defined in form components
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

@Component({
  selector: 'app-category',
  standalone: true,
  imports: [CommonModule, FormsModule, SidebarComponent, HeaderComponent, ButtonComponent, ModalComponent, CategoryFormStep1Component],
  templateUrl: './category.component.html',
  styleUrl: './category.component.scss'
})
export class CategoryComponent implements OnInit {
  currentPage = 1;
  totalPages = 2;
  isAddModalOpen = false;
  currentStep: number = 1; // Start directly at form step (no separate brand selection step)

  // Form data storage
  step1Data: CategoryFormStep1Data | null = null;

  // Company selection - using logged-in company
  selectedCompanyId: string = '';

  // Loading state
  isLoadingCategory = false;
  isLoadingCategories = false;
  categoriesError = '';

  // Categories data
  categories: Category[] = [];
  recordsPerPage = 20;
  totalCount = 0;

  // Edit category
  editingCategoryId: number | null = null;
  isEditMode = false;
  categoryDataForEdit: any = null;

  // View category
  isViewModalOpen = false;
  viewingCategory: any = null;
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
      this.selectedCompanyId = companyInfo.company_id;
      this.loadCategories();
    } else {
      console.error('No company information found. Please login again.');
      this.categoriesError = 'No company information found. Please login again.';
    }
  }

  loadCategories(page: number = 1): void {
    if (!this.selectedCompanyId) {
      this.categoriesError = 'Please select a company first.';
      return;
    }

    this.isLoadingCategories = true;
    this.categoriesError = '';
    const url = this.apiService.getApiUrl(`companies/${this.selectedCompanyId}/brand-categories`);
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
        this.isLoadingCategories = false;
        console.log('Categories API response:', response);
        
        // Handle response format
        let categoriesData: any[] = [];
        if (response.data && Array.isArray(response.data)) {
          categoriesData = response.data;
        } else if (Array.isArray(response)) {
          categoriesData = response;
        }

        // Map to Category interface
        this.categories = categoriesData.map((category: any) => {
          const createdAt = category.created_at ? new Date(category.created_at) : new Date();
          return {
            id: category.id,
            categoryName: category.name || 'N/A',
            categoryCode: category.code || 'N/A',
            productsCount: category.no_of_products || 0,
            createdDate: this.formatDate(createdAt),
            createdAgo: this.getTimeAgo(createdAt),
            isActive: category.is_active !== undefined ? category.is_active : true
          };
        });

        // Update pagination
        if (response.total_count !== undefined) {
          this.totalCount = response.total_count;
          this.totalPages = Math.ceil(this.totalCount / this.recordsPerPage);
        } else if (response.records_per_page && response.total_count) {
          this.totalCount = response.total_count;
          this.totalPages = Math.ceil(this.totalCount / response.records_per_page);
        } else {
          // Fallback: use categories length
          this.totalCount = this.categories.length;
          this.totalPages = Math.max(1, Math.ceil(this.totalCount / this.recordsPerPage));
        }

        this.currentPage = page;
      },
      error: (error) => {
        this.isLoadingCategories = false;
        console.error('Error loading categories:', error);
        
        if (error.error) {
          if (error.error.message) {
            this.categoriesError = error.error.message;
          } else if (error.error.detail) {
            this.categoriesError = error.error.detail;
          } else if (typeof error.error === 'string') {
            this.categoriesError = error.error;
          } else {
            this.categoriesError = 'Failed to load categories. Please try again.';
          }
        } else {
          this.categoriesError = `Failed to load categories. Status: ${error.status || 'Unknown'}.`;
        }
        
        this.categories = [];
      }
    });
  }

  formatDate(date: Date): string {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const day = date.getDate();
    const month = months[date.getMonth()];
    const year = date.getFullYear();
    return `${day} ${month} ${year}`;
  }

  getTimeAgo(date: Date): string {
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diffInSeconds < 60) {
      return 'just now';
    }
    
    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes < 60) {
      return `${diffInMinutes} ${diffInMinutes === 1 ? 'minute' : 'minutes'} ago`;
    }
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) {
      return `${diffInHours} ${diffInHours === 1 ? 'hour' : 'hours'} ago`;
    }
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 30) {
      return `${diffInDays} ${diffInDays === 1 ? 'day' : 'days'} ago`;
    }
    
    const diffInMonths = Math.floor(diffInDays / 30);
    if (diffInMonths < 12) {
      return `${diffInMonths} ${diffInMonths === 1 ? 'month' : 'months'} ago`;
    }
    
    const diffInYears = Math.floor(diffInMonths / 12);
    return `${diffInYears} ${diffInYears === 1 ? 'year' : 'years'} ago`;
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
    // Reset edit mode
    this.isEditMode = false;
    this.editingCategoryId = null;
    this.categoryDataForEdit = null;
    this.selectedCompanyId = companyInfo.company_id;
    this.currentStep = 1; // Start directly at form step (brand selection is now inside the form)
    this.isAddModalOpen = true;
  }

  closeAddModal(): void {
    this.isAddModalOpen = false;
    this.currentStep = 1;
    // Keep selectedCompanyId as it's the logged-in company
    // Reset form data
    this.step1Data = null;
    // Reset edit mode
    this.isEditMode = false;
    this.editingCategoryId = null;
    this.categoryDataForEdit = null;
  }

  getModalTitle(): string {
    const prefix = this.isEditMode ? 'Edit Category' : 'Add Category';
    switch (this.currentStep) {
      case 1:
        return `${prefix} — Category Details`;
      default:
        return prefix;
    }
  }

  onSaveStep1(formData: CategoryFormStep1Data): void {
    console.log('Save step 1:', formData);
    this.step1Data = formData;
    
    // Submit to API
    // Company ID is already set from logged-in user
    this.submitCategory();
  }

  submitCategory(): void {
    if (!this.step1Data) {
      alert('Please complete all required steps');
      return;
    }
    
    // Company ID is already set from logged-in user
    if (!this.selectedCompanyId) {
      alert('No company information found. Please login again.');
      return;
    }

    this.isLoadingCategory = true;

    // Build the request payload according to API structure
    const payload: any = {
      name: this.step1Data.name,
      code: this.step1Data.code,
      brand_id: this.step1Data.brand_id,
      for_general: this.step1Data.for_general,
      for_modern: this.step1Data.for_modern,
      for_horeca: this.step1Data.for_horeca
    };

    // Add optional fields
    if (this.step1Data.parent_category_id) {
      payload.parent_category_id = this.step1Data.parent_category_id;
    }
    if (this.step1Data.logo) {
      payload.logo = this.step1Data.logo;
    }

    // For PATCH (edit mode), include is_active and exclude area_id/margins per API spec
    // For POST (create mode), include area_id and margins
    if (this.isEditMode) {
      // Add is_active for PATCH requests
      if (this.categoryDataForEdit) {
        payload.is_active = this.categoryDataForEdit.is_active !== undefined 
          ? this.categoryDataForEdit.is_active 
          : true;
      }
    } else {
      // For POST (create mode), include area_id and margins
      if (this.step1Data.area_id && this.step1Data.area_id.length > 0) {
        payload.area_id = this.step1Data.area_id;
      }

      // Add margins data - filter out entries with null area_id or invalid margin values
      if (this.step1Data.margins && this.step1Data.margins.length > 0) {
        const validMargins = this.step1Data.margins
          .filter((margin: any) => margin.area_id !== null && margin.area_id !== undefined)
          .map((margin: any) => {
            const marginEntry: any = {
              area_id: margin.area_id,
              margins: {
                super_stockist: {
                  type: margin.margins.super_stockist.type || 'MARKUP',
                  value: margin.margins.super_stockist.value !== null && margin.margins.super_stockist.value !== undefined ? margin.margins.super_stockist.value : 0
                },
                distributor: {
                  type: margin.margins.distributor.type || 'MARKUP',
                  value: margin.margins.distributor.value !== null && margin.margins.distributor.value !== undefined ? margin.margins.distributor.value : 0
                },
                retailer: {
                  type: margin.margins.retailer.type || 'MARKUP',
                  value: margin.margins.retailer.value !== null && margin.margins.retailer.value !== undefined ? margin.margins.retailer.value : 0
                }
              }
            };
            return marginEntry;
          });
        
        if (validMargins.length > 0) {
          payload.margins = validMargins;
        }
      }
    }

    const url = this.isEditMode && this.editingCategoryId
      ? this.apiService.getApiUrl(`companies/${this.selectedCompanyId}/brand-categories/${this.editingCategoryId}`)
      : this.apiService.getApiUrl(`companies/${this.selectedCompanyId}/brand-categories`);
    const headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });

    console.log('Submitting category payload:', JSON.stringify(payload, null, 2));
    console.log('Is Edit Mode:', this.isEditMode);
    console.log('URL:', url);
    
    const httpMethod = this.isEditMode && this.editingCategoryId ? 'patch' : 'post';
    
    (this.http as any)[httpMethod](url, payload, { headers }).subscribe({
      next: (response: any) => {
        console.log(`Category ${this.isEditMode ? 'updated' : 'created'} successfully:`, response);
        alert(`Category ${this.isEditMode ? 'updated' : 'created'} successfully!`);
        this.isLoadingCategory = false;
        this.closeAddModal();
        // Reload categories list
        this.loadCategories(this.currentPage);
      },
      error: (error: any) => {
        console.error(`Error ${this.isEditMode ? 'updating' : 'creating'} category:`, error);
        console.error('Error details:', error.error);
        console.error('Error status:', error.status);
        
        let errorMessage = `Error ${this.isEditMode ? 'updating' : 'creating'} category. `;
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
        this.isLoadingCategory = false;
      }
    });
  }

  onPreviousStep(): void {
    if (this.currentStep > 1) {
      if (this.currentStep === 2) {
        // Going back from category details to brand selection
        this.currentStep = 1;
      }
    }
  }

  onFilter(): void {
    console.log('Filter clicked');
  }

  onEdit(category: Category): void {
    if (!category.id) {
      alert('Category ID is missing. Cannot edit category.');
      return;
    }

    this.editingCategoryId = category.id;
    this.isEditMode = true;
    
    // Use logged-in company ID
    const companyInfo = this.authService.getCompanyInfo();
    const companyId = companyInfo?.company_id || this.selectedCompanyId || '';
    
    if (!companyId) {
      alert('No company information found. Please login again.');
      return;
    }

    // Reset form data
    this.step1Data = null;
    this.currentStep = 1;
    this.isAddModalOpen = true;

    this.loadCategoryForEdit(category.id, companyId);
  }

  loadCategoryForEdit(categoryId: number, companyId: string): void {
    const url = this.apiService.getApiUrl(`companies/${companyId}/brand-categories/${categoryId}`);
    const headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });

    this.http.get<any>(url, { headers }).subscribe({
      next: (response) => {
        const categoryData = response.data || response;
        this.categoryDataForEdit = categoryData;
        this.selectedCompanyId = companyId;
        this.currentStep = 1;
        
        // Populate form data from API response
        this.populateFormDataFromCategory(categoryData);
      },
      error: (error) => {
        console.error('Error loading category for edit:', error);
        alert('Failed to load category details. Please try again.');
        this.isAddModalOpen = false;
        this.isEditMode = false;
        this.editingCategoryId = null;
      }
    });
  }

  populateFormDataFromCategory(categoryData: any): void {
    // Populate Step 1 data
    this.step1Data = {
      name: categoryData.name || '',
      code: categoryData.code || '',
      brand_id: categoryData.brand_id || null,
      parent_category_id: categoryData.parent_category_id || null,
      for_general: categoryData.for_general || false,
      for_modern: categoryData.for_modern || false,
      for_horeca: categoryData.for_horeca || false,
      logo: categoryData.logo || null,
      area_id: categoryData.area && categoryData.area.length > 0 
        ? categoryData.area.map((a: any) => a.id) 
        : null,
      margins: categoryData.margins && categoryData.margins.length > 0
        ? categoryData.margins.map((margin: any) => ({
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
          }))
        : []
    };
  }

  onDelete(category: Category): void {
    if (confirm(`Are you sure you want to delete category "${category.categoryName}"? This action cannot be undone.`)) {
      if (!category.id) {
        alert('Category ID is missing. Cannot delete.');
        return;
      }

      // Use logged-in company ID
      const companyInfo = this.authService.getCompanyInfo();
      const companyId = companyInfo?.company_id || this.selectedCompanyId || '';
      
      if (!companyId) {
        alert('No company information found. Please login again.');
        return;
      }

      this.deleteCategory(category, companyId);
    }
  }

  deleteCategory(category: Category, companyId: string): void {
    const deleteUrl = this.apiService.getApiUrl(`companies/${companyId}/brand-categories/${category.id}`);
    const headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });

    console.log('Deleting category:', category.categoryName);
    console.log('Delete URL:', deleteUrl);

    this.http.delete(deleteUrl, { headers }).subscribe({
      next: (response: any) => {
        console.log('Delete success response:', response);
        alert(`Category "${category.categoryName}" deleted successfully!`);
        // Reload categories list
        this.loadCategories(this.currentPage);
      },
      error: (error: any) => {
        console.error('Error deleting category:', error);
        console.error('Error status:', error.status);
        console.error('Error body:', error.error);
        
        let errorMessage = 'Failed to delete category. Please try again.';
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

  onView(category: Category): void {
    if (!category.id) {
      alert('Category ID is missing. Cannot view details.');
      return;
    }

    // Use logged-in company ID
    const companyInfo = this.authService.getCompanyInfo();
    const companyId = companyInfo?.company_id || this.selectedCompanyId || '';
    
    if (!companyId) {
      alert('No company information found. Please login again.');
      return;
    }

    this.viewingCategory = null;
    this.viewErrorMessage = '';
    this.isViewModalOpen = true;
    this.isLoadingView = true;

    this.loadCategoryForView(category.id, companyId);
  }

  loadCategoryForView(categoryId: number, companyId: string): void {
    const viewUrl = this.apiService.getApiUrl(`companies/${companyId}/brand-categories/${categoryId}`);
    const headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });

    console.log('Fetching category details:', categoryId);
    console.log('View URL:', viewUrl);

    this.http.get<any>(viewUrl, { headers }).subscribe({
      next: (response: any) => {
        console.log('View success response:', response);
        this.isLoadingView = false;
        // Handle different response formats
        if (response.data) {
          this.viewingCategory = response.data;
        } else {
          this.viewingCategory = response;
        }
      },
      error: (error: any) => {
        console.error('Error fetching category details:', error);
        console.error('Error status:', error.status);
        console.error('Error body:', error.error);
        
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
          this.viewErrorMessage = `Failed to load category details. Status: ${error.status || 'Unknown'}. Please check the console for more details.`;
        }
      }
    });
  }

  closeViewModal(): void {
    this.isViewModalOpen = false;
    this.viewingCategory = null;
    this.viewErrorMessage = '';
    this.isLoadingView = false;
  }

  toggleActive(category: Category): void {
    category.isActive = !category.isActive;
  }
}
