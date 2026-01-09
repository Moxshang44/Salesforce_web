import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { DmsSidebarComponent } from '../components/dms-sidebar/dms-sidebar.component';
import { HeaderComponent } from '../../../core/layout/header/header.component';
import { ButtonComponent } from '../../../shared/components/button/button.component';

interface StockItem {
  id: number;
  sku: string;
  bucket: 'Salable' | 'Damaged' | 'Sample' | 'Expired';
  qty: number;
  status: 'approved' | 'Low' | 'OK';
  statusTimestamp?: string;
  mappingStatus: 'Mapped' | 'Unmapped';
}

interface BucketBreakdown {
  salable: number;
  damaged: number;
  sample: number;
  expired: number;
}

interface RecentMovement {
  id: number;
  type: 'Stock In' | 'Adjustment' | 'Order Fulfillment';
  amount: number;
  reference: string;
  timestamp: string;
}

@Component({
  selector: 'app-stock',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    DmsSidebarComponent,
    HeaderComponent,
    ButtonComponent
  ],
  templateUrl: './stock.component.html',
  styleUrl: './stock.component.scss'
})
export class StockComponent implements OnInit {
  searchQuery = '';
  bucketFilter = 'All';
  lowStockOnly = false;
  selectedSku: StockItem | null = null;
  showSidebar = false;
  showUnmappedWarning = true;
  unmappedProductsCount = 5;
  lastUpdated = '2 hours ago';

  stockItems: StockItem[] = [
    {
      id: 1,
      sku: 'SKU-1001',
      bucket: 'Salable',
      qty: 1250,
      status: 'approved',
      mappingStatus: 'Mapped'
    },
    {
      id: 2,
      sku: 'SKU-1002',
      bucket: 'Damaged',
      qty: 45,
      status: 'Low',
      statusTimestamp: 'Yesterday, 4:15 PM',
      mappingStatus: 'Mapped'
    },
    {
      id: 3,
      sku: 'SKU-1003',
      bucket: 'Salable',
      qty: 800,
      status: 'OK',
      statusTimestamp: 'Today, 9:00 AM',
      mappingStatus: 'Unmapped'
    },
    {
      id: 4,
      sku: 'SKU-1004',
      bucket: 'Expired',
      qty: 120,
      status: 'Low',
      statusTimestamp: '2 days ago',
      mappingStatus: 'Mapped'
    },
    {
      id: 5,
      sku: 'SKU-1005',
      bucket: 'Sample',
      qty: 50,
      status: 'OK',
      statusTimestamp: 'Today, 11:45 AM',
      mappingStatus: 'Mapped'
    },
    {
      id: 6,
      sku: 'SKU-1006',
      bucket: 'Salable',
      qty: 3200,
      status: 'OK',
      statusTimestamp: 'Today, 8:30 AM',
      mappingStatus: 'Mapped'
    },
    {
      id: 7,
      sku: 'SKU-1007',
      bucket: 'Salable',
      qty: 150,
      status: 'Low',
      statusTimestamp: 'Yesterday, 2:00 PM',
      mappingStatus: 'Unmapped'
    }
  ];

  filteredStockItems: StockItem[] = [];
  bucketBreakdown: BucketBreakdown | null = null;
  recentMovements: RecentMovement[] = [];
  selectedSkuDetails: {
    productName: string;
    category: string;
    unit: string;
  } | null = null;

  constructor(private router: Router) {}

  ngOnInit() {
    this.filteredStockItems = this.stockItems;
  }

  onSearch(): void {
    this.applyFilters();
  }

  onBucketFilterChange(): void {
    this.applyFilters();
  }

  onLowStockToggle(): void {
    this.applyFilters();
  }

  applyFilters(): void {
    let filtered = [...this.stockItems];

    // Apply search filter
    if (this.searchQuery.trim()) {
      const query = this.searchQuery.toLowerCase();
      filtered = filtered.filter(item => 
        item.sku.toLowerCase().includes(query)
      );
    }

    // Apply bucket filter
    if (this.bucketFilter !== 'All') {
      filtered = filtered.filter(item => item.bucket === this.bucketFilter);
    }

    // Apply low stock filter
    if (this.lowStockOnly) {
      filtered = filtered.filter(item => item.status === 'Low');
    }

    this.filteredStockItems = filtered;
  }

  onViewSku(item: StockItem): void {
    this.selectedSku = item;
    this.showSidebar = true;
    this.loadSkuDetails(item.sku);
  }

  loadSkuDetails(sku: string): void {
    // Mock data - replace with actual API call
    if (sku === 'SKU-1003') {
      this.selectedSkuDetails = {
        productName: 'Premium Coffee Beans',
        category: 'Beverages',
        unit: 'kg'
      };

      this.bucketBreakdown = {
        salable: 800,
        damaged: 10,
        sample: 5,
        expired: 0
      };

      this.recentMovements = [
        {
          id: 1,
          type: 'Stock In',
          amount: 200,
          reference: 'PO-5543',
          timestamp: 'Today, 9:00 AM'
        },
        {
          id: 2,
          type: 'Adjustment',
          amount: -10,
          reference: 'Damaged',
          timestamp: 'Yesterday, 3:30 PM'
        },
        {
          id: 3,
          type: 'Order Fulfillment',
          amount: -50,
          reference: 'ORD-9876',
          timestamp: '2 days ago'
        }
      ];
    } else {
      // Default data for other SKUs
      this.selectedSkuDetails = {
        productName: 'Product Name',
        category: 'Category',
        unit: 'unit'
      };
      this.bucketBreakdown = {
        salable: this.selectedSku?.qty || 0,
        damaged: 0,
        sample: 0,
        expired: 0
      };
      this.recentMovements = [];
    }
  }

  closeSidebar(): void {
    this.showSidebar = false;
    this.selectedSku = null;
    this.bucketBreakdown = null;
    this.recentMovements = [];
    this.selectedSkuDetails = null;
  }

  onRequestAdjustment(): void {
    console.log('Request Adjustment');
    // Handle request adjustment logic
  }

  onResolveMappings(): void {
    this.router.navigate(['/dms/billing-mode'], { queryParams: { tab: 'mapping' } });
  }

  onCreateAdjustmentRequest(): void {
    console.log('Create adjustment request for:', this.selectedSku?.sku);
    // Handle create adjustment request logic
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'approved':
        return 'status-approved';
      case 'Low':
        return 'status-low';
      case 'OK':
        return 'status-ok';
      default:
        return '';
    }
  }

  getMappingStatusClass(status: string): string {
    return status === 'Mapped' ? 'mapping-mapped' : 'mapping-unmapped';
  }

  getTotalQuantity(): number {
    if (!this.bucketBreakdown) return 0;
    return this.bucketBreakdown.salable + 
           this.bucketBreakdown.damaged + 
           this.bucketBreakdown.sample + 
           this.bucketBreakdown.expired;
  }

  getBucketPercentage(bucket: keyof BucketBreakdown): number {
    if (!this.bucketBreakdown) return 0;
    const total = this.getTotalQuantity();
    if (total === 0) return 0;
    return (this.bucketBreakdown[bucket] / total) * 100;
  }

  formatNumber(num: number): string {
    return num.toLocaleString('en-US');
  }

  onExcel(): void {
    console.log('Export to Excel');
    // Handle Excel export logic
  }

  onActionMenu(event: Event, item: StockItem): void {
    event.stopPropagation();
    console.log('Action menu for:', item.sku);
    // Handle action menu logic
  }
}

