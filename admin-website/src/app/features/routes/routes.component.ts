import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { SidebarComponent } from '../../core/layout/sidebar/sidebar.component';
import { HeaderComponent } from '../../core/layout/header/header.component';
import { ModalComponent } from '../../shared/components/modal/modal.component';
import { RouteFormStep1Component } from './components/route-form-step1/route-form-step1.component';
import { ButtonComponent } from '../../shared/components/button/button.component';
import { ApiService } from '../../core/services/api.service';
import { AuthService } from '../../core/services/auth.service';

interface Company {
  id: string;
  name: string;
}

interface RouteAPIResponse {
  id: number;
  name: string;
  code: string;
  area_id: number;
  division_name?: string;
  area_name?: string;
  region_name?: string;
  is_general: boolean;
  is_modern: boolean;
  is_horeca: boolean;
  retailer_count?: number;
  is_active: boolean;
  company_id?: string; // Added for tracking
}

interface Route {
  id: number;
  actions: string;
  active: boolean;
  routeName: string;
  routeCode: string;
  channel: string;
  area: string;
  region: string;
  countryZone: string;
  assignTo: string;
  company_id?: string; // Company ID if available
}

@Component({
  selector: 'app-routes',
  standalone: true,
  imports: [CommonModule, FormsModule, SidebarComponent, HeaderComponent, ModalComponent, RouteFormStep1Component, ButtonComponent],
  templateUrl: './routes.component.html',
  styleUrl: './routes.component.scss'
})
export class RoutesComponent implements OnInit {
  currentPage = 1;
  isAddModalOpen = false;
  isEditModalOpen = false;
  currentStep = 1; // Always start at step 1 (no company selection needed)
  isEditMode = false;
  editingRouteId: number | null = null;
  editingCompanyId: string = '';

  // Company selection - using logged-in company
  selectedCompanyId: string = '';
  selectedCompanyForRoutes: string = ''; // Company ID from logged-in user
  isDeleting = false;

  // Routes data
  routes: Route[] = [];
  isLoadingRoutes = false;
  routesError = '';
  recordsPerPage = 10;
  totalCount = 0;
  totalPages = 1;

  // View route
  isViewModalOpen = false;
  viewingRoute: any = null;
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
      this.selectedCompanyForRoutes = companyInfo.company_id;
      this.selectedCompanyId = companyInfo.company_id;
      this.loadRoutes(companyInfo.company_id);
        } else {
      console.error('No company information found. Please login again.');
      this.routesError = 'No company information found. Please login again.';
      }
  }

  loadRoutes(companyId: string, page: number = 1): void {
    if (!companyId) {
      this.routesError = 'Please select a company first.';
      return;
    }

    this.isLoadingRoutes = true;
    this.routesError = '';
    this.selectedCompanyForRoutes = companyId;
    const url = this.apiService.getApiUrl(`companies/${companyId}/routes`);
    const headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });

    // Add pagination query params if needed
    const params = new HttpParams().set('page', page.toString()).set('per_page', this.recordsPerPage.toString());

    this.http.get<any>(url, { headers, params }).subscribe({
      next: (response) => {
        this.isLoadingRoutes = false;
        console.log('Routes API response:', response);
        
        // Handle response format
        let routesData: RouteAPIResponse[] = [];
        if (response.data && Array.isArray(response.data)) {
          routesData = response.data;
          this.totalCount = response.total_count || 0;
          this.recordsPerPage = response.records_per_page || 10;
        } else if (Array.isArray(response)) {
          routesData = response;
        }

        // Map API response to Route interface for display
        this.routes = routesData.map((route: RouteAPIResponse) => {
          // Build channel string from flags
          const channels: string[] = [];
          if (route.is_general) channels.push('General Trade');
          if (route.is_modern) channels.push('Modern Trade');
          if (route.is_horeca) channels.push('Horeca Trade');
          const channelText = channels.length > 0 ? channels.join(', ') : 'No Channel';

          // Build country/zone text from area and region
          const countryZone = route.region_name 
            ? `${route.region_name}${route.area_name ? ' / ' + route.area_name : ''}`
            : 'N/A';

          return {
            id: route.id,
            actions: '',
            active: route.is_active,
            routeName: route.name || 'N/A',
            routeCode: route.code || 'N/A',
            channel: channelText,
            area: route.area_name || 'N/A',
            region: route.region_name || 'N/A',
            countryZone: countryZone,
            assignTo: route.retailer_count ? `${route.retailer_count} Retailers` : 'Not Assigned',
            company_id: companyId
          };
        });

        // Calculate total pages
        this.totalPages = Math.ceil(this.totalCount / this.recordsPerPage) || 1;
        this.currentPage = page;
      },
      error: (error) => {
        this.isLoadingRoutes = false;
        console.error('Error loading routes:', error);
        
        if (error.error) {
          if (error.error.message) {
            this.routesError = error.error.message;
          } else if (error.error.detail) {
            this.routesError = error.error.detail;
          } else if (typeof error.error === 'string') {
            this.routesError = error.error;
          } else {
            this.routesError = 'Failed to load routes. Please try again.';
          }
        } else {
          this.routesError = `Failed to load routes. Status: ${error.status || 'Unknown'}.`;
        }
        
        this.routes = [];
      }
    });
  }


  onAssignRoutes(): void {
    console.log('Assign Routes clicked');
    // Navigate to assign routes functionality or open modal
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
    this.selectedCompanyId = companyInfo.company_id;
    this.currentStep = 1; // Start directly at step 1 (no company selection)
    this.isAddModalOpen = true;
  }

  closeAddModal(): void {
    this.isAddModalOpen = false;
    this.currentStep = 1;
    // Keep selectedCompanyId as it's the logged-in company
  }

  closeEditModal(): void {
    this.isEditModalOpen = false;
    this.isEditMode = false;
    this.currentStep = 1;
    // Keep selectedCompanyId as it's the logged-in company
    this.editingRouteId = null;
    this.editingCompanyId = '';
    this.routeDataForEdit = null;
  }

  getModalTitle(): string {
    switch (this.currentStep) {
      case 1:
        return 'Add Route — Step 1: Basic Route Adding Info';
      case 2:
        return 'Add Route — Step 2: Additional Route Details';
      case 3:
        return 'Add Route — Step 3: Route Configuration';
      default:
        return 'Add Route';
    }
  }

  onSaveStep1(formData: any): void {
    // The API call (POST or PATCH) is already handled in the form component
    // This method is called after successful save
    if (this.isEditModalOpen) {
      this.closeEditModal();
      // Reload routes list
      if (this.selectedCompanyForRoutes) {
        this.loadRoutes(this.selectedCompanyForRoutes, this.currentPage);
      }
    } else if (this.isAddModalOpen) {
      this.closeAddModal();
      // Reload routes list
      if (this.selectedCompanyForRoutes) {
        this.loadRoutes(this.selectedCompanyForRoutes, this.currentPage);
      }
    }
  }

  onFilter(): void {
    console.log('Filter clicked');
  }

  onEdit(route: Route): void {
    this.editingRouteId = route.id;
    this.isEditMode = true;
    
    // Use logged-in company ID
    const companyInfo = this.authService.getCompanyInfo();
    const companyId = companyInfo?.company_id || route.company_id || '';
    
    if (companyId) {
      this.editingCompanyId = companyId;
      this.selectedCompanyId = companyId;
      this.currentStep = 1;
      this.loadRouteForEdit(route.id, companyId);
    } else {
      alert('No company information found. Please login again.');
    }
  }

  loadRouteForEdit(routeId: number, companyId: string): void {
    const url = this.apiService.getApiUrl(`companies/${companyId}/routes/${routeId}`);
    const headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });

    this.http.get<any>(url, { headers }).subscribe({
      next: (response) => {
        const routeData = response.data || response;
        this.editingCompanyId = companyId;
        this.selectedCompanyId = companyId;
        this.currentStep = 1; // Start at step 1 (no company selection)
        this.isEditModalOpen = true;
        this.routeDataForEdit = routeData;
      },
      error: (error) => {
        console.error('Error loading route for edit:', error);
        // Route not found with this company (no need to try other companies as we only have one logged-in company)
          alert('Failed to load route details. Please try again.');
      }
    });
  }

  routeDataForEdit: any = null;

  onDelete(route: Route): void {
    if (confirm(`Are you sure you want to delete route "${route.routeName}"? This action cannot be undone.`)) {
      if (!route.id) {
        alert('Route ID is missing. Cannot delete.');
        return;
      }

      // Use logged-in company ID
      const companyInfo = this.authService.getCompanyInfo();
      const companyId = companyInfo?.company_id || route.company_id || '';
      
      if (!companyId) {
        alert('No company information found. Please login again.');
        return;
      }

      this.deleteRoute(route, companyId, 0);
    }
  }

  deleteRoute(route: Route, companyId: string, companyIndex: number = 0): void {
    this.isDeleting = true;
    const deleteUrl = this.apiService.getApiUrl(`companies/${companyId}/routes/${route.id}`);

    console.log('Deleting route:', route.routeName);
    console.log('Delete URL:', deleteUrl);

    this.http.delete(deleteUrl).subscribe({
      next: (response: any) => {
        console.log('Delete success response:', response);
        this.isDeleting = false;
          alert(`Route "${route.routeName}" deleted successfully!`);
          // Reload routes list
          if (this.selectedCompanyForRoutes) {
            this.loadRoutes(this.selectedCompanyForRoutes, this.currentPage);
          }
      },
      error: (error: any) => {
        console.error('Error deleting route:', error);
        console.error('Error status:', error.status);
        console.error('Error body:', error.error);
        
        // If 404, route not found with this company
        // (No need to try other companies as we only have one logged-in company)
        
        this.isDeleting = false;
        let errorMessage = 'Failed to delete route. Please try again.';
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

  onView(route: Route): void {
    if (!route.id) {
      alert('Route ID is missing. Cannot view details.');
      return;
    }

    // Use logged-in company ID
    const companyInfo = this.authService.getCompanyInfo();
    const companyId = companyInfo?.company_id || route.company_id || '';
    
    if (!companyId) {
      alert('No company information found. Please login again.');
      return;
    }

    this.viewingRoute = null;
    this.viewErrorMessage = '';
    this.isViewModalOpen = true;
    this.isLoadingView = true;

    this.loadRouteForView(route.id, companyId, 0);
  }

  loadRouteForView(routeId: number, companyId: string, companyIndex: number = 0): void {
    const viewUrl = this.apiService.getApiUrl(`companies/${companyId}/routes/${routeId}`);
    const headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });

    console.log('Fetching route details:', routeId);
    console.log('View URL:', viewUrl);

    this.http.get<any>(viewUrl, { headers }).subscribe({
      next: (response: any) => {
        console.log('View success response:', response);
        this.isLoadingView = false;
        // Handle different response formats
        if (response.data) {
          this.viewingRoute = response.data;
        } else {
          this.viewingRoute = response;
        }
      },
      error: (error: any) => {
        console.error('Error fetching route details:', error);
        console.error('Error status:', error.status);
        console.error('Error body:', error.error);
        
        // If 404, route not found with this company
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
          this.viewErrorMessage = `Failed to load route details. Status: ${error.status || 'Unknown'}. Please check the console for more details.`;
        }
      }
    });
  }

  closeViewModal(): void {
    this.isViewModalOpen = false;
    this.viewingRoute = null;
    this.viewErrorMessage = '';
    this.isLoadingView = false;
  }


  toggleActive(route: Route): void {
    route.active = !route.active;
  }

  // Removed onCompanyChange - no longer needed as company is always the logged-in one

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages && page !== this.currentPage && this.selectedCompanyForRoutes) {
      this.loadRoutes(this.selectedCompanyForRoutes, page);
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

  retryLoadRoutes(): void {
    if (this.selectedCompanyForRoutes) {
      this.loadRoutes(this.selectedCompanyForRoutes, this.currentPage);
    }
  }
}
