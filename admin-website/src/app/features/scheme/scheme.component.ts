import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SidebarComponent } from '../../core/layout/sidebar/sidebar.component';
import { HeaderComponent } from '../../core/layout/header/header.component';
import { ButtonComponent } from '../../shared/components/button/button.component';
import { ModalComponent } from '../../shared/components/modal/modal.component';
import { SchemeFormStep1Component } from './components/scheme-form-step1/scheme-form-step1.component';
import { SchemeFormStep2Component } from './components/scheme-form-step2/scheme-form-step2.component';

interface Scheme {
  id: number;
  productName: string;
  skuCode: string;
  scheme: string;
  schemeType: 'Active' | 'Inactive';
  dateRange: string;
  options: string;
  zone: string;
  regions: string;
  tags: string[];
  isActive: boolean;
}

@Component({
  selector: 'app-scheme',
  standalone: true,
  imports: [CommonModule, SidebarComponent, HeaderComponent, ButtonComponent, ModalComponent, SchemeFormStep1Component, SchemeFormStep2Component],
  templateUrl: './scheme.component.html',
  styleUrl: './scheme.component.scss'
})
export class SchemeComponent {
  currentPage = 1;
  totalPages = 2;
  isAddModalOpen = false;
  currentStep = 1;
  searchTerm = '';

  get filteredSchemes(): Scheme[] {
    const term = this.searchTerm?.trim().toLowerCase();
    if (!term) return this.schemes;
    return this.schemes.filter(s =>
      (s.productName || '').toLowerCase().includes(term) ||
      (s.skuCode || '').toLowerCase().includes(term) ||
      (s.scheme || '').toLowerCase().includes(term)
    );
  }

  schemes: Scheme[] = [
    {
      id: 1,
      productName: 'Buy 3 gold Member get 1free',
      skuCode: 'SKU-0001',
      scheme: 'Festive Diwali Offer',
      schemeType: 'Active',
      dateRange: '01 Nov 2024 to 15 Dec 2024',
      options: '2 extra options available',
      zone: 'East Zone',
      regions: 'Bihar, West Bengal, Odisha',
      tags: [],
      isActive: true
    },
    {
      id: 2,
      productName: 'Orange S-Strings Capsules',
      skuCode: 'Capsules: Bottle of 60',
      scheme: '₹500 Off over ₹10,000',
      schemeType: 'Inactive',
      dateRange: 'Valid till 31 Dec 2024',
      options: '+ 2 extra options',
      zone: 'North Zone',
      regions: 'Delhi, Haryana, Punjab',
      tags: [],
      isActive: true
    },
    {
      id: 3,
      productName: 'Ultra Clear Micellar Water',
      skuCode: 'SKU: 49302',
      scheme: 'Clearance Sale @ ₹',
      schemeType: 'Inactive',
      dateRange: 'Dec 2024 to Feb 2025',
      options: '+ 4 extra options',
      zone: 'East Zone',
      regions: 'Jharkhand, Assam',
      tags: [],
      isActive: false
    },
    {
      id: 4,
      productName: 'Thread Count 1000 Bedding',
      skuCode: 'King Size',
      scheme: 'Buy 1 Get 1',
      schemeType: 'Active',
      dateRange: 'Nov 1 to Dec 31',
      options: '+ 2 extra options',
      zone: 'East Zone',
      regions: 'West Bengal, Tripura',
      tags: [],
      isActive: true
    },
    {
      id: 5,
      productName: 'Protein Bar Chocolate',
      skuCode: 'Box of 12',
      scheme: '20% OFF',
      schemeType: 'Active',
      dateRange: 'Valid till 31 Dec 2024',
      options: '1 extra option',
      zone: 'West Zone',
      regions: 'Gujarat, Rajasthan',
      tags: [],
      isActive: true
    },
    {
      id: 6,
      productName: 'Ashwagandha Capsule',
      skuCode: 'Bottle of 60',
      scheme: 'Flat 15% OFF',
      schemeType: 'Inactive',
      dateRange: 'Valid till 31 Dec 2024',
      options: '+ 5 extra options',
      zone: 'West Zone',
      regions: 'Gujarat, Rajasthan',
      tags: [],
      isActive: true
    },
    {
      id: 7,
      productName: 'Whitening Scrub 100ml',
      skuCode: 'For Face, 100ml',
      scheme: 'Combo Deal @ ₹599',
      schemeType: 'Inactive',
      dateRange: 'Valid till 31 Dec 2024',
      options: '+ 3 extra options',
      zone: 'East Zone',
      regions: 'Bihar, Odisha',
      tags: [],
      isActive: false
    },
    {
      id: 8,
      productName: 'Diabetic Care Formula',
      skuCode: 'Month Supply',
      scheme: 'YES OFF',
      schemeType: 'Active',
      dateRange: 'Valid till 31 Dec 2024',
      options: '+ 3 extra options',
      zone: 'West Zone',
      regions: 'Gujarat, Rajasthan',
      tags: [],
      isActive: true
    },
    {
      id: 9,
      productName: 'Ink Jet Catridges',
      skuCode: 'HP 680',
      scheme: 'Buy 1 Get 1',
      schemeType: 'Inactive',
      dateRange: 'Valid till 31 Dec 2024',
      options: '+ 3 extra options',
      zone: 'North Zone',
      regions: 'Uttar Pradesh, Uttarakhand',
      tags: [],
      isActive: true
    },
    {
      id: 10,
      productName: 'Vitamin Complex Syrup',
      skuCode: '200ml',
      scheme: 'Special Monsoon',
      schemeType: 'Inactive',
      dateRange: 'Valid till 31 Dec 2024',
      options: '+ 1 extra options',
      zone: 'South Zone',
      regions: 'Tamil Nadu, Karnataka',
      tags: [],
      isActive: true
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
        return 'Add Scheme — Step 1: Basic Scheme Information';
      case 2:
        return 'Add Scheme — Step 2: Scheme Visibility and Timeline';
      default:
        return 'Add Scheme';
    }
  }

  onSaveStep1(formData: any): void {
    console.log('Save step 1:', formData);
    this.currentStep = 2;
  }

  onSaveStep2(formData: any): void {
    console.log('Save step 2:', formData);
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
    console.log('Filter clicked');
  }

  onSearch(term: string): void {
    this.searchTerm = term || '';
  }

  onEdit(scheme: Scheme): void {
    console.log('Edit scheme:', scheme);
  }

  onDelete(scheme: Scheme): void {
    console.log('Delete scheme:', scheme);
  }

  onView(scheme: Scheme): void {
    console.log('View scheme:', scheme);
  }

  toggleActive(scheme: Scheme): void {
    scheme.isActive = !scheme.isActive;
  }
}
