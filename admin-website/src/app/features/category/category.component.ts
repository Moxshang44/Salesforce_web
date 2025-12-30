import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SidebarComponent } from '../../core/layout/sidebar/sidebar.component';
import { HeaderComponent } from '../../core/layout/header/header.component';
import { ButtonComponent } from '../../shared/components/button/button.component';
import { ModalComponent } from '../../shared/components/modal/modal.component';
import { CategoryFormStep1Component } from './components/category-form-step1/category-form-step1.component';

interface Category {
  id: number;
  categoryName: string;
  categoryCode: string;
  description: string;
  productsCount: number;
  status: 'Active' | 'Inactive';
  isActive: boolean;
}

@Component({
  selector: 'app-category',
  standalone: true,
  imports: [CommonModule, SidebarComponent, HeaderComponent, ButtonComponent, ModalComponent, CategoryFormStep1Component],
  templateUrl: './category.component.html',
  styleUrl: './category.component.scss'
})
export class CategoryComponent {
  currentPage = 1;
  totalPages = 2;
  isAddModalOpen = false;
  currentStep = 1;

  categories: Category[] = [
    {
      id: 1,
      categoryName: 'Ayurvedic Medicine',
      categoryCode: 'CAT-001',
      description: 'Traditional Ayurvedic products',
      productsCount: 45,
      status: 'Active',
      isActive: true
    },
    {
      id: 2,
      categoryName: 'Health Supplements',
      categoryCode: 'CAT-002',
      description: 'Vitamins and health supplements',
      productsCount: 32,
      status: 'Active',
      isActive: true
    },
    {
      id: 3,
      categoryName: 'Personal Care',
      categoryCode: 'CAT-003',
      description: 'Personal hygiene and care products',
      productsCount: 28,
      status: 'Inactive',
      isActive: false
    },
    {
      id: 4,
      categoryName: 'Beauty Products',
      categoryCode: 'CAT-004',
      description: 'Skincare and beauty items',
      productsCount: 56,
      status: 'Active',
      isActive: true
    },
    {
      id: 5,
      categoryName: 'Home & Living',
      categoryCode: 'CAT-005',
      description: 'Home essentials and living products',
      productsCount: 23,
      status: 'Active',
      isActive: true
    },
    {
      id: 6,
      categoryName: 'Food & Beverages',
      categoryCode: 'CAT-006',
      description: 'Organic food and beverages',
      productsCount: 67,
      status: 'Active',
      isActive: true
    },
    {
      id: 7,
      categoryName: 'Baby Care',
      categoryCode: 'CAT-007',
      description: 'Baby products and care items',
      productsCount: 19,
      status: 'Inactive',
      isActive: false
    },
    {
      id: 8,
      categoryName: 'Fitness & Sports',
      categoryCode: 'CAT-008',
      description: 'Fitness equipment and sports items',
      productsCount: 41,
      status: 'Active',
      isActive: true
    },
    {
      id: 9,
      categoryName: 'Electronics',
      categoryCode: 'CAT-009',
      description: 'Electronic gadgets and accessories',
      productsCount: 34,
      status: 'Active',
      isActive: true
    },
    {
      id: 10,
      categoryName: 'Office Supplies',
      categoryCode: 'CAT-010',
      description: 'Office and stationery products',
      productsCount: 15,
      status: 'Active',
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
    return 'Add Category — Step 1: Basic Category Details';
  }

  onSaveStep1(categoryData: any): void {
    console.log('Save category step 1:', categoryData);
    // Here you would typically save the data and either close modal or go to step 2
    this.isAddModalOpen = false;
    this.currentStep = 1;
  }

  onFilter(): void {
    console.log('Filter clicked');
  }

  onEdit(category: Category): void {
    console.log('Edit category:', category);
  }

  onDelete(category: Category): void {
    console.log('Delete category:', category);
  }

  onView(category: Category): void {
    console.log('View category:', category);
  }

  toggleActive(category: Category): void {
    category.isActive = !category.isActive;
    category.status = category.isActive ? 'Active' : 'Inactive';
  }
}
