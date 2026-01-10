import { Component } from "@angular/core";
import { CommonModule } from "@angular/common";
import { SidebarComponent } from "../../core/layout/sidebar/sidebar.component";
import { HeaderComponent } from "../../core/layout/header/header.component";
import { ButtonComponent } from "../../shared/components/button/button.component";
import { ModalComponent } from "../../shared/components/modal/modal.component";
import { BrandFormStep1Component } from "./components/brand-form-step1/brand-form-step1.component";
import { BrandFormStep2Component } from "./components/brand-form-step2/brand-form-step2.component";

interface Brand {
  id: number;
  brandName: string;
  brandCode: string;
  categoriesCount: number;
  productsCount: number;
  createdDate: string;
  createdAgo: string;
  description: string;
  isActive: boolean;
}

@Component({
  selector: "app-brand",
  standalone: true,
  imports: [
    CommonModule,
    SidebarComponent,
    HeaderComponent,
    ButtonComponent,
    ModalComponent,
    BrandFormStep1Component,
    BrandFormStep2Component,
  ],
  templateUrl: "./brand.component.html",
  styleUrl: "./brand.component.scss",
})
export class BrandComponent {
  currentPage = 1;
  totalPages = 2;
  isAddModalOpen = false;
  isViewModalOpen = false;
  currentStep = 1;
  viewingBrand: Brand | null = null;

  brands: Brand[] = [
    {
      id: 1,
      brandName: "Himalaya Wellness",
      brandCode: "HW-001",
      categoriesCount: 6,
      productsCount: 42,
      createdDate: "15 Jan 2024",
      createdAgo: "6 months",
      description: "Leading wellness brand",
      isActive: true,
    },
    {
      id: 2,
      brandName: "Cipla",
      brandCode: "CPL-002",
      categoriesCount: 8,
      productsCount: 120,
      createdDate: "10 Feb 2024",
      createdAgo: "5 months",
      description: "Trusted pharma brand",
      isActive: true,
    },
    {
      id: 3,
      brandName: "Sun Pharma",
      brandCode: "SP-003",
      categoriesCount: 7,
      productsCount: 89,
      createdDate: "22 Feb 2024",
      createdAgo: "5 months",
      description: "Quality healthcare products",
      isActive: true,
    },
    {
      id: 4,
      brandName: "Abbott",
      brandCode: "ABT-004",
      categoriesCount: 5,
      productsCount: 56,
      createdDate: "05 Mar 2024",
      createdAgo: "4 months",
      description: "Nutrition experts",
      isActive: true,
    },
    {
      id: 5,
      brandName: "Dr. Reddy's",
      brandCode: "DRL-005",
      categoriesCount: 4,
      productsCount: 34,
      createdDate: "18 Mar 2024",
      createdAgo: "4 months",
      description: "Healthcare solutions",
      isActive: false,
    },
    {
      id: 6,
      brandName: "Mankind",
      brandCode: "MK-006",
      categoriesCount: 6,
      productsCount: 67,
      createdDate: "25 Mar 2024",
      createdAgo: "4 months",
      description: "Affordable healthcare",
      isActive: true,
    },
    {
      id: 7,
      brandName: "Zydus Healthcare",
      brandCode: "ZH-007",
      categoriesCount: 5,
      productsCount: 42,
      createdDate: "10 Apr 2024",
      createdAgo: "3 months",
      description: "Complete wellness solutions",
      isActive: true,
    },
    {
      id: 8,
      brandName: "Glenmark",
      brandCode: "GLN-008",
      categoriesCount: 7,
      productsCount: 78,
      createdDate: "15 Apr 2024",
      createdAgo: "3 months",
      description: "Innovative medicines",
      isActive: true,
    },
    {
      id: 9,
      brandName: "Alembic",
      brandCode: "ALM-009",
      categoriesCount: 4,
      productsCount: 23,
      createdDate: "20 May 2024",
      createdAgo: "2 months",
      description: "Nutritional supplements",
      isActive: true,
    },
    {
      id: 10,
      brandName: "Torrent Pharma",
      brandCode: "TOR-010",
      categoriesCount: 5,
      productsCount: 38,
      createdDate: "30 May 2024",
      createdAgo: "2 months",
      description: "Comprehensive care",
      isActive: false,
    },
  ];

  onBulkUpload(): void {
    console.log("Bulk Upload clicked");
  }

  onExcel(): void {
    console.log("Excel clicked");
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
        return "Add Brand — Step 1: Basic Brand Information";
      case 2:
        return "Add Brand — Step 2: Additional Details & Configuration";
      default:
        return "Add Brand";
    }
  }

  onSaveStep1(formData: any): void {
    console.log("Save step 1:", formData);
    this.currentStep = 2;
  }

  onSaveStep2(formData: any): void {
    console.log("Save step 2:", formData);
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
    console.log("Filter clicked");
  }

  onEdit(brand: Brand): void {
    console.log("Edit brand:", brand);
  }

  onDelete(brand: Brand): void {
    console.log("Delete brand:", brand);
  }

  onView(brand: Brand): void {
    this.viewingBrand = brand;
    this.isViewModalOpen = true;
  }

  closeViewModal(): void {
    this.isViewModalOpen = false;
    this.viewingBrand = null;
  }

  toggleActive(brand: Brand): void {
    brand.isActive = !brand.isActive;
  }
}
