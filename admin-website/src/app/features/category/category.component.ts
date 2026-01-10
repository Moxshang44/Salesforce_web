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
  productsCount: number;
  createdDate: string;
  createdAgo: string;
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
      productsCount: 45,
      createdDate: '12 Nov 2024',
      createdAgo: '6 months',
      isActive: true
    },
    {
      id: 2,
      categoryName: 'Health Supplements',
      categoryCode: 'CAT-002',
      productsCount: 32,
      createdDate: '15 Oct 2024',
      createdAgo: '7 months',
      isActive: true
    },
    {
      id: 3,
      categoryName: 'Personal Care',
      categoryCode: 'CAT-003',
      productsCount: 28,
      createdDate: '20 Sep 2024',
      createdAgo: '8 months',
      isActive: false
    },
    {
      id: 4,
      categoryName: 'Beauty Products',
      categoryCode: 'CAT-004',
      productsCount: 56,
      createdDate: '05 Aug 2024',
      createdAgo: '9 months',
      isActive: true
    },
    {
      id: 5,
      categoryName: 'Home & Living',
      categoryCode: 'CAT-005',
      productsCount: 23,
      createdDate: '18 Jul 2024',
      createdAgo: '10 months',
      isActive: true
    },
    {
      id: 6,
      categoryName: 'Food & Beverages',
      categoryCode: 'CAT-006',
      productsCount: 67,
      createdDate: '22 Jun 2024',
      createdAgo: '11 months',
      isActive: true
    },
    {
      id: 7,
      categoryName: 'Baby Care',
      categoryCode: 'CAT-007',
      productsCount: 19,
      createdDate: '10 May 2024',
      createdAgo: '1 year',
      isActive: false
    },
    {
      id: 8,
      categoryName: 'Fitness & Sports',
      categoryCode: 'CAT-008',
      productsCount: 41,
      createdDate: '14 Apr 2024',
      createdAgo: '1 year',
      isActive: true
    },
    {
      id: 9,
      categoryName: 'Electronics',
      categoryCode: 'CAT-009',
      productsCount: 34,
      createdDate: '28 Mar 2024',
      createdAgo: '1 year',
      isActive: true
    },
    {
      id: 10,
      categoryName: 'Office Supplies',
      categoryCode: 'CAT-010',
      productsCount: 15,
      createdDate: '03 Feb 2024',
      createdAgo: '1 year',
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
    if (confirm(`Are you sure you want to delete "${category.categoryName}"?`)) {
      
      this.categories = this.categories.filter(b => b.id !== category.id);
      console.log('category deleted:', category);
    } else {
      console.log('Delete cancelled');
    }
  }

  

  onView(category: Category): void {
    console.log('View category:', category);
  }

  toggleActive(category: Category): void {
    category.isActive = !category.isActive;
  }
}
