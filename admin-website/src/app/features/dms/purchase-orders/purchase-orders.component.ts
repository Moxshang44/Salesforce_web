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

interface LineItem {
  id: number;
  sku: string;
  description: string;
  quantity: number;
  unitPrice: number;
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
  showPlaceOrderModal = false;
  
  // Place Order Form Properties
  selectedSuperStockist = '';
  expectedDeliveryDate = '';
  deliveryNote = '';
  selectedSku = '';
  newItemQuantity = 10;
  lineItems: LineItem[] = [];
  taxRate = 0.05; // 5%

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

  superStockists = [
    'Prime Distributors Ltd',
    'Global Supply Chain',
    'Mega Wholesale Corp',
    'Elite Trading Co',
    'Premium Distributors'
  ];

  skuOptions = [
    { value: 'SKU-1001', label: 'SKU-1001 - Premium Coffee Beans 1kg' },
    { value: 'SKU-1002', label: 'SKU-1002 - Premium Coffee Beans 2kg' },
    { value: 'SKU-1003', label: 'SKU-1003 - Premium Coffee 1kg' },
    { value: 'SKU-1004', label: 'SKU-1004 - Organic Tea Selection Box' },
    { value: 'SKU-1005', label: 'SKU-1005 - Gourmet Chocolate Bar' }
  ];

  skuDescriptions: { [key: string]: string } = {
    'SKU-1001': 'Premium Coffee Beans 1kg',
    'SKU-1002': 'Premium Coffee Beans 2kg',
    'SKU-1003': 'Premium Coffee 1kg',
    'SKU-1004': 'Organic Tea Selection Box',
    'SKU-1005': 'Gourmet Chocolate Bar'
  };

  skuPrices: { [key: string]: number } = {
    'SKU-1001': 15.00,
    'SKU-1002': 15.00,
    'SKU-1003': 10.00,
    'SKU-1004': 25.00,
    'SKU-1005': 8.00
  };

  ngOnInit() {
    this.filteredPurchaseOrders = this.purchaseOrders;
    // Set default delivery date to tomorrow
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    this.expectedDeliveryDate = this.formatDateInput(tomorrow);
  }

  formatDateInput(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
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
    this.showPlaceOrderModal = true;
    this.resetPlaceOrderForm();
  }

  closePlaceOrderModal(): void {
    this.showPlaceOrderModal = false;
    this.resetPlaceOrderForm();
  }

  resetPlaceOrderForm(): void {
    this.selectedSuperStockist = '';
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    this.expectedDeliveryDate = this.formatDateInput(tomorrow);
    this.deliveryNote = '';
    this.selectedSku = '';
    this.newItemQuantity = 10;
    this.lineItems = [];
  }

  onAddLineItem(): void {
    if (!this.selectedSku) {
      return;
    }

    const existingItem = this.lineItems.find(item => item.sku === this.selectedSku);
    if (existingItem) {
      existingItem.quantity += this.newItemQuantity;
    } else {
      const newItem: LineItem = {
        id: Date.now(),
        sku: this.selectedSku,
        description: this.skuDescriptions[this.selectedSku] || '',
        quantity: this.newItemQuantity,
        unitPrice: this.skuPrices[this.selectedSku] || 0
      };
      this.lineItems.push(newItem);
    }

    // Reset form
    this.selectedSku = '';
    this.newItemQuantity = 10;
  }

  onRemoveLineItem(itemId: number): void {
    this.lineItems = this.lineItems.filter(item => item.id !== itemId);
  }

  getSubtotal(): number {
    return this.lineItems.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
  }

  getTax(): number {
    return this.getSubtotal() * this.taxRate;
  }

  getTotal(): number {
    return this.getSubtotal() + this.getTax();
  }

  onPlaceOrder(): void {
    console.log('Place Order', {
      superStockist: this.selectedSuperStockist,
      deliveryDate: this.expectedDeliveryDate,
      deliveryNote: this.deliveryNote,
      lineItems: this.lineItems,
      total: this.getTotal()
    });
    // Handle place order logic
    this.closePlaceOrderModal();
  }

  onSaveDraft(): void {
    console.log('Save Draft', {
      superStockist: this.selectedSuperStockist,
      deliveryDate: this.expectedDeliveryDate,
      deliveryNote: this.deliveryNote,
      lineItems: this.lineItems
    });
    // Handle save draft logic
    this.closePlaceOrderModal();
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

  onEditPO(po: PurchaseOrder): void {
    console.log('Edit purchase order:', po);
    // TODO: Implement edit functionality
    // You can open an edit modal or navigate to an edit page
  }

  onDeletePO(po: PurchaseOrder): void {
    console.log('Delete purchase order:', po);
    // TODO: Implement delete functionality with confirmation
    if (confirm(`Are you sure you want to delete purchase order ${po.poNo}?`)) {
      // Handle deletion
      const index = this.purchaseOrders.findIndex(p => p.id === po.id);
      if (index > -1) {
        this.purchaseOrders.splice(index, 1);
        this.applyFilters(); // Refresh filtered list
      }
    }
  }
}

