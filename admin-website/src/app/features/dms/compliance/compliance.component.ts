import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DmsSidebarComponent } from '../components/dms-sidebar/dms-sidebar.component';
import { HeaderComponent } from '../../../core/layout/header/header.component';
import { ButtonComponent } from '../../../shared/components/button/button.component';

interface Invoice {
  id: number;
  invoiceNo: string;
  retailer: string;
  invoiceDate: string;
  totalAmount: number;
  ewbStatus: 'Approved' | 'Pending' | 'Info' | 'Rejected' | 'NotGenerated' | 'Generated' | 'Failed' | 'Cancelled';
  ewbNo: string | null;
  generatedAt: string | null;
}

@Component({
  selector: 'app-compliance',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    DmsSidebarComponent,
    HeaderComponent,
    ButtonComponent
  ],
  templateUrl: './compliance.component.html',
  styleUrl: './compliance.component.scss'
})
export class ComplianceComponent implements OnInit {
  searchQuery = '';
  ewbStatusFilter = 'All';
  dateRange = 'Jan 01 - Jan 31, 2024';
  selectedInvoice: Invoice | null = null;
  showSidebar = false;

  invoices: Invoice[] = [
    {
      id: 1,
      invoiceNo: 'INV-2024-001',
      retailer: 'Acme Corp.',
      invoiceDate: 'Jan 31, 2024',
      totalAmount: 124500,
      ewbStatus: 'Approved',
      ewbNo: '3410029412',
      generatedAt: 'Jan 31, 2024 10:30 AM'
    },
    {
      id: 2,
      invoiceNo: 'INV-2024-002',
      retailer: 'Beta Solutions',
      invoiceDate: 'Jan 30, 2024',
      totalAmount: 85000,
      ewbStatus: 'Pending',
      ewbNo: null,
      generatedAt: null
    },
    {
      id: 3,
      invoiceNo: 'INV-2024-003',
      retailer: 'Gamma Enterprises',
      invoiceDate: 'Jan 30, 2024',
      totalAmount: 5500,
      ewbStatus: 'Info',
      ewbNo: '3410029413',
      generatedAt: 'Jan 30, 2024 2:15 PM'
    },
    {
      id: 4,
      invoiceNo: 'INV-2024-004',
      retailer: 'Delta Goods',
      invoiceDate: 'Jan 29, 2024',
      totalAmount: 210000,
      ewbStatus: 'Rejected',
      ewbNo: null,
      generatedAt: null
    },
    {
      id: 5,
      invoiceNo: 'INV-2024-005',
      retailer: 'Epsilon Trading',
      invoiceDate: 'Jan 28, 2024',
      totalAmount: 95000,
      ewbStatus: 'Generated',
      ewbNo: '3410029414',
      generatedAt: 'Jan 28, 2024 3:45 PM'
    },
    {
      id: 6,
      invoiceNo: 'INV-2024-006',
      retailer: 'Zeta Industries',
      invoiceDate: 'Jan 27, 2024',
      totalAmount: 175000,
      ewbStatus: 'Failed',
      ewbNo: null,
      generatedAt: null
    }
  ];

  filteredInvoices: Invoice[] = [];

  ngOnInit() {
    this.filteredInvoices = this.invoices;
  }

  onSearch(): void {
    this.applyFilters();
  }

  onStatusFilterChange(): void {
    this.applyFilters();
  }

  applyFilters(): void {
    let filtered = [...this.invoices];

    // Apply search filter
    if (this.searchQuery.trim()) {
      const query = this.searchQuery.toLowerCase();
      filtered = filtered.filter(inv => 
        inv.invoiceNo.toLowerCase().includes(query) ||
        inv.retailer.toLowerCase().includes(query)
      );
    }

    // Apply EWB status filter
    if (this.ewbStatusFilter !== 'All') {
      filtered = filtered.filter(inv => inv.ewbStatus === this.ewbStatusFilter);
    }

    this.filteredInvoices = filtered;
  }

  onOpenInvoice(invoice: Invoice): void {
    this.selectedInvoice = invoice;
    this.showSidebar = true;
  }

  closeSidebar(): void {
    this.showSidebar = false;
    this.selectedInvoice = null;
  }

  onGenerateEway(): void {
    if (this.selectedInvoice) {
      console.log('Generate E-way for:', this.selectedInvoice.invoiceNo);
      // Handle E-way generation logic
    }
  }

  onDownloadEwb(): void {
    if (this.selectedInvoice?.ewbNo) {
      console.log('Download EWB:', this.selectedInvoice.ewbNo);
      // Handle EWB download logic
    }
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'Approved':
      case 'Generated':
        return 'status-approved';
      case 'Pending':
        return 'status-pending';
      case 'Info':
        return 'status-info';
      case 'Rejected':
      case 'Failed':
      case 'Cancelled':
        return 'status-rejected';
      default:
        return 'status-default';
    }
  }

  formatCurrency(amount: number): string {
    return `₹ ${amount.toLocaleString('en-IN')}`;
  }

  getInvoiceItemsCount(): number {
    // Mock data - replace with actual data
    return 15;
  }
}

