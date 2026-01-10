import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { SidebarComponent } from '../../core/layout/sidebar/sidebar.component';
import { HeaderComponent } from '../../core/layout/header/header.component';
import { ButtonComponent } from '../../shared/components/button/button.component';
import { ModalComponent } from '../../shared/components/modal/modal.component';
import { DistributorFormStep1Component } from './components/distributor-form-step1/distributor-form-step1.component';
import { DistributorFormStep2Component } from './components/distributor-form-step2/distributor-form-step2.component';
import { DistributorFormStep3Component } from './components/distributor-form-step3/distributor-form-step3.component';

interface Distributor {
  id: number;
  name: string;
  distributorId: string;
  contactName: string;
  contactPhone: string;
  areaAddress: string;
  routesCover: string;
}

@Component({
  selector: 'app-distributors',
  standalone: true,
  imports: [CommonModule, FormsModule, SidebarComponent, HeaderComponent, ButtonComponent, ModalComponent, DistributorFormStep1Component, DistributorFormStep2Component, DistributorFormStep3Component],
  templateUrl: './distributors.component.html',
  styleUrl: './distributors.component.scss'
})
export class DistributorsComponent {
  currentPage = 1;
  totalPages = 2;
  isAddModalOpen = false;
  currentStep = 1;

  constructor(private router: Router) {}

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
        return 'Add Distributor — Step 1: Basic Employee Details';
      case 2:
        return 'Add Distributor — Step 2: Channel, Bank Details And Other Distributor Info';
      case 3:
        return 'Add Distributor — Step 3: Assign Routes';
      default:
        return 'Add Distributor';
    }
  }

  onSaveStep1(formData: any): void {
    console.log('Save step 1:', formData);
    // Move to step 2
    this.currentStep = 2;
  }

  onSaveStep2(formData: any): void {
    console.log('Save step 2:', formData);
    // Move to step 3
    this.currentStep = 3;
  }

  onSaveStep3(formData: any): void {
    console.log('Save step 3:', formData);
    console.log('All steps completed!');
    // Close modal after final step
    this.isAddModalOpen = false;
    this.currentStep = 1;
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
  }

  onEdit(distributor: Distributor): void {
    console.log('Edit distributor:', distributor);
  }

  onDelete(distributor: Distributor): void {
    console.log('Delete distributor:', distributor);
      if (confirm(`Are you sure you want to delete "${distributor.name}"?`)) {
      // Remove the distributor from the list
      this.distributors = this.distributors.filter(d => d.id !== distributor.id);
      console.log('Distributor deleted:', distributor);
    } else {
      console.log('Delete cancelled');
    }
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
