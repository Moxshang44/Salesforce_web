import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SidebarComponent } from '../../core/layout/sidebar/sidebar.component';
import { HeaderComponent } from '../../core/layout/header/header.component';
import { ButtonComponent } from '../../shared/components/button/button.component';
import { ModalComponent } from '../../shared/components/modal/modal.component';
import { RetailerFormStep1Component } from './components/retailer-form-step1/retailer-form-step1.component';
import { RetailerFormStep2Component } from './components/retailer-form-step2/retailer-form-step2.component';

interface Retailer {
  id: number;
  name: string;
  code: string;
  contact: string;
  route: string;
  address: string;
  isDisabled: boolean;
}

@Component({
  selector: 'app-retailers',
  standalone: true,
  imports: [CommonModule, FormsModule, SidebarComponent, HeaderComponent, ButtonComponent, ModalComponent, RetailerFormStep1Component, RetailerFormStep2Component],
  templateUrl: './retailers.component.html',
  styleUrl: './retailers.component.scss'
})
export class RetailersComponent {
  currentPage = 1;
  totalPages = 2;
  totalCount = 15;
  recordsPerPage = 9;
  isAddModalOpen = false;
  currentStep = 1;
  pendingApprovalsCount = 5;

  // Filter options
  selectedCountryZone = '';
  selectedRegion = '';
  selectedArea = '';
  selectedDivision = '';

  countryZoneOptions = ['India - North', 'India - South', 'India - East', 'India - West', 'USA - East'];
  regionOptions = ['North Region', 'South Region', 'East Region', 'West Region', 'Central Region'];
  areaOptions = ['Area A', 'Area B', 'Area C', 'Area D', 'Area E'];
  divisionOptions = ['Division 1', 'Division 2', 'Division 3', 'Division 4'];

  retailers: Retailer[] = [
    {
      id: 1,
      name: 'Ankur Medical & Surgical',
      code: '#RTL-ICAI 332',
      contact: '+91 98765 43210',
      route: 'Andheri West',
      address: 'Versova Cross Rd',
      isDisabled: false
    },
    {
      id: 2,
      name: 'Banka Pharmacy',
      code: '#RTL-ICAI 332',
      contact: '+91 98123 77890',
      route: 'Hill Road, Bandra E',
      address: '',
      isDisabled: false
    },
    {
      id: 3,
      name: 'Lower Parel Pharmacy',
      code: '#RTL-ICAI 332',
      contact: '+91 98765 43216',
      route: 'Nar Datta Vatika, Lpt',
      address: '',
      isDisabled: false
    },
    {
      id: 4,
      name: 'Dadar Central Pharmacy',
      code: '#RTL-ICAI 332',
      contact: 'Mahesh Ankit',
      route: 'Dadar West',
      address: '+91 98123 98776',
      isDisabled: false
    },
    {
      id: 5,
      name: 'Pooal Wellness Store',
      code: '#RTL-ICAI 332',
      contact: 'Ankiti Verma',
      route: 'Powai',
      address: '+91 98123 98776',
      isDisabled: false
    },
    {
      id: 6,
      name: 'Vashi Care',
      code: '#RTL-ICAI 332',
      contact: 'Deepak Yadev',
      route: 'Malad West',
      address: '+91 97083 53435',
      isDisabled: false
    },
    {
      id: 7,
      name: 'Malad LifeCare',
      code: '#RTL-ICAI 332',
      contact: 'Viresh Mishra',
      route: 'Goregaon East',
      address: '+91 98123 43643',
      isDisabled: false
    },
    {
      id: 8,
      name: 'Goregaon Medical Centre',
      code: '#RTL-ICAI 332',
      contact: 'Salman Ansari',
      route: 'Kurla West',
      address: '+91 98765 94667',
      isDisabled: false
    },
    {
      id: 9,
      name: 'Kurla Prime Pharmacy',
      code: '#RTL-ICAI 332',
      contact: 'Chetan Jagtap',
      route: 'Vile-Parle MIRA, N',
      address: '+91 98765 22314',
      isDisabled: false
    }
  ];

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
    this.currentStep = 2;
  }

  onSaveStep2(formData: any): void {
    console.log('Save step 2:', formData);
    this.isAddModalOpen = false;
    this.currentStep = 1;
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
    }
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
    }
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
    }
  }

  onSearch(event: Event): void {
    const input = event.target as HTMLInputElement;
    console.log('Search:', input.value);
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
}
