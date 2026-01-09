import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DmsSidebarComponent } from '../components/dms-sidebar/dms-sidebar.component';
import { HeaderComponent } from '../../../core/layout/header/header.component';
import { ButtonComponent } from '../../../shared/components/button/button.component';

interface PurchaseOrder {
  id: number;
  poNo: string;
  supplier: string;
  totalQty: number;
  totalValue: number;
  status: 'Draft' | 'Sent' | 'Partially Received' | 'Received' | 'Cancelled';
  createdDate: string;
  expectedDate: string;
}

interface POItem {
  id: number;
  itemNo: string;
  description: string;
  orderedQty: number;
  receivedQty: number;
  pendingQty: number;
  unitPrice: number;
  totalPrice: number;
}

@Component({
  selector: 'app-purchase-orders',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    DmsSidebarComponent,
    HeaderComponent,
    ButtonComponent
  ],
  templateUrl: './purchase-orders.component.html',
  styleUrl: './purchase-orders.component.scss'
})
export class PurchaseOrdersComponent implements OnInit {
  searchQuery = '';
  statusFilter = 'All Statuses';
  dateRangeFilter = 'Last 30 days';
  selectedPO: PurchaseOrder | null = null;
  showSidebar = false;

  purchaseOrders: PurchaseOrder[] = [
    {
      id: 1,
      poNo: 'PO-20231001',
      supplier: 'Acme Supplies',
      totalQty: 120,
      totalValue: 2400.00,
      status: 'Draft',
      createdDate: '2023-10-27',
      expectedDate: '2023-11-03'
    },
    {
      id: 2,
      poNo: 'PO-20231002',
      supplier: 'Global Electronics',
      totalQty: 50,
      totalValue: 5000.00,
      status: 'Sent',
      createdDate: '2023-10-26',
      expectedDate: '2023-11-02'
    },
    {
      id: 3,
      poNo: 'PO-20231003',
      supplier: 'Reliable Parts Co.',
      totalQty: 200,
      totalValue: 1200.00,
      status: 'Partially Received',
      createdDate: '2023-10-25',
      expectedDate: '2023-11-01'
    },
    {
      id: 4,
      poNo: 'PO-20231004',
      supplier: 'Best Goods',
      totalQty: 100,
      totalValue: 3500.00,
      status: 'Received',
      createdDate: '2023-10-24',
      expectedDate: '2023-10-31'
    },
    {
      id: 5,
      poNo: 'PO-20231005',
      supplier: 'Fast Distributors',
      totalQty: 30,
      totalValue: 900.00,
      status: 'Cancelled',
      createdDate: '2023-10-23',
      expectedDate: ''
    }
  ];

  filteredPurchaseOrders: PurchaseOrder[] = [];
  poItems: POItem[] = [];

  ngOnInit() {
    this.filteredPurchaseOrders = this.purchaseOrders;
  }

  onSearch(): void {
    this.applyFilters();
  }

  onStatusFilterChange(): void {
    this.applyFilters();
  }

  onDateRangeChange(): void {
    this.applyFilters();
  }

  applyFilters(): void {
    let filtered = [...this.purchaseOrders];

    // Apply search filter
    if (this.searchQuery.trim()) {
      const query = this.searchQuery.toLowerCase();
      filtered = filtered.filter(po => 
        po.poNo.toLowerCase().includes(query) ||
        po.supplier.toLowerCase().includes(query)
      );
    }

    // Apply status filter
    if (this.statusFilter !== 'All Statuses') {
      filtered = filtered.filter(po => po.status === this.statusFilter);
    }

    // Apply date range filter (simplified - in real app, calculate actual date range)
    if (this.dateRangeFilter === 'Last 30 days') {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      filtered = filtered.filter(po => {
        const createdDate = new Date(po.createdDate);
        return createdDate >= thirtyDaysAgo;
      });
    }

    this.filteredPurchaseOrders = filtered;
  }

  onViewPO(po: PurchaseOrder): void {
    this.selectedPO = po;
    this.showSidebar = true;
    this.loadPODetails(po.id);
  }

  loadPODetails(poId: number): void {
    // Mock data - replace with actual API call
    if (poId === 3) {
      this.poItems = [
        {
          id: 1,
          itemNo: 'LI-101',
          description: 'Widget A',
          orderedQty: 100,
          receivedQty: 50,
          pendingQty: 50,
          unitPrice: 5.00,
          totalPrice: 500.00
        },
        {
          id: 2,
          itemNo: 'LI-102',
          description: 'Gadget B',
          orderedQty: 50,
          receivedQty: 50,
          pendingQty: 0,
          unitPrice: 8.00,
          totalPrice: 400.00
        },
        {
          id: 3,
          itemNo: 'LI-103',
          description: 'Tool C',
          orderedQty: 50,
          receivedQty: 50,
          pendingQty: 0,
          unitPrice: 6.00,
          totalPrice: 300.00
        }
      ];
    } else {
      this.poItems = [];
    }
  }

  closeSidebar(): void {
    this.showSidebar = false;
    this.selectedPO = null;
    this.poItems = [];
  }

  onCreatePO(): void {
    console.log('Create PO');
    // Handle create PO logic
  }

  onMarkReceived(): void {
    if (this.selectedPO) {
      console.log('Mark Received for:', this.selectedPO.poNo);
      // Handle mark received logic
    }
  }

  onCancelPO(): void {
    if (this.selectedPO) {
      console.log('Cancel PO:', this.selectedPO.poNo);
      // Handle cancel PO logic
    }
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'Draft':
        return 'status-draft';
      case 'Sent':
        return 'status-sent';
      case 'Partially Received':
        return 'status-partial';
      case 'Received':
        return 'status-received';
      case 'Cancelled':
        return 'status-cancelled';
      default:
        return '';
    }
  }

  formatCurrency(amount: number): string {
    return `$${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }

  formatDate(dateString: string): string {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: '2-digit', day: '2-digit' });
  }

  onExcel(): void {
    console.log('Export to Excel');
    // Handle Excel export logic
  }
}

