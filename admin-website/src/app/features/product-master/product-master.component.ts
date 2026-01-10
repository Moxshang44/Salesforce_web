import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SidebarComponent } from '../../core/layout/sidebar/sidebar.component';
import { HeaderComponent } from '../../core/layout/header/header.component';
import { ButtonComponent } from '../../shared/components/button/button.component';
import { ModalComponent } from '../../shared/components/modal/modal.component';
import { ProductFormComponent } from './components/product-form/product-form.component';
import { ProductFormStep2Component } from './components/product-form-step2/product-form-step2.component';
import { ProductFormStep3Component } from './components/product-form-step3/product-form-step3.component';
import { ProductFormStep3_2Component } from './components/product-form-step3-2/product-form-step3-2.component';
import { ProductFormStep4Component } from './components/product-form-step4/product-form-step4.component';

interface Product {
  id: string;
  brand: string;
  typeCode: string;
  name: string;
  category: string;
  subcategory: string;
  active: boolean;
}

@Component({
  selector: 'app-product-master',
  standalone: true,
  imports: [CommonModule, SidebarComponent, HeaderComponent, ButtonComponent, ModalComponent, ProductFormComponent, ProductFormStep2Component, ProductFormStep3Component, ProductFormStep3_2Component, ProductFormStep4Component],
  templateUrl: './product-master.component.html',
  styleUrl: './product-master.component.scss'
})
export class ProductMasterComponent {
  currentPage = 1;
  totalPages = 2;
  isAddModalOpen = false;
  isViewModalOpen = false;
  currentStep: number = 1;
  viewingProduct: Product | null = null;
  
  products: Product[] = [
    {
      id: '1',
      brand: 'Alembic',
      typeCode: '#283849',
      name: 'Run Chocolate Protein Powder Isolated 500gm',
      category: 'Food, Protein, Supplements, Nutrition Drinks, Schemes, Focus',
      subcategory: '',
      active: true
    },
    {
      id: '2',
      brand: 'Zydus Healthcare',
      typeCode: '#692018',
      name: 'Vitaboost Multivitamin Tablets (30 Tabs)',
      category: 'Wellness, Supplements, Immunity',
      subcategory: '',
      active: true
    },
    {
      id: '3',
      brand: 'Cipla',
      typeCode: '#859372',
      name: 'Respira Cough Syrup 100ml',
      category: 'Respiratory, OTC, Health Care',
      subcategory: '',
      active: false
    },
    {
      id: '4',
      brand: 'Sun Pharma',
      typeCode: '#283746',
      name: 'D-Immune Vitamin D3 Drops',
      category: 'Vitamin, Immunity, Healthcare',
      subcategory: '',
      active: true
    },
    {
      id: '5',
      brand: 'Mankind',
      typeCode: '#774923',
      name: 'ProActive Calcium Tablets (60 Tabs)',
      category: 'Bone Health, Supplements',
      subcategory: '',
      active: true
    },
    {
      id: '6',
      brand: 'Dr. Reddy\'s',
      typeCode: '#667180',
      name: 'Rejuvia Hair Strength Serum 50ml',
      category: 'Personal Care, Hair, Dermatology',
      subcategory: '',
      active: true
    },
    {
      id: '7',
      brand: 'Abbott',
      typeCode: '#728964',
      name: 'Ensure Gold Nutrition Powder 400gm',
      category: 'Nutrition Drinks, Health, Supplements',
      subcategory: '',
      active: true
    },
    {
      id: '8',
      brand: 'Glenmark',
      typeCode: '#558342',
      name: 'ColdAway Tablets (10 Tabs)',
      category: 'Respiratory, OTC',
      subcategory: '',
      active: true
    },
    {
      id: '9',
      brand: 'Himalaya',
      typeCode: '#905432',
      name: 'Ashwagandha Herbal Capsules (60 Caps)',
      category: 'Ayurveda, Wellness, Stress Relief',
      subcategory: '',
      active: true
    },
    {
      id: '10',
      brand: 'Torrent Pharma',
      typeCode: '#732164',
      name: 'CardioPlus Blood Pressure Tablet',
      category: 'Cardiac, Prescription',
      subcategory: '',
      active: false
    }
  ];

  onEdit(product: Product) {
    console.log('Edit product:', product);
  }

  onDelete(product: Product) {
    console.log('Delete product:', product);
  }

  onToggleActive(product: Product) {
    product.active = !product.active;
  }

  onBulkUpload() {
    console.log('Bulk upload');
  }

  onExport() {
    console.log('Export to Excel');
  }

  onAdd() {
    this.currentStep = 1;
    this.isAddModalOpen = true;
  }

  closeAddModal() {
    this.isAddModalOpen = false;
    this.currentStep = 1;
  }

  onSaveStep1(productData: any) {
    console.log('Save step 1:', productData);
    // Move to step 2
    this.currentStep = 2;
  }

  onSaveStep2(productData: any) {
    console.log('Save step 2:', productData);
    // Move to step 3
    this.currentStep = 3;
  }

  onSaveStep3(productData: any) {
    console.log('Save step 3:', productData);
    // Move to step 3.2
    this.currentStep = 3.2;
  }

  onSaveStep3_2(productData: any) {
    console.log('Save step 3.2:', productData);
    // Move to step 4
    this.currentStep = 4;
  }

  onSaveStep4(productData: any) {
    console.log('Save step 4:', productData);
    // Here you would typically save all data to backend
    // For now, just close the modal and show success
    console.log('Product creation completed!');
    this.isAddModalOpen = false;
    this.currentStep = 1;
  }

  onPreviousStep() {
    if (this.currentStep === 4) {
      this.currentStep = 3.2;
    } else if (this.currentStep === 3.2) {
      this.currentStep = 3;
    } else if (this.currentStep > 1) {
      this.currentStep--;
    }
  }

  getModalTitle(): string {
    switch(this.currentStep) {
      case 1:
        return 'Add Product — Step 1: Basic Product Information';
      case 2:
        return 'Add Product — Step 2: Physical & Technical Details';
      case 3:
        return 'Add Product — Step 3: Channel Pricing & Territory Control';
      case 3.2:
        return 'Add Product — Step 3: Channel Pricing & Territory Control';
      case 4:
        return 'Add Product — Step 4: Visibility & Access Controls';
      default:
        return 'Add Product';
    }
  }

  onFilter() {
    console.log('Filter');
  }

  onView(product: Product): void {
    this.viewingProduct = product;
    this.isViewModalOpen = true;
  }

  closeViewModal(): void {
    this.isViewModalOpen = false;
    this.viewingProduct = null;
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

