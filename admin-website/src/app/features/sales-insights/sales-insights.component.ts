import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SidebarComponent } from '../../core/layout/sidebar/sidebar.component';
import { HeaderComponent } from '../../core/layout/header/header.component';

interface RSMData {
  name: string;
  region: string;
  sales: string;
  tc: number;
  pc: number;
  avgSales: string;
  growth: number;
}

interface ProductData {
  brand: string;
  category: string;
  product: string;
  totalQty: number;
  totalSales: string;
  contribution: string;
}

interface CategoryData {
  name: string;
  percentage: number;
  color: string;
}

@Component({
  selector: 'app-sales-insights',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    SidebarComponent,
    HeaderComponent
  ],
  templateUrl: './sales-insights.component.html',
  styleUrl: './sales-insights.component.scss'
})
export class SalesInsightsComponent {
  selectedPeriod: string = 'FTD';
  selectedRegion: string = 'All';
  selectedSort: string = 'Sales +';
  selectedBrand: string = 'All';
  selectedCategory: string = 'All';
  selectedProduct: string = 'All';
  searchProduct: string = '';
  categoryTab: string = 'Value';
  
  // Table view states
  showAllRSM: boolean = false;
  showAllProducts: boolean = false;

  // ZSM Profile Data
  zsmName = 'Getansh Savla';
  zsmZone = 'West Zone';
  zsmStats = {
    regions: 5,
    areas: 18,
    distributors: 45,
    retailers: 2675
  };

  // KPI Data
  kpis = [
    { label: 'Total Sales', value: '15,15,1515', trend: { value: '12%', isPositive: true } },
    { label: 'Avg Sales', value: '975', trend: { value: '-10%', isPositive: false } },
    { label: 'CTC', value: '3.61', trend: { value: '5%', isPositive: true } },
    { label: 'Total calls', value: '463', trend: { value: '-8%', isPositive: false } },
    { label: 'Productive Calls', value: '463', trend: { value: '10%', isPositive: true } },
    { label: 'Telephonic calls', value: '3.61', trend: { value: '-10%', isPositive: false } }
  ];

  // RSM Performance Data
  rsmData: RSMData[] = [
    { name: 'Mayur Savie', region: 'Indian', sales: '15,15,151', tc: 389, pc: 456, avgSales: '1,15,350', growth: 6.33 },
    { name: 'Plyush Savla', region: 'Indian', sales: '1,15,15,161', tc: 208, pc: 200, avgSales: '1,15,350', growth: -1.67 },
    { name: 'Viral Patel', region: 'Indian', sales: '12,75,000', tc: 108, pc: 204, avgSales: '976', growth: -0.36 },
    { name: 'Anjali Sharma', region: 'Indian', sales: '12,76,000', tc: 101, pc: 103, avgSales: '976', growth: 4.83 },
    { name: 'Rohan Gupte', region: 'Indian', sales: '12,76,000', tc: 163, pc: 200, avgSales: '978', growth: 5.85 },
    { name: 'Vikram Singh', region: 'Indian', sales: '6,35,009', tc: 103, pc: 192, avgSales: '975', growth: 6.60 },
    { name: 'Neha Verma', region: 'Indian', sales: '5,55,000', tc: 103, pc: 124, avgSales: '975', growth: -6.62 },
    { name: 'Karan Mehta', region: 'Indian', sales: '5,25,000', tc: 100, pc: 124, avgSales: '976', growth: -8.02 }
  ];

  // Category-wise Sales Data
  categoryData: CategoryData[] = [
    { name: 'Bakery', percentage: 32, color: '#8B4513' },
    { name: 'Snacks', percentage: 29, color: '#D2B48C' },
    { name: 'Beverages', percentage: 16, color: '#87CEEB' },
    { name: 'Confectionery', percentage: 15, color: '#4169E1' },
    { name: 'Others', percentage: 16, color: '#90EE90' }
  ];

  // Product-wise Sales Data
  productData: ProductData[] = [
    { brand: 'Lays', category: 'Chips', product: 'Chips', totalQty: 1950, totalSales: '15,3,75,151', contribution: '90.55%' },
    { brand: 'Oreo', category: 'Biscuits', product: 'Biscuits', totalQty: 1638, totalSales: '15,05,500', contribution: '45.30%' },
    { brand: 'Haldiram\'s', category: 'Namkeen', product: 'Namkeen', totalQty: 850, totalSales: '16,15,750', contribution: '20.27%' },
    { brand: 'Dairy Milk', category: 'Chocolate', product: 'Chocolate', totalQty: 392, totalSales: '5,79,300', contribution: '16.25%' },
    { brand: 'Britannia Bread', category: 'Bakery', product: 'Bakery', totalQty: 844, totalSales: '15,15,258', contribution: '14.82%' },
    { brand: 'Kurkure', category: 'Snacks', product: 'Snacks', totalQty: 632, totalSales: '5,75,890', contribution: '14.26%' },
    { brand: 'Coca-Cola', category: 'Beverages', product: 'Beverages', totalQty: 323, totalSales: '5,76,500', contribution: '18.72%' },
    { brand: 'Cadbury', category: 'Confectionery', product: 'Confectionery', totalQty: 254, totalSales: '5,25,300', contribution: '13.35%' }
  ];

  // Calculate donut chart segment data
  getCategoryChartSegments() {
    const radius = 60;
    const circumference = 2 * Math.PI * radius;
    let offset = 0;
    
    return this.categoryData.map((cat) => {
      const strokeDasharray = (cat.percentage / 100) * circumference;
      const strokeDashoffset = -offset;
      offset += strokeDasharray;
      
      return {
        ...cat,
        strokeDasharray: `${strokeDasharray} ${circumference}`,
        strokeDashoffset: strokeDashoffset
      };
    });
  }

  selectPeriod(period: string) {
    this.selectedPeriod = period;
  }

  exportExcel() {
    console.log('Exporting to Excel...');
  }

  // Get limited RSM data
  get displayedRSMData(): RSMData[] {
    return this.showAllRSM ? this.rsmData : this.rsmData.slice(0, 5);
  }

  // Get limited Product data
  get displayedProductData(): ProductData[] {
    return this.showAllProducts ? this.productData : this.productData.slice(0, 5);
  }

  // Check if there are more rows to show
  get hasMoreRSM(): boolean {
    return this.rsmData.length > 5;
  }

  get hasMoreProducts(): boolean {
    return this.productData.length > 5;
  }

  toggleRSMView() {
    this.showAllRSM = !this.showAllRSM;
  }

  toggleProductView() {
    this.showAllProducts = !this.showAllProducts;
  }
}

