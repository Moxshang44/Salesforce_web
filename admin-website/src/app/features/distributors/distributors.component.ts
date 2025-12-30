import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { SidebarComponent } from '../../core/layout/sidebar/sidebar.component';
import { HeaderComponent } from '../../core/layout/header/header.component';
import { ModalComponent } from '../../shared/components/modal/modal.component';
import { DistributorFormStep1Component } from './components/distributor-form-step1/distributor-form-step1.component';
import { DistributorFormStep2Component } from './components/distributor-form-step2/distributor-form-step2.component';
import { DistributorFormStep3Component } from './components/distributor-form-step3/distributor-form-step3.component';

interface Distributor {
  id: number;
  name: string;
  distributorId: string;
  contact: string;
  secondaryContact: string;
  area: string;
  address: string;
  routesCount: number;
  routeType: string;
}

@Component({
  selector: 'app-distributors',
  standalone: true,
  imports: [CommonModule, FormsModule, SidebarComponent, HeaderComponent, ModalComponent, DistributorFormStep1Component, DistributorFormStep2Component, DistributorFormStep3Component],
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
      name: 'Shree Healthcare',
      distributorId: '#DST-10234',
      contact: '+91 98765 43210',
      secondaryContact: '',
      area: 'Ahmedabad West',
      address: 'Co Road, Navrangpura',
      routesCount: 42,
      routeType: 'Urban & Rural'
    },
    {
      id: 2,
      name: 'Patel Pharma Agency',
      distributorId: '#DST-10235',
      contact: '+91 98765 43211',
      secondaryContact: '',
      area: 'Surat Central',
      address: 'Ring Road',
      routesCount: 36,
      routeType: 'Urban'
    },
    {
      id: 3,
      name: 'Om Sai Distributors',
      distributorId: '#DST-10236',
      contact: 'Samidh Verma',
      secondaryContact: '+91 98765 43212',
      area: 'Indore East',
      address: 'MG Road',
      routesCount: 28,
      routeType: 'Urban'
    },
    {
      id: 4,
      name: 'Krishna Medical Store',
      distributorId: '#DST-10237',
      contact: 'Vikas Sharma',
      secondaryContact: '+91 98765 43213',
      area: 'Delhi NCR',
      address: 'Laxmi Nagar',
      routesCount: 54,
      routeType: 'Urban & Rural'
    },
    {
      id: 5,
      name: 'Shivam Healthcare',
      distributorId: '#DST-10238',
      contact: 'Naresh Singh',
      secondaryContact: '+91 98765 43214',
      area: 'Bangalore North',
      address: 'Yelahanka',
      routesCount: 31,
      routeType: 'Urban'
    },
    {
      id: 6,
      name: 'Laxmi Pharma',
      distributorId: '#DST-10239',
      contact: 'Ramesh Gupta',
      secondaryContact: '+91 98765 43215',
      area: 'Jaipur South',
      address: 'Jagatpura',
      routesCount: 26,
      routeType: 'Urban'
    },
    {
      id: 7,
      name: 'Sunrise Distributors',
      distributorId: '#DST-10240',
      contact: 'Mahesh Patil',
      secondaryContact: '+91 98765 43216',
      area: 'Pune West',
      address: 'Hinjewadi',
      routesCount: 45,
      routeType: 'Urban & Rural'
    },
    {
      id: 8,
      name: 'Care Connect Pharma',
      distributorId: '#DST-10241',
      contact: 'Deepak Nair',
      secondaryContact: '+91 98765 43217',
      area: 'Kochi',
      address: 'MG Road',
      routesCount: 19,
      routeType: 'Urban'
    },
    {
      id: 9,
      name: 'HealthFirst Distributors',
      distributorId: '#DST-10242',
      contact: 'Manoj Kulkarni',
      secondaryContact: '+91 98765 43218',
      area: 'Nagpur West',
      address: 'Dharampeth',
      routesCount: 32,
      routeType: 'Urban & Rural'
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
  }

  onView(distributor: Distributor): void {
    console.log('View distributor:', distributor);
    this.router.navigate(['/distributors', distributor.id, 'stock']);
  }

  onRowClick(distributor: Distributor): void {
    this.router.navigate(['/distributors', distributor.id, 'stock']);
  }
}
