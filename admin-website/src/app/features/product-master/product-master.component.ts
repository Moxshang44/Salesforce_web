import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SidebarComponent } from '../../core/layout/sidebar/sidebar.component';
import { HeaderComponent } from '../../core/layout/header/header.component';
import { ButtonComponent } from '../../shared/components/button/button.component';

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
  imports: [CommonModule, SidebarComponent, HeaderComponent, ButtonComponent],
  templateUrl: './product-master.component.html',
  styleUrl: './product-master.component.scss'
})
export class ProductMasterComponent {
  currentPage = 1;
  totalPages = 2;
  
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
    console.log('Add new product');
  }

  onFilter() {
    console.log('Filter');
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

