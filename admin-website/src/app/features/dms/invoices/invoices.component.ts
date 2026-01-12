import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { DmsSidebarComponent } from '../components/dms-sidebar/dms-sidebar.component';
import { HeaderComponent } from '../../../core/layout/header/header.component';
import { ButtonComponent } from '../../../shared/components/button/button.component';

interface Invoice {
  id: number;
  invoiceNo: string;
  retailer: string;
  invoiceDate: string;
  total: number;
  source: 'NATIVE' | 'TALLY';
  matchStatus: 'Matched' | 'Partial' | 'Unmatched';
  deliveryStatus: 'Delivered' | 'Pending' | 'In Transit';
  linkedOrders: number;
}

interface InvoiceLineItem {
  id: number;
  productName: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

interface MatchingSuggestion {
  id: number;
  orderId: string;
  retailer: string;
  amount: number;
  date: string;
}

@Component({
  selector: 'app-invoices',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    DmsSidebarComponent,
    HeaderComponent,
    ButtonComponent
  ],
  templateUrl: './invoices.component.html',
  styleUrl: './invoices.component.scss'
})
export class InvoicesComponent implements OnInit {
  activeTab: 'All' | 'Exceptions' = 'All';
  searchQuery = '';
  matchStatusFilter = 'All';
  deliveryStatusFilter = 'All';
  sourceFilter = 'All';
  dateRangeStart = '';
  dateRangeEnd = '';
  selectedInvoice: Invoice | null = null;
  showSidebar = false;
  showLinkModal = false;
  linkStep: 1 | 2 | 3 = 1;
  linkMethod: 'auto' | 'manual' | 'ai' = 'auto';

  invoices: Invoice[] = [
    {
      id: 1,
      invoiceNo: 'INV-2023-0987',
      retailer: 'Apex Distributors',
      invoiceDate: '2023-10-25',
      total: 1250.00,
      source: 'TALLY',
      matchStatus: 'Unmatched',
      deliveryStatus: 'Delivered',
      linkedOrders: 0
    },
    {
      id: 2,
      invoiceNo: 'INV-2023-0988',
      retailer: 'Apex Distributors',
      invoiceDate: '2023-10-25',
      total: 1250.00,
      source: 'TALLY',
      matchStatus: 'Partial',
      deliveryStatus: 'Delivered',
      linkedOrders: 1
    },
    {
      id: 3,
      invoiceNo: 'INV-2023-0989',
      retailer: 'Apex Distributors',
      invoiceDate: '2023-10-25',
      total: 1250.00,
      source: 'TALLY',
      matchStatus: 'Matched',
      deliveryStatus: 'Delivered',
      linkedOrders: 2
    },
    {
      id: 4,
      invoiceNo: 'INV-2023-0990',
      retailer: 'Apex Distributors',
      invoiceDate: '2023-10-25',
      total: 1250.00,
      source: 'TALLY',
      matchStatus: 'Unmatched',
      deliveryStatus: 'Delivered',
      linkedOrders: 0
    },
    {
      id: 5,
      invoiceNo: 'INV-2023-0986',
      retailer: 'City Mart',
      invoiceDate: '2023-10-24',
      total: 850.50,
      source: 'NATIVE',
      matchStatus: 'Partial',
      deliveryStatus: 'Delivered',
      linkedOrders: 1
    },
    {
      id: 6,
      invoiceNo: 'INV-2023-0985',
      retailer: 'Green Valley Grocers',
      invoiceDate: '2023-10-23',
      total: 2100.75,
      source: 'TALLY',
      matchStatus: 'Matched',
      deliveryStatus: 'Delivered',
      linkedOrders: 2
    },
    {
      id: 7,
      invoiceNo: 'INV-2023-0984',
      retailer: 'Metro Supermarket',
      invoiceDate: '2023-10-22',
      total: 3400.00,
      source: 'NATIVE',
      matchStatus: 'Unmatched',
      deliveryStatus: 'Pending',
      linkedOrders: 0
    },
    {
      id: 8,
      invoiceNo: 'INV-2023-0983',
      retailer: 'Cornerstone Retail',
      invoiceDate: '2023-10-21',
      total: 620.20,
      source: 'TALLY',
      matchStatus: 'Partial',
      deliveryStatus: 'In Transit',
      linkedOrders: 1
    }
  ];

  filteredInvoices: Invoice[] = [];
  invoiceLineItems: InvoiceLineItem[] = [];
  matchingSuggestions: MatchingSuggestion[] = [];

  // Summary metrics
  unmatchedCount = 48;
  partialMatchesCount = 12;
  overBilledCount = 5;

  constructor(
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    // Set default date range (current month)
    const now = new Date();
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    this.dateRangeStart = this.formatDate(firstDay);
    this.dateRangeEnd = this.formatDate(lastDay);

    // Check for query params
    this.route.queryParams.subscribe(params => {
      if (params['match'] === 'UNMATCHED') {
        this.matchStatusFilter = 'Unmatched';
        this.activeTab = 'Exceptions';
      }
      if (params['status'] === 'OVER_BILLED') {
        this.activeTab = 'Exceptions';
      }
    });

    this.applyFilters();
  }

  formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  setActiveTab(tab: 'All' | 'Exceptions'): void {
    this.activeTab = tab;
    this.applyFilters();
  }

  onSearch(): void {
    this.applyFilters();
  }

  onFilterChange(): void {
    this.applyFilters();
  }

  applyFilters(): void {
    let filtered = [...this.invoices];

    // Apply tab filter
    if (this.activeTab === 'Exceptions') {
      filtered = filtered.filter(inv => 
        inv.matchStatus === 'Unmatched' || 
        inv.matchStatus === 'Partial' ||
        inv.total < 0 // Over-billed
      );
    }

    // Apply search filter
    if (this.searchQuery.trim()) {
      const query = this.searchQuery.toLowerCase();
      filtered = filtered.filter(inv => 
        inv.invoiceNo.toLowerCase().includes(query) ||
        inv.retailer.toLowerCase().includes(query)
      );
    }

    // Apply match status filter
    if (this.matchStatusFilter !== 'All') {
      filtered = filtered.filter(inv => inv.matchStatus === this.matchStatusFilter);
    }

    // Apply delivery status filter
    if (this.deliveryStatusFilter !== 'All') {
      filtered = filtered.filter(inv => inv.deliveryStatus === this.deliveryStatusFilter);
    }

    // Apply source filter
    if (this.sourceFilter !== 'All') {
      filtered = filtered.filter(inv => inv.source === this.sourceFilter);
    }

    // Apply date range filter
    if (this.dateRangeStart && this.dateRangeEnd) {
      filtered = filtered.filter(inv => {
        const invDate = new Date(inv.invoiceDate);
        const startDate = new Date(this.dateRangeStart);
        const endDate = new Date(this.dateRangeEnd);
        return invDate >= startDate && invDate <= endDate;
      });
    }

    this.filteredInvoices = filtered;
  }

  onViewInvoice(invoice: Invoice): void {
    this.selectedInvoice = invoice;
    this.showSidebar = true;
    this.loadInvoiceDetails(invoice.id);
  }

  loadInvoiceDetails(invoiceId: number): void {
    // Mock data - replace with actual API call
    const invoice = this.invoices.find(inv => inv.id === invoiceId);
    if (invoice) {
      // Load line items for all invoices
      this.invoiceLineItems = [
        {
          id: 1,
          productName: 'Product A',
          quantity: 10,
          unitPrice: 50.00,
          total: 500.00
        },
        {
          id: 2,
          productName: 'Product B',
          quantity: 5,
          unitPrice: 150.00,
          total: 750.00
        }
      ];

      // Show matching suggestions only for unmatched invoices
      if (invoice.matchStatus === 'Unmatched' || invoice.matchStatus === 'Partial') {
        this.matchingSuggestions = [
          {
            id: 1,
            orderId: 'ORD-12345',
            retailer: invoice.retailer,
            amount: invoice.total,
            date: invoice.invoiceDate
          }
        ];
      } else {
        this.matchingSuggestions = [];
      }
    } else {
      this.invoiceLineItems = [];
      this.matchingSuggestions = [];
    }
  }

  closeSidebar(): void {
    this.showSidebar = false;
    this.selectedInvoice = null;
  }

  onResolveLinkOrders(): void {
    this.showLinkModal = true;
    this.linkStep = 1;
  }

  closeLinkModal(): void {
    this.showLinkModal = false;
    this.linkStep = 1;
  }

  onLinkMethodSelect(method: 'auto' | 'manual' | 'ai'): void {
    this.linkMethod = method;
  }

  onLinkNext(): void {
    if (this.linkStep < 3) {
      this.linkStep = (this.linkStep + 1) as 1 | 2 | 3;
    } else {
      // Complete linking
      this.closeLinkModal();
    }
  }

  onLinkCancel(): void {
    this.closeLinkModal();
  }

  onSelectSuggestion(suggestion: MatchingSuggestion): void {
    console.log('Select suggestion:', suggestion);
    // Handle suggestion selection
  }

  onViewSummary(type: 'unmatched' | 'partial' | 'overbilled'): void {
    this.activeTab = 'Exceptions';
    if (type === 'unmatched') {
      this.matchStatusFilter = 'Unmatched';
    } else if (type === 'partial') {
      this.matchStatusFilter = 'Partial';
    }
    this.applyFilters();
  }

  getMatchStatusClass(status: string): string {
    switch (status) {
      case 'Matched':
        return 'status-matched';
      case 'Partial':
        return 'status-partial';
      case 'Unmatched':
        return 'status-unmatched';
      default:
        return '';
    }
  }

  getDeliveryStatusClass(status: string): string {
    switch (status) {
      case 'Delivered':
        return 'status-delivered';
      case 'Pending':
        return 'status-pending';
      case 'In Transit':
        return 'status-in-transit';
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

  getInvoiceTotal(): number {
    return this.invoiceLineItems.reduce((sum, item) => sum + item.total, 0);
  }

  onExcel(): void {
    console.log('Export to Excel');
    // Handle Excel export logic
  }
}

