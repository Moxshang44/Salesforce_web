import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { InputComponent } from '../../../shared/components/input/input.component';
import { CardComponent } from '../../../shared/components/card/card.component';
import { ModalComponent } from '../../../shared/components/modal/modal.component';
import { SuperAdminSidebarComponent } from '../components/super-admin-sidebar/super-admin-sidebar.component';
import { HeaderComponent } from '../../../core/layout/header/header.component';

interface Company {
  id?: string;
  name: string;
  is_active?: boolean;
  gst_no?: string;
  cin_no?: string;
  address?: string;
}

interface AssignAdminForm {
  username: string;
  name: string;
  contact_no: string;
  company_id: string;
  role: string;
  area_id: number;
  bank_details: {
    account_number: string;
    account_name: string;
    bank_name: string;
    bank_branch: string;
    account_type: string;
    ifsc_code: string;
  };
  is_super_admin: boolean;
}

@Component({
  selector: 'app-companies',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ButtonComponent,
    InputComponent,
    CardComponent,
    ModalComponent,
    SuperAdminSidebarComponent,
    HeaderComponent
  ],
  templateUrl: './companies.component.html',
  styleUrl: './companies.component.scss'
})
export class CompaniesComponent implements OnInit {
  companies: Company[] = [];
  isAddModalOpen = false;
  isEditModalOpen = false;
  isViewModalOpen = false;
  isAssignModalOpen = false;
  isSubmitting = false;
  isEditing = false;
  isAssigning = false;
  isDeleting = false;
  isLoading = false;
  isLoadingView = false;
  isLoadingEdit = false;
  errorMessage = '';
  successMessage = '';
  listErrorMessage = '';
  editErrorMessage = '';
  editSuccessMessage = '';
  viewErrorMessage = '';
  assignErrorMessage = '';
  assignSuccessMessage = '';
  selectedCompany: Company | null = null;
  editingCompany: Company | null = null;
  viewingCompany: Company | null = null;

  companyForm: Company = {
    name: '',
    gst_no: '',
    cin_no: '',
    address: ''
  };

  assignAdminForm: AssignAdminForm = {
    username: '',
    name: '',
    contact_no: '',
    company_id: '',
    role: '',
    area_id: 1,
    bank_details: {
      account_number: '',
      account_name: '',
      bank_name: '',
      bank_branch: '',
      account_type: 'SAVINGS',
      ifsc_code: ''
    },
    is_super_admin: false
  };

  formErrors: { [key: string]: string } = {};
  assignFormErrors: { [key: string]: string } = {};

  private readonly API_URL = 'http://ec2-13-203-193-170.ap-south-1.compute.amazonaws.com/api/v1/companies';
  private readonly USERS_API_URL = 'http://ec2-13-203-193-170.ap-south-1.compute.amazonaws.com/api/v1/users';

  constructor(
    private http: HttpClient,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Check if user is authenticated as super admin
    if (!this.authService.isSuperAdminAuthenticated()) {
      this.router.navigate(['/superadmin']);
      return;
    }
    // Load existing companies
    this.loadCompanies();
  }

  loadCompanies(): void {
    this.isLoading = true;
    this.listErrorMessage = '';

    this.http.get<Company[]>(this.API_URL).subscribe({
      next: (response: any) => {
        this.isLoading = false;
        // Handle different response formats
        if (Array.isArray(response)) {
          this.companies = response;
        } else if (response.data && Array.isArray(response.data)) {
          this.companies = response.data;
        } else if (response.companies && Array.isArray(response.companies)) {
          this.companies = response.companies;
        } else {
          this.companies = [];
        }
        console.log('Companies loaded:', this.companies);
      },
      error: (error: any) => {
        this.isLoading = false;
        console.error('Error loading companies:', error);
        this.listErrorMessage = error.error?.message || error.message || 'Failed to load companies. Please refresh the page.';
      }
    });
  }

  openAddModal(): void {
    this.resetForm();
    this.isAddModalOpen = true;
  }

  closeAddModal(): void {
    this.isAddModalOpen = false;
    this.resetForm();
  }

  resetForm(): void {
    this.companyForm = {
      name: '',
      gst_no: '',
      cin_no: '',
      address: ''
    };
    this.formErrors = {};
    this.errorMessage = '';
    this.successMessage = '';
  }

  validateForm(): boolean {
    this.formErrors = {};
    let isValid = true;

    if (!this.companyForm.name || this.companyForm.name.trim() === '') {
      this.formErrors['name'] = 'Company name is required';
      isValid = false;
    }

    if (!this.companyForm.gst_no || this.companyForm.gst_no.trim() === '') {
      this.formErrors['gst_no'] = 'GST number is required';
      isValid = false;
    }

    if (!this.companyForm.cin_no || this.companyForm.cin_no.trim() === '') {
      this.formErrors['cin_no'] = 'CIN number is required';
      isValid = false;
    }

    if (!this.companyForm.address || this.companyForm.address.trim() === '') {
      this.formErrors['address'] = 'Address is required';
      isValid = false;
    }

    return isValid;
  }

  onSubmit(): void {
    this.errorMessage = '';
    this.successMessage = '';

    if (!this.validateForm()) {
      return;
    }

    this.isSubmitting = true;

    const headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });

    const payload = {
      name: this.companyForm.name.trim(),
      gst_no: this.companyForm.gst_no?.trim() || '',
      cin_no: this.companyForm.cin_no?.trim() || '',
      address: this.companyForm.address?.trim() || ''
    };

    console.log('Sending payload:', payload);
    console.log('API URL:', this.API_URL);

    this.http.post(this.API_URL, payload, { headers }).subscribe({
      next: (response: any) => {
        console.log('Success response:', response);
        this.isSubmitting = false;
        this.successMessage = 'Company created successfully!';
        
        // Reload companies list after successful creation
        setTimeout(() => {
          this.closeAddModal();
          this.loadCompanies();
        }, 1500);
      },
      error: (error: any) => {
        this.isSubmitting = false;
        console.error('Error creating company:', error);
        console.error('Error status:', error.status);
        console.error('Error body:', error.error);
        
        // Display more detailed error message
        if (error.error) {
          if (error.error.message) {
            this.errorMessage = error.error.message;
          } else if (error.error.errors) {
            // Handle validation errors object
            const validationErrors = error.error.errors;
            const errorMessages = Object.keys(validationErrors).map(key => {
              return `${key}: ${Array.isArray(validationErrors[key]) ? validationErrors[key].join(', ') : validationErrors[key]}`;
            });
            this.errorMessage = errorMessages.join('\n');
          } else if (typeof error.error === 'string') {
            this.errorMessage = error.error;
          } else {
            this.errorMessage = JSON.stringify(error.error);
          }
        } else if (error.message) {
          this.errorMessage = error.message;
        } else {
          this.errorMessage = `Failed to create company. Status: ${error.status || 'Unknown'}. Please check the console for more details.`;
        }
      }
    });
  }

  onEdit(company: Company): void {
    if (!company.id) {
      alert('Company ID is missing. Cannot edit.');
      return;
    }

    this.editingCompany = company;
    this.formErrors = {};
    this.editErrorMessage = '';
    this.editSuccessMessage = '';
    this.isEditModalOpen = true;
    this.isLoadingEdit = true;

    // Fetch full company details to ensure all fields are available
    const viewUrl = `${this.API_URL}/${company.id}`;

    console.log('Fetching company details for edit:', company.name);
    console.log('View URL:', viewUrl);

    this.http.get<Company>(viewUrl).subscribe({
      next: (response: any) => {
        console.log('Company details fetched for edit:', response);
        this.isLoadingEdit = false;
        
        // Handle different response formats
        let companyData: Company;
        if (response.data) {
          companyData = response.data;
        } else {
          companyData = response;
        }

        // Pre-fill form with complete company data
        this.companyForm = {
          name: companyData.name || '',
          gst_no: companyData.gst_no || '',
          cin_no: companyData.cin_no || '',
          address: companyData.address || ''
        };

        // Update the editingCompany with full data
        this.editingCompany = companyData;
      },
      error: (error: any) => {
        this.isLoadingEdit = false;
        console.error('Error fetching company details for edit:', error);
        
        // Even if fetch fails, try to prefill with what we have from the list
        this.companyForm = {
          name: company.name || '',
          gst_no: company.gst_no || '',
          cin_no: company.cin_no || '',
          address: company.address || ''
        };

        // Show error but still allow editing with available data
        if (error.error?.message) {
          this.editErrorMessage = `Warning: Could not fetch full details. ${error.error.message}. You can still edit with available data.`;
        } else {
          this.editErrorMessage = 'Warning: Could not fetch full company details. Editing with available data.';
        }
      }
    });
  }

  closeEditModal(): void {
    this.isEditModalOpen = false;
    this.editingCompany = null;
    this.resetForm();
    this.editErrorMessage = '';
    this.editSuccessMessage = '';
    this.isLoadingEdit = false;
  }

  onEditSubmit(): void {
    this.editErrorMessage = '';
    this.editSuccessMessage = '';

    if (!this.validateForm()) {
      return;
    }

    if (!this.editingCompany?.id) {
      this.editErrorMessage = 'Company ID is missing. Cannot update.';
      return;
    }

    this.isEditing = true;

    const headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });

    const payload = {
      name: this.companyForm.name.trim(),
      address: this.companyForm.address?.trim() || '',
      gst_no: this.companyForm.gst_no?.trim() || '',
      cin_no: this.companyForm.cin_no?.trim() || ''
    };

    const updateUrl = `${this.API_URL}/${this.editingCompany.id}`;

    console.log('Sending update payload:', payload);
    console.log('Update URL:', updateUrl);

    this.http.patch(updateUrl, payload, { headers }).subscribe({
      next: (response: any) => {
        console.log('Update success response:', response);
        this.isEditing = false;
        this.editSuccessMessage = 'Company updated successfully!';
        
        // Reload companies list after successful update
        setTimeout(() => {
          this.closeEditModal();
          this.loadCompanies();
        }, 1500);
      },
      error: (error: any) => {
        this.isEditing = false;
        console.error('Error updating company:', error);
        console.error('Error status:', error.status);
        console.error('Error body:', error.error);
        
        // Display more detailed error message
        if (error.error) {
          if (error.error.message) {
            this.editErrorMessage = error.error.message;
          } else if (error.error.errors) {
            const validationErrors = error.error.errors;
            const errorMessages = Object.keys(validationErrors).map(key => {
              return `${key}: ${Array.isArray(validationErrors[key]) ? validationErrors[key].join(', ') : validationErrors[key]}`;
            });
            this.editErrorMessage = errorMessages.join('\n');
          } else if (typeof error.error === 'string') {
            this.editErrorMessage = error.error;
          } else {
            this.editErrorMessage = JSON.stringify(error.error);
          }
        } else if (error.message) {
          this.editErrorMessage = error.message;
        } else {
          this.editErrorMessage = `Failed to update company. Status: ${error.status || 'Unknown'}. Please check the console for more details.`;
        }
      }
    });
  }

  onView(company: Company): void {
    if (!company.id) {
      alert('Company ID is missing. Cannot view details.');
      return;
    }

    this.viewingCompany = null;
    this.viewErrorMessage = '';
    this.isViewModalOpen = true;
    this.isLoadingView = true;

    const viewUrl = `${this.API_URL}/${company.id}`;

    console.log('Fetching company details:', company.name);
    console.log('View URL:', viewUrl);

    this.http.get<Company>(viewUrl).subscribe({
      next: (response: any) => {
        console.log('View success response:', response);
        this.isLoadingView = false;
        // Handle different response formats
        if (response.data) {
          this.viewingCompany = response.data;
        } else {
          this.viewingCompany = response;
        }
      },
      error: (error: any) => {
        this.isLoadingView = false;
        console.error('Error fetching company details:', error);
        console.error('Error status:', error.status);
        console.error('Error body:', error.error);
        
        if (error.error) {
          if (error.error.message) {
            this.viewErrorMessage = error.error.message;
          } else if (typeof error.error === 'string') {
            this.viewErrorMessage = error.error;
          } else {
            this.viewErrorMessage = JSON.stringify(error.error);
          }
        } else if (error.message) {
          this.viewErrorMessage = error.message;
        } else {
          this.viewErrorMessage = `Failed to load company details. Status: ${error.status || 'Unknown'}. Please check the console for more details.`;
        }
      }
    });
  }

  closeViewModal(): void {
    this.isViewModalOpen = false;
    this.viewingCompany = null;
    this.viewErrorMessage = '';
    this.isLoadingView = false;
  }

  onDelete(company: Company): void {
    if (confirm(`Are you sure you want to delete "${company.name}"? This action cannot be undone.`)) {
      if (!company.id) {
        alert('Company ID is missing. Cannot delete.');
        return;
      }

      this.isDeleting = true;
      const deleteUrl = `${this.API_URL}/${company.id}`;

      console.log('Deleting company:', company.name);
      console.log('Delete URL:', deleteUrl);

      this.http.delete(deleteUrl).subscribe({
        next: (response: any) => {
          console.log('Delete success response:', response);
          this.isDeleting = false;
          alert(`Company "${company.name}" deleted successfully!`);
          // Reload companies list after successful deletion
          this.loadCompanies();
        },
        error: (error: any) => {
          this.isDeleting = false;
          console.error('Error deleting company:', error);
          console.error('Error status:', error.status);
          console.error('Error body:', error.error);
          
          let errorMsg = 'Failed to delete company. ';
          if (error.error?.message) {
            errorMsg += error.error.message;
          } else if (error.message) {
            errorMsg += error.message;
          } else {
            errorMsg += `Status: ${error.status || 'Unknown'}`;
          }
          alert(errorMsg);
        }
      });
    }
  }

  toggleActive(company: Company): void {
    company.is_active = !company.is_active;
    console.log('Toggle active for company:', company.name, 'New status:', company.is_active);
    // TODO: Implement API call to update is_active status
  }

  onAssignAdmin(company: Company): void {
    this.selectedCompany = company;
    this.resetAssignForm();
    this.assignAdminForm.company_id = company.id || '';
    this.isAssignModalOpen = true;
  }

  closeAssignModal(): void {
    this.isAssignModalOpen = false;
    this.selectedCompany = null;
    this.resetAssignForm();
  }

  resetAssignForm(): void {
    this.assignAdminForm = {
      username: '',
      name: '',
      contact_no: '',
      company_id: this.selectedCompany?.id || '',
      role: '',
      area_id: 1,
      bank_details: {
        account_number: '',
        account_name: '',
        bank_name: '',
        bank_branch: '',
        account_type: 'SAVINGS',
        ifsc_code: ''
      },
      is_super_admin: false
    };
    this.assignFormErrors = {};
    this.assignErrorMessage = '';
    this.assignSuccessMessage = '';
  }

  validateAssignForm(): boolean {
    this.assignFormErrors = {};
    let isValid = true;

    if (!this.assignAdminForm.username || this.assignAdminForm.username.trim() === '') {
      this.assignFormErrors['username'] = 'Username is required';
      isValid = false;
    } else if (this.assignAdminForm.username.trim().length < 1 || this.assignAdminForm.username.trim().length > 100) {
      this.assignFormErrors['username'] = 'Username must be between 1 and 100 characters';
      isValid = false;
    }

    if (!this.assignAdminForm.name || this.assignAdminForm.name.trim() === '') {
      this.assignFormErrors['name'] = 'Name is required';
      isValid = false;
    } else if (this.assignAdminForm.name.trim().length < 1 || this.assignAdminForm.name.trim().length > 255) {
      this.assignFormErrors['name'] = 'Name must be between 1 and 255 characters';
      isValid = false;
    }

    if (!this.assignAdminForm.contact_no || this.assignAdminForm.contact_no.trim() === '') {
      this.assignFormErrors['contact_no'] = 'Contact number is required';
      isValid = false;
    } else if (this.assignAdminForm.contact_no.trim().length < 1 || this.assignAdminForm.contact_no.trim().length > 20) {
      this.assignFormErrors['contact_no'] = 'Contact number must be between 1 and 20 characters';
      isValid = false;
    }

    return isValid;
  }

  onAssignSubmit(): void {
    this.assignErrorMessage = '';
    this.assignSuccessMessage = '';

    if (!this.validateAssignForm()) {
      return;
    }

    this.isAssigning = true;

    const headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });

    const payload = {
      username: this.assignAdminForm.username.trim(),
      name: this.assignAdminForm.name.trim(),
      contact_no: this.assignAdminForm.contact_no.trim(),
      company_id: this.assignAdminForm.company_id,
      role: this.assignAdminForm.role.trim() || '',
      area_id: this.assignAdminForm.area_id,
      bank_details: {
        account_number: this.assignAdminForm.bank_details.account_number.trim() || '',
        account_name: this.assignAdminForm.bank_details.account_name.trim() || '',
        bank_name: this.assignAdminForm.bank_details.bank_name.trim() || '',
        bank_branch: this.assignAdminForm.bank_details.bank_branch.trim() || '',
        account_type: this.assignAdminForm.bank_details.account_type,
        ifsc_code: this.assignAdminForm.bank_details.ifsc_code.trim() || ''
      },
      is_super_admin: this.assignAdminForm.is_super_admin
    };

    console.log('Sending assign admin payload:', payload);
    console.log('Users API URL:', this.USERS_API_URL);

    this.http.post(this.USERS_API_URL, payload, { headers }).subscribe({
      next: (response: any) => {
        console.log('Success response:', response);
        this.isAssigning = false;
        this.assignSuccessMessage = 'Admin assigned successfully!';
        
        // Close modal after 2 seconds
        setTimeout(() => {
          this.closeAssignModal();
        }, 2000);
      },
      error: (error: any) => {
        this.isAssigning = false;
        console.error('Error assigning admin:', error);
        console.error('Error status:', error.status);
        console.error('Error body:', error.error);
        
        // Display more detailed error message
        if (error.error) {
          if (error.error.message) {
            this.assignErrorMessage = error.error.message;
          } else if (error.error.errors) {
            const validationErrors = error.error.errors;
            const errorMessages = Object.keys(validationErrors).map(key => {
              return `${key}: ${Array.isArray(validationErrors[key]) ? validationErrors[key].join(', ') : validationErrors[key]}`;
            });
            this.assignErrorMessage = errorMessages.join('\n');
          } else if (typeof error.error === 'string') {
            this.assignErrorMessage = error.error;
          } else {
            this.assignErrorMessage = JSON.stringify(error.error);
          }
        } else if (error.message) {
          this.assignErrorMessage = error.message;
        } else {
          this.assignErrorMessage = `Failed to assign admin. Status: ${error.status || 'Unknown'}. Please check the console for more details.`;
        }
      }
    });
  }

  logout(): void {
    this.authService.superAdminLogout();
  }
}

