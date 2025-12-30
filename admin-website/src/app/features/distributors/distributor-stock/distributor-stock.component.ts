import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { SidebarComponent } from '../../../core/layout/sidebar/sidebar.component';
import { HeaderComponent } from '../../../core/layout/header/header.component';

interface StockItem {
  id: number;
  sku: string;
  productName: string;
  availableQuantity: number;
  unit: string;
  minRequiredStock: number;
  lastPurchase: number;
  lastPurchaseDate: string;
}

@Component({
  selector: 'app-distributor-stock',
  standalone: true,
  imports: [CommonModule, SidebarComponent, HeaderComponent],
  templateUrl: './distributor-stock.component.html',
  styleUrl: './distributor-stock.component.scss'
})
export class DistributorStockComponent implements OnInit {
  distributorId: string | null = null;
  activeTab = 'stocks';
  currentPage = 1;
  totalPages = 2;

  stockItems: StockItem[] = [
    {
      id: 1,
      sku: 'SKU-5433',
      productName: 'Paracetamol 650mg',
      availableQuantity: 8320,
      unit: 'Units',
      minRequiredStock: 800,
      lastPurchase: 500,
      lastPurchaseDate: '10 Aug 2025'
    },
    {
      id: 2,
      sku: 'SKU-JAM-342',
      productName: 'Amoxicillin 500mg',
      availableQuantity: 1200,
      unit: 'Strips',
      minRequiredStock: 600,
      lastPurchase: 300,
      lastPurchaseDate: '15 Aug 2025'
    },
    {
      id: 3,
      sku: 'SKU-3AM-35R',
      productName: 'Metformin 500mg',
      availableQuantity: 850,
      unit: 'Strips',
      minRequiredStock: 400,
      lastPurchase: 200,
      lastPurchaseDate: '22 Sep 2025'
    },
    {
      id: 4,
      sku: 'SKU-SAM-01',
      productName: 'Atorvastatin 10mg',
      availableQuantity: 2100,
      unit: 'Units',
      minRequiredStock: 500,
      lastPurchase: 150,
      lastPurchaseDate: '05 Oct 2025'
    },
    {
      id: 5,
      sku: 'SKU-093-45',
      productName: 'Cough Syrup 100ml',
      availableQuantity: 210,
      unit: 'Bottles',
      minRequiredStock: 100,
      lastPurchase: 160,
      lastPurchaseDate: '18 Aug 2025'
    },
    {
      id: 6,
      sku: 'SKU-OABC-76',
      productName: 'Ibuprofen 400mg',
      availableQuantity: 900,
      unit: 'Units',
      minRequiredStock: 750,
      lastPurchase: 400,
      lastPurchaseDate: '01 Sep 2025'
    },
    {
      id: 7,
      sku: 'SKU-78',
      productName: 'Levothyroxine 0.1mg',
      availableQuantity: 450,
      unit: 'Units',
      minRequiredStock: 300,
      lastPurchase: 150,
      lastPurchaseDate: '12 Sep 2025'
    },
    {
      id: 8,
      sku: 'SKU-G1',
      productName: 'Omeprazole 20mg',
      availableQuantity: 1,
      unit: 'Units',
      minRequiredStock: 600,
      lastPurchase: 200,
      lastPurchaseDate: '20 Sep 2025'
    },
    {
      id: 9,
      sku: 'SKU-G-63',
      productName: 'Azithromycin 500mg',
      availableQuantity: 700,
      unit: 'Units',
      minRequiredStock: 400,
      lastPurchase: 180,
      lastPurchaseDate: '28 Sep 2025'
    },
    {
      id: 10,
      sku: 'SKU-AABC-201',
      productName: 'Multivitamin Tablets',
      availableQuantity: 1,
      unit: 'Units',
      minRequiredStock: 600,
      lastPurchase: 300,
      lastPurchaseDate: '05 Oct 2025'
    }
  ];

  constructor(
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.distributorId = this.route.snapshot.paramMap.get('id');
  }

  setActiveTab(tab: string): void {
    this.activeTab = tab;
  }

  onFilter(): void {
    console.log('Filter clicked');
  }

  onExcel(): void {
    console.log('Excel export clicked');
  }

  onEdit(item: StockItem): void {
    console.log('Edit stock item:', item);
  }

  onDelete(item: StockItem): void {
    console.log('Delete stock item:', item);
  }

  incrementStock(item: StockItem): void {
    item.minRequiredStock += 1;
  }

  decrementStock(item: StockItem): void {
    if (item.minRequiredStock > 0) {
      item.minRequiredStock -= 1;
    }
  }

  goBack(): void {
    this.router.navigate(['/distributors']);
  }
}
