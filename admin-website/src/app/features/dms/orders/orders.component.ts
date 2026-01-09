import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { DmsSidebarComponent } from '../components/dms-sidebar/dms-sidebar.component';
import { HeaderComponent } from '../../../core/layout/header/header.component';
import { ButtonComponent } from '../../../shared/components/button/button.component';

interface SuperStockistOrder {
  id: number;
  orderId: string;
  superStockistName: string;
  area: string;
  orderDate: string;
  orderTotal: number;
  status: 'Draft' | 'Pending' | 'Confirmed' | 'Dispatched' | 'Delivered' | 'Cancelled';
  selected: boolean;
}

interface OrderLineItem {
  id: number;
  productName: string;
  orderedQty: number;
  confirmedQty: number;
  pendingQty: number;
  unitPrice: number;
}

@Component({
  selector: 'app-orders',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    DmsSidebarComponent,
    HeaderComponent,
    ButtonComponent
  ],
  templateUrl: './orders.component.html',
  styleUrl: './orders.component.scss'
})
export class OrdersComponent implements OnInit {
  searchQuery = '';
  statusFilter = 'All';
  dateRangeStart = '';
  dateRangeEnd = '';
  exceptionsOnly = false;
  showCreateOrderModal = false;
  selectedOrder: SuperStockistOrder | null = null;
  showSidebar = false;
  selectedOrders: Set<number> = new Set();
  showUnmappedWarning = false;
  unmappedProductsCount = 0;

  constructor(private router: Router) {}

  orders: SuperStockistOrder[] = [
    {
      id: 1,
      orderId: 'ORD-SS-2024-1001',
      superStockistName: 'Prime Distributors Ltd',
      area: 'North Zone',
      orderDate: '2024-10-26',
      orderTotal: 12500.00,
      status: 'Pending',
      selected: false
    },
    {
      id: 2,
      orderId: 'ORD-SS-2024-1002',
      superStockistName: 'Global Supply Chain',
      area: 'Central Zone',
      orderDate: '2024-10-25',
      orderTotal: 18500.50,
      status: 'Confirmed',
      selected: false
    },
    {
      id: 3,
      orderId: 'ORD-SS-2024-1003',
      superStockistName: 'Mega Wholesale Corp',
      area: 'East Zone',
      orderDate: '2024-10-25',
      orderTotal: 22100.75,
      status: 'Pending',
      selected: false
    },
    {
      id: 4,
      orderId: 'ORD-SS-2024-1004',
      superStockistName: 'Elite Trading Co',
      area: 'South Zone',
      orderDate: '2024-10-24',
      orderTotal: 15400.00,
      status: 'Dispatched',
      selected: false
    },
    {
      id: 5,
      orderId: 'ORD-SS-2024-1005',
      superStockistName: 'Premium Distributors',
      area: 'West Zone',
      orderDate: '2024-10-24',
      orderTotal: 9800.20,
      status: 'Draft',
      selected: false
    },
    {
      id: 6,
      orderId: 'ORD-SS-2024-1006',
      superStockistName: 'National Supply Network',
      area: 'North Zone',
      orderDate: '2024-10-23',
      orderTotal: 32000.00,
      status: 'Delivered',
      selected: false
    }
  ];

  filteredOrders: SuperStockistOrder[] = [];
  orderLineItems: OrderLineItem[] = [];

  ngOnInit() {
    // Set default date range (current month)
    const now = new Date();
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    this.dateRangeStart = this.formatDate(firstDay);
    this.dateRangeEnd = this.formatDate(lastDay);
    
    this.filteredOrders = this.orders;
    
    // Check for unmapped products (mock - replace with actual API call)
    this.unmappedProductsCount = 0; // Set to > 0 to show warning
    this.showUnmappedWarning = this.unmappedProductsCount > 0;
  }

  formatDate(date: Date): string {
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

  onExceptionsToggle(): void {
    this.applyFilters();
  }

  applyFilters(): void {
    let filtered = [...this.orders];

    // Apply search filter
    if (this.searchQuery.trim()) {
      const query = this.searchQuery.toLowerCase();
      filtered = filtered.filter(order => 
        order.orderId.toLowerCase().includes(query) ||
        order.superStockistName.toLowerCase().includes(query)
      );
    }

    // Apply status filter
    if (this.statusFilter !== 'All') {
      filtered = filtered.filter(order => order.status === this.statusFilter);
    }

    // Apply date range filter
    if (this.dateRangeStart && this.dateRangeEnd) {
      filtered = filtered.filter(order => {
        const orderDate = new Date(order.orderDate);
        const startDate = new Date(this.dateRangeStart);
        const endDate = new Date(this.dateRangeEnd);
        return orderDate >= startDate && orderDate <= endDate;
      });
    }

    // Apply exceptions filter (orders with issues)
    if (this.exceptionsOnly) {
      filtered = filtered.filter(order => 
        order.status === 'Draft' || order.status === 'Pending'
      );
    }

    this.filteredOrders = filtered;
  }

  onSelectAll(event: Event): void {
    const checked = (event.target as HTMLInputElement).checked;
    this.filteredOrders.forEach(order => {
      order.selected = checked;
      if (checked) {
        this.selectedOrders.add(order.id);
      } else {
        this.selectedOrders.delete(order.id);
      }
    });
  }

  onSelectOrder(order: SuperStockistOrder, event: Event): void {
    const checked = (event.target as HTMLInputElement).checked;
    order.selected = checked;
    if (checked) {
      this.selectedOrders.add(order.id);
    } else {
      this.selectedOrders.delete(order.id);
    }
  }

  isAllSelected(): boolean {
    return this.filteredOrders.length > 0 && 
           this.filteredOrders.every(order => order.selected);
  }

  onViewOrder(order: SuperStockistOrder): void {
    this.selectedOrder = order;
    this.showSidebar = true;
    this.loadOrderDetails(order.id);
  }

  loadOrderDetails(orderId: number): void {
    // Mock data - replace with actual API call
    if (orderId === 1) {
      this.orderLineItems = [
        {
          id: 1,
          productName: 'Premium Coffee Beans 1kg',
          orderedQty: 50,
          confirmedQty: 0,
          pendingQty: 50,
          unitPrice: 250.00
        },
        {
          id: 2,
          productName: 'Organic Tea Selection Box',
          orderedQty: 30,
          confirmedQty: 0,
          pendingQty: 30,
          unitPrice: 150.00
        },
        {
          id: 3,
          productName: 'Gourmet Chocolate Bar',
          orderedQty: 100,
          confirmedQty: 0,
          pendingQty: 100,
          unitPrice: 50.00
        }
      ];
    } else {
      this.orderLineItems = [];
    }
  }

  closeSidebar(): void {
    this.showSidebar = false;
    this.selectedOrder = null;
  }

  onCreateOrder(): void {
    this.showCreateOrderModal = true;
  }

  closeCreateOrderModal(): void {
    this.showCreateOrderModal = false;
  }

  onSyncToTally(): void {
    console.log('Sync to Tally:', Array.from(this.selectedOrders));
    // Handle sync to Tally logic
  }

  onClearSelection(): void {
    this.selectedOrders.clear();
    this.filteredOrders.forEach(order => order.selected = false);
  }

  onSyncThisOrder(): void {
    if (this.selectedOrder) {
      console.log('Sync this order to Tally:', this.selectedOrder.orderId);
      // Handle sync logic
    }
  }

  onCancelPendingItems(): void {
    if (this.selectedOrder) {
      console.log('Cancel pending items for:', this.selectedOrder.orderId);
      // Handle cancel logic
    }
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'Draft':
        return 'status-draft';
      case 'Pending':
        return 'status-pending';
      case 'Confirmed':
        return 'status-confirmed';
      case 'Dispatched':
        return 'status-dispatched';
      case 'Delivered':
        return 'status-delivered';
      case 'Cancelled':
        return 'status-cancelled';
      default:
        return '';
    }
  }

  formatCurrency(amount: number): string {
    return `$${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }

  formatDisplayDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  }

  onExcel(): void {
    console.log('Export to Excel');
    // Handle Excel export logic
  }

  onResolveMappings(): void {
    // Navigate to billing mode page with mapping tab
    this.router.navigate(['/dms/billing-mode'], { queryParams: { tab: 'mapping' } });
  }
}

