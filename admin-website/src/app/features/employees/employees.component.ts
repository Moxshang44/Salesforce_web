import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { SidebarComponent } from '../../core/layout/sidebar/sidebar.component';
import { HeaderComponent } from '../../core/layout/header/header.component';
import { ButtonComponent } from '../../shared/components/button/button.component';
import { ModalComponent } from '../../shared/components/modal/modal.component';
import { EmployeeFormStep1Component, EmployeeFormData } from './components/employee-form-step1/employee-form-step1.component';
import { LogoLoaderComponent } from '../../shared/components/logo-loader/logo-loader.component';
import { ApiService } from '../../core/services/api.service';
import { AuthService } from '../../core/services/auth.service';
import { forkJoin } from 'rxjs';

interface Employee {
  id: string;
  name: string;
  username?: string;
  code?: string;
  role?: string;
  reportingTo?: string;
  assignedArea?: string;
  area_name?: string;
  routesCount?: number;
  isActive: boolean;
  is_active?: boolean;
  contact_no?: string;
  company_id?: string;
  area_id?: number;
}

interface RouteAssignment {
  id: number;
  route_id: number;
  route_name: string;
  route_code: string;
  user_id: string;
  user_name: string;
  from_date: string;
  to_date: string;
  day: number;
  is_active: boolean;
}

@Component({
  selector: 'app-employees',
  standalone: true,
  imports: [CommonModule, SidebarComponent, HeaderComponent, ButtonComponent, ModalComponent, EmployeeFormStep1Component, LogoLoaderComponent],
  templateUrl: './employees.component.html',
  styleUrl: './employees.component.scss'
})
export class EmployeesComponent implements OnInit {
  currentPage = 1;
  totalPages = 1;
  recordsPerPage = 20;
  totalCount = 0;
  isAddModalOpen = false;
  currentStep = 1;
  selectedCompanyId: string = '';
  isLoadingEmployee = false;
  isLoadingEmployees = false;
  employeesError = '';

  // View employee
  isViewModalOpen = false;
  viewingEmployee: any = null;
  viewErrorMessage = '';
  isLoadingView = false;

  // Edit employee
  editingEmployeeId: string | null = null;
  isEditMode = false;
  employeeDataForEdit: any = null;

  employees: Employee[] = [];
  routeAssignments: RouteAssignment[] = [];

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
      this.loadEmployees();
    } else {
      console.error('No company information found. Please login again.');
      this.employeesError = 'No company information found. Please login again.';
    }
  }

  loadEmployees(page: number = 1): void {
    if (!this.selectedCompanyId) {
      this.employeesError = 'No company information found. Please login again.';
      return;
    }

    this.isLoadingEmployees = true;
    this.employeesError = '';
    this.currentPage = page;

    const employeesUrl = this.apiService.getApiUrl(`users/companies/${this.selectedCompanyId}/users`);
    const routeAssignmentsUrl = this.apiService.getApiUrl(`companies/${this.selectedCompanyId}/route-assignments`);
    const headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });

    const offset = (page - 1) * this.recordsPerPage;
    const employeesParams = new HttpParams()
      .set('is_active', 'true')
      .set('limit', this.recordsPerPage.toString())
      .set('offset', offset.toString());

    // Fetch both employees and route assignments in parallel
    forkJoin({
      employees: this.http.get<any>(employeesUrl, { headers, params: employeesParams }),
      routeAssignments: this.http.get<any>(routeAssignmentsUrl, { headers })
    }).subscribe({
      next: (responses: any) => {
        this.isLoadingEmployees = false;
        console.log('Employees loaded:', responses.employees);
        console.log('Route assignments loaded:', responses.routeAssignments);

        // Process route assignments first
        this.processRouteAssignments(responses.routeAssignments);

        // Handle different response formats for employees
        const employeesResponse = responses.employees;
        if (employeesResponse.data && Array.isArray(employeesResponse.data)) {
          this.employees = employeesResponse.data.map((emp: any) => this.mapApiEmployeeToEmployee(emp));
        } else if (Array.isArray(employeesResponse)) {
          this.employees = employeesResponse.map((emp: any) => this.mapApiEmployeeToEmployee(emp));
        } else {
          this.employees = [];
        }

        // Update pagination info
        if (employeesResponse.total_count !== undefined) {
          this.totalCount = employeesResponse.total_count;
          this.totalPages = Math.ceil(this.totalCount / this.recordsPerPage);
        } else if (employeesResponse.records_per_page !== undefined) {
          this.recordsPerPage = employeesResponse.records_per_page;
          this.totalCount = employeesResponse.total_count || this.employees.length;
          this.totalPages = Math.ceil(this.totalCount / this.recordsPerPage);
        } else {
          this.totalCount = this.employees.length;
          this.totalPages = Math.ceil(this.totalCount / this.recordsPerPage) || 1;
        }
      },
      error: (error: any) => {
        this.isLoadingEmployees = false;
        console.error('Error loading data:', error);
        
        if (error.error) {
          if (error.error.message) {
            this.employeesError = error.error.message;
          } else if (error.error.detail) {
            this.employeesError = error.error.detail;
          } else {
            this.employeesError = 'Failed to load employees. Please try again.';
          }
        } else {
          this.employeesError = 'Failed to load employees. Please try again.';
        }
        this.employees = [];
      }
    });
  }

  processRouteAssignments(response: any): void {
    if (response.data && Array.isArray(response.data)) {
      this.routeAssignments = response.data;
    } else if (Array.isArray(response)) {
      this.routeAssignments = response;
    } else {
      this.routeAssignments = [];
    }
    console.log('Processed route assignments:', this.routeAssignments);
  }

  getRouteCountForUser(userId: string): number {
    return this.routeAssignments.filter(ra => ra.user_id === userId && ra.is_active).length;
  }

  mapApiEmployeeToEmployee(apiEmployee: any): Employee {
    const employeeId = apiEmployee.id || '';
    return {
      id: employeeId,
      name: apiEmployee.name || 'N/A',
      username: apiEmployee.username,
      code: apiEmployee.code || `#EMP${apiEmployee.id?.substring(0, 8) || 'N/A'}`,
      role: apiEmployee.role || 'N/A',
      reportingTo: apiEmployee.reporting_to || '-',
      assignedArea: apiEmployee.area_name || 'N/A',
      area_name: apiEmployee.area_name,
      routesCount: this.getRouteCountForUser(employeeId),
      isActive: apiEmployee.is_active !== undefined ? apiEmployee.is_active : true,
      is_active: apiEmployee.is_active,
      contact_no: apiEmployee.contact_no,
      company_id: apiEmployee.company_id,
      area_id: apiEmployee.area_id
    };
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages && page !== this.currentPage) {
      this.loadEmployees(page);
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
    // Reset edit mode
    this.isEditMode = false;
    this.editingEmployeeId = null;
    this.employeeDataForEdit = null;
    this.selectedCompanyId = companyInfo.company_id;
    this.currentStep = 1;
    this.isAddModalOpen = true;
  }

  closeAddModal(): void {
    this.isAddModalOpen = false;
    this.currentStep = 1;
    // Reset edit mode
    this.isEditMode = false;
    this.editingEmployeeId = null;
    this.employeeDataForEdit = null;
  }

  getModalTitle(): string {
    const prefix = this.isEditMode ? 'Edit Employee' : 'Add Employee';
    switch (this.currentStep) {
      case 1:
        return `${prefix} — Step 1: Basic Employee Details`;
      case 2:
        return `${prefix} — Step 2: Additional Details`;
      default:
        return prefix;
    }
  }

  onSaveStep1(formData: EmployeeFormData): void {
    console.log('Save step 1:', formData);
    
    if (!this.selectedCompanyId) {
      alert('No company information found. Please login again.');
      return;
    }

    this.isLoadingEmployee = true;

    // Build the request payload according to API structure
    const payload: any = {
      name: formData.name,
      contact_no: formData.contact_no,
      company_id: this.selectedCompanyId
    };

    // For POST (create mode), include is_super_admin
    // For PATCH (edit mode), exclude is_super_admin per API spec
    if (!this.isEditMode) {
      payload.is_super_admin = false;
    }

    // Add optional fields
    if (formData.username) {
      payload.username = formData.username;
    }
    if (formData.role) {
      payload.role = formData.role;
    }
    if (formData.area_id) {
      payload.area_id = formData.area_id;
    }
    if (formData.bank_details && this.hasBankDetails(formData.bank_details)) {
      payload.bank_details = {
        account_number: formData.bank_details.account_number || '',
        account_name: formData.bank_details.account_name || '',
        bank_name: formData.bank_details.bank_name || '',
        bank_branch: formData.bank_details.bank_branch || '',
        account_type: formData.bank_details.account_type || 'SAVINGS',
        ifsc_code: formData.bank_details.ifsc_code || ''
      };
    }

    const url = this.isEditMode && this.editingEmployeeId
      ? this.apiService.getApiUrl(`users/companies/${this.selectedCompanyId}/users/${this.editingEmployeeId}`)
      : this.apiService.getApiUrl('users');
    const headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });

    console.log('Submitting user payload:', JSON.stringify(payload, null, 2));
    console.log('Is Edit Mode:', this.isEditMode);
    console.log('URL:', url);
    
    const httpMethod = this.isEditMode && this.editingEmployeeId ? 'patch' : 'post';
    
    (this.http as any)[httpMethod](url, payload, { headers }).subscribe({
      next: (response: any) => {
        console.log(`Employee ${this.isEditMode ? 'updated' : 'created'} successfully:`, response);
        alert(`Employee ${this.isEditMode ? 'updated' : 'created'} successfully!`);
        this.isLoadingEmployee = false;
        this.closeAddModal();
        // Reload employees list
        this.loadEmployees(this.currentPage);
      },
      error: (error: any) => {
        console.error(`Error ${this.isEditMode ? 'updating' : 'creating'} user:`, error);
        console.error('Error details:', error.error);
        console.error('Error status:', error.status);
        
        let errorMessage = `Error ${this.isEditMode ? 'updating' : 'creating'} employee. `;
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
        this.isLoadingEmployee = false;
      }
    });
  }

  hasBankDetails(bankDetails: any): boolean {
    return !!(
      bankDetails.account_number ||
      bankDetails.account_name ||
      bankDetails.bank_name ||
      bankDetails.bank_branch ||
      bankDetails.ifsc_code
    );
  }

  onFilter(): void {
    console.log('Filter clicked');
  }

  onEdit(employee: Employee): void {
    if (!employee.id) {
      alert('Employee ID is missing. Cannot edit employee.');
      return;
    }

    this.editingEmployeeId = employee.id;
    this.isEditMode = true;
    
    // Use logged-in company ID
    const companyInfo = this.authService.getCompanyInfo();
    const companyId = companyInfo?.company_id || this.selectedCompanyId || employee.company_id || '';
    
    if (!companyId) {
      alert('No company information found. Please login again.');
      return;
    }

    // Reset form data
    this.currentStep = 1;
    this.isAddModalOpen = true;

    this.loadEmployeeForEdit(employee.id, companyId);
  }

  loadEmployeeForEdit(userId: string, companyId: string): void {
    const url = this.apiService.getApiUrl(`users/${userId}`);
    const headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });

    this.http.get<any>(url, { headers }).subscribe({
      next: (response) => {
        const employeeData = response.data || response;
        this.employeeDataForEdit = employeeData;
        this.selectedCompanyId = companyId;
        this.currentStep = 1;
        
        // Populate form data from API response
        this.populateFormDataFromEmployee(employeeData);
      },
      error: (error) => {
        console.error('Error loading employee for edit:', error);
        alert('Failed to load employee details. Please try again.');
        this.isAddModalOpen = false;
        this.isEditMode = false;
        this.editingEmployeeId = null;
      }
    });
  }

  populateFormDataFromEmployee(employeeData: any): void {
    // The form component will handle populating the form
    // We just need to pass the data to it
  }

  onDelete(employee: Employee): void {
    if (confirm(`Are you sure you want to delete employee "${employee.name}"? This action cannot be undone.`)) {
      if (!employee.id) {
        alert('Employee ID is missing. Cannot delete.');
        return;
      }

      // Employee ID is already a string/UUID
      const userId = employee.id;

      this.deleteEmployee(employee, userId);
    }
  }

  deleteEmployee(employee: Employee, userId: string): void {
    const deleteUrl = this.apiService.getApiUrl(`users/${userId}`);
    const headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });

    console.log('Deleting employee:', employee.name);
    console.log('Delete URL:', deleteUrl);

    this.http.delete(deleteUrl, { headers }).subscribe({
      next: (response: any) => {
        console.log('Delete success response:', response);
        alert(`Employee "${employee.name}" deleted successfully!`);
        // Reload employees list
        this.loadEmployees(this.currentPage);
      },
      error: (error: any) => {
        console.error('Error deleting employee:', error);
        console.error('Error status:', error.status);
        console.error('Error body:', error.error);
        
        let errorMessage = 'Failed to delete employee. Please try again.';
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

  onInfo(employee: Employee): void {
    // Use onView for consistency, or keep onInfo and call onView
    this.onView(employee);
  }

  onView(employee: Employee): void {
    if (!employee.id) {
      alert('Employee ID is missing. Cannot view details.');
      return;
    }

    // Employee ID is already a string/UUID
    const userId = employee.id;

    this.viewingEmployee = null;
    this.viewErrorMessage = '';
    this.isViewModalOpen = true;
    this.isLoadingView = true;

    this.loadEmployeeForView(userId);
  }

  loadEmployeeForView(userId: string): void {
    const viewUrl = this.apiService.getApiUrl(`users/${userId}`);
    const headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });

    console.log('Fetching employee details:', userId);
    console.log('View URL:', viewUrl);

    this.http.get<any>(viewUrl, { headers }).subscribe({
      next: (response: any) => {
        console.log('View success response:', response);
        this.isLoadingView = false;
        // Handle different response formats
        if (response.data) {
          this.viewingEmployee = response.data;
        } else {
          this.viewingEmployee = response;
        }
      },
      error: (error: any) => {
        console.error('Error fetching employee details:', error);
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
          this.viewErrorMessage = `Failed to load employee details. Status: ${error.status || 'Unknown'}. Please check the console for more details.`;
        }
      }
    });
  }

  closeViewModal(): void {
    this.isViewModalOpen = false;
    this.viewingEmployee = null;
    this.viewErrorMessage = '';
    this.isLoadingView = false;
  }

  toggleActive(employee: Employee): void {
    employee.isActive = !employee.isActive;
    employee.is_active = employee.isActive;
    // TODO: Implement API call to update is_active status
    // For now, just update the local state
  }

  getPageNumbers(): number[] {
    const pages: number[] = [];
    const maxPagesToShow = 5;
    let startPage = Math.max(1, this.currentPage - Math.floor(maxPagesToShow / 2));
    let endPage = Math.min(this.totalPages, startPage + maxPagesToShow - 1);
    
    if (endPage - startPage < maxPagesToShow - 1) {
      startPage = Math.max(1, endPage - maxPagesToShow + 1);
    }
    
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    
    return pages;
  }

  Math = Math; // Make Math available in template
}
