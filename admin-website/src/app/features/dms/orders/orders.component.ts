import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { DmsSidebarComponent } from '../components/dms-sidebar/dms-sidebar.component';
import { HeaderComponent } from '../../../core/layout/header/header.component';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { TallyService } from '../../tally/services/tally.service';

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
  syncingToTally = false;
  testOrderLineItems: any[] = [];

  constructor(
    private router: Router,
    private tallyService: TallyService
  ) {}

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
    
    // Load real ledger accounts from Tally and create a test order
    this.loadTallyLedgersAndCreateTestOrder();
  }

  loadTallyLedgersAndCreateTestOrder(): void {
    // Load both ledgers and stock items
    this.tallyService.getAllLedgers().subscribe({
      next: (ledgers) => {
        if (ledgers && ledgers.length > 0) {
          // Find a suitable ledger (preferably a party/customer ledger, not system ledgers)
          const suitableLedgers = ledgers.filter(ledger => {
            const name = (ledger.name || ledger['NAME'] || '').toLowerCase();
            // Exclude system ledgers like Cash, Sales, etc.
            return !name.includes('cash') && 
                   !name.includes('sales') && 
                   !name.includes('purchase') &&
                   !name.includes('bank') &&
                   !name.includes('cheque') &&
                   !name.includes('credit note') &&
                   !name.includes('upi') &&
                   !name.includes('prepaid');
          });
          
          const testLedger = suitableLedgers.length > 0 
            ? suitableLedgers[0] 
            : ledgers[0];
          
          const ledgerName = testLedger.name || testLedger['NAME'] || 'Test Party';
          
          // Now load stock items to add to the test order
          this.tallyService.getAllStockItems().subscribe({
            next: (stockItems) => {
              this.createTestOrderWithItems(ledgerName, stockItems);
            },
            error: (error) => {
              console.error('Error loading stock items:', error);
              // Create test order without stock items if stock fetch fails
              this.createTestOrderWithItems(ledgerName, []);
            }
          });
        } else {
          console.warn('No ledgers found in Tally. Using default test order.');
        }
      },
      error: (error) => {
        console.error('Error loading Tally ledgers:', error);
        // Continue with default orders if Tally is not available
      }
    });
  }

  createTestOrderWithItems(ledgerName: string, stockItems: any[]): void {
    // Select first few stock items for the test order
    let testLineItems: any[] = [];
    
    if (stockItems && stockItems.length > 0) {
      // Take first 3-5 stock items for the test order
      const itemsToUse = stockItems.slice(0, Math.min(5, stockItems.length));
      
      testLineItems = itemsToUse.map((item, index) => {
        const itemName = item.name || item['NAME'] || item.stockItemName || item['STOCKITEMNAME'] || `Item ${index + 1}`;
        // Use reasonable default quantities and rates
        return {
          productName: itemName,
          quantity: (index + 1) * 10, // 10, 20, 30, etc.
          unitPrice: (index + 1) * 50 // 50, 100, 150, etc.
        };
      });
    } else {
      // Fallback to default test items if no stock items available
      testLineItems = [
        {
          productName: 'ASSORTED CRUNCH 18061000',
          quantity: 10,
          unitPrice: 100.00
        },
        {
          productName: '403 C-1KG 48191010',
          quantity: 5,
          unitPrice: 200.00
        }
      ];
    }
    
    // Calculate total
    const orderTotal = testLineItems.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
    
    // Create a test order with real ledger account and stock items
    const testOrder: SuperStockistOrder = {
      id: 999, // Use a high ID to avoid conflicts
      orderId: `TEST-SYNC-${new Date().getTime().toString().slice(-6)}`,
      superStockistName: ledgerName,
      area: 'Test Area - Real Tally Ledger',
      orderDate: this.formatDate(new Date()),
      orderTotal: orderTotal,
      status: 'Pending',
      selected: false
    };
    
    // Store test line items for this order
    this.testOrderLineItems = testLineItems;
    
    // Add test order to the beginning of the orders array
    this.orders.unshift(testOrder);
    this.filteredOrders = [...this.orders];
    
    console.log('Test order created with Tally ledger:', ledgerName);
    console.log('Test order line items:', testLineItems);
  }

  formatDate(date: Date): string {
    if (!date) {
      const now = new Date();
      const year = now.getFullYear();
      const month = String(now.getMonth() + 1).padStart(2, '0');
      const day = String(now.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    }
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
    this.onSyncWithTally();
  }

  onSyncWithTally(): void {
    if (this.selectedOrders.size === 0) {
      return;
    }

    const selectedOrderIds = Array.from(this.selectedOrders);
    const selectedOrdersData = this.orders.filter(order => selectedOrderIds.includes(order.id));

    if (selectedOrdersData.length === 0) {
      return;
    }

    this.syncingToTally = true;

    // Create sales orders in Tally for each selected order
    const syncPromises = selectedOrdersData.map(order => {
      // Load order details if not already loaded
      const lineItems = this.getOrderLineItems(order.id);
      
      // If no line items, try to load them
      if (lineItems.length === 0) {
        this.loadOrderDetails(order.id);
        // Use the loaded orderLineItems
        const loadedItems = this.orderLineItems.map(item => ({
          productName: item.productName,
          quantity: item.orderedQty,
          unitPrice: item.unitPrice
        }));
        
        if (loadedItems.length > 0) {
          return this.tallyService.createSalesOrder({
            orderId: order.orderId,
            partyName: order.superStockistName,
            orderDate: order.orderDate,
            orderTotal: order.orderTotal,
            lineItems: loadedItems
          }).toPromise();
        }
      }
      
      return this.tallyService.createSalesOrder({
        orderId: order.orderId,
        partyName: order.superStockistName,
        orderDate: order.orderDate,
        orderTotal: order.orderTotal,
        lineItems: lineItems
      }).toPromise();
    });

    Promise.all(syncPromises)
      .then(results => {
        const successCount = results.filter(r => r?.success).length;
        const failCount = results.length - successCount;
        
        if (successCount > 0) {
          alert(`Successfully synced ${successCount} order(s) to Tally${failCount > 0 ? `. ${failCount} order(s) failed.` : ''}`);
          // Clear selection after successful sync
          this.onClearSelection();
        } else {
          alert(`Failed to sync orders to Tally. Please check the console for details.`);
        }
        this.syncingToTally = false;
      })
      .catch(error => {
        console.error('Error syncing to Tally:', error);
        alert('Error syncing orders to Tally. Please try again.');
        this.syncingToTally = false;
      });
  }

  getOrderLineItems(orderId: number): any[] {
    // Get line items for the order
    // Use the orderLineItems if available, otherwise return empty array
    // In production, this should fetch from API based on orderId
    
    // If order details are already loaded for this order
    if (this.selectedOrder && this.selectedOrder.id === orderId && this.orderLineItems.length > 0) {
      return this.orderLineItems.map(item => ({
        productName: item.productName,
        quantity: item.orderedQty,
        unitPrice: item.unitPrice
      }));
    }
    
    // For test order (ID 999), return test line items from Tally stock items
    if (orderId === 999) {
      return this.testOrderLineItems.length > 0 
        ? this.testOrderLineItems 
        : [
            {
              productName: 'ASSORTED CRUNCH 18061000',
              quantity: 10,
              unitPrice: 100.00
            },
            {
              productName: '403 C-1KG 48191010',
              quantity: 5,
              unitPrice: 200.00
            }
          ];
    }
    
    // For order ID 1, return mock data
    if (orderId === 1) {
      return [
        {
          productName: 'Premium Coffee Beans 1kg',
          quantity: 50,
          unitPrice: 250.00
        },
        {
          productName: 'Organic Tea Selection Box',
          quantity: 30,
          unitPrice: 150.00
        },
        {
          productName: 'Gourmet Chocolate Bar',
          quantity: 100,
          unitPrice: 50.00
        }
      ];
    }
    
    // Fallback: return empty array - in production, make API call to fetch order details
    return [];
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

