import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DmsSidebarComponent } from '../components/dms-sidebar/dms-sidebar.component';
import { HeaderComponent } from '../../../core/layout/header/header.component';
import { ButtonComponent } from '../../../shared/components/button/button.component';

interface Retailer {
  id: number;
  name: string;
  creditLimit: number;
  outstanding: number;
  availableCredit: number;
  overdueDays: number;
  risk: 'Safe' | 'Warning' | 'Blocked';
}

interface OutstandingInvoice {
  id: number;
  invoiceNo: string;
  date: string;
  amount: number;
  status: 'Pending' | 'Overdue' | 'Paid';
}

interface PaymentHistory {
  id: number;
  payment: string;
  amount: number;
  status: 'Approved' | 'Pending' | 'Rejected';
}

@Component({
  selector: 'app-credit-checks',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    DmsSidebarComponent,
    HeaderComponent,
    ButtonComponent
  ],
  templateUrl: './credit-checks.component.html',
  styleUrl: './credit-checks.component.scss'
})
export class CreditChecksComponent implements OnInit {
  searchQuery = '';
  riskFilter = 'All';
  overdueFilter = 'All';
  selectedRetailer: Retailer | null = null;
  showSidebar = false;

  retailers: Retailer[] = [
    {
      id: 1,
      name: 'Apex Retailers',
      creditLimit: 50000,
      outstanding: 12500,
      availableCredit: 37500,
      overdueDays: 0,
      risk: 'Safe'
    },
    {
      id: 2,
      name: 'Summit Supplies',
      creditLimit: 30000,
      outstanding: 28000,
      availableCredit: 2000,
      overdueDays: 18,
      risk: 'Warning'
    },
    {
      id: 3,
      name: 'Horizon Distribution',
      creditLimit: 25000,
      outstanding: 26500,
      availableCredit: -1500,
      overdueDays: 45,
      risk: 'Blocked'
    },
    {
      id: 4,
      name: 'Global Traders',
      creditLimit: 60000,
      outstanding: 5000,
      availableCredit: 55000,
      overdueDays: 0,
      risk: 'Safe'
    },
    {
      id: 5,
      name: 'Metro Mart',
      creditLimit: 40000,
      outstanding: 35000,
      availableCredit: 5000,
      overdueDays: 22,
      risk: 'Warning'
    },
    {
      id: 6,
      name: 'Prime Distributors',
      creditLimit: 35000,
      outstanding: 32000,
      availableCredit: 3000,
      overdueDays: 12,
      risk: 'Warning'
    },
    {
      id: 7,
      name: 'Elite Commerce',
      creditLimit: 45000,
      outstanding: 8000,
      availableCredit: 37000,
      overdueDays: 0,
      risk: 'Safe'
    }
  ];

  filteredRetailers: Retailer[] = [];
  outstandingInvoices: OutstandingInvoice[] = [];
  paymentHistory: PaymentHistory[] = [];

  ngOnInit() {
    this.filteredRetailers = this.retailers;
  }

  onSearch(): void {
    this.applyFilters();
  }

  onRiskFilterChange(): void {
    this.applyFilters();
  }

  onOverdueFilterChange(): void {
    this.applyFilters();
  }

  applyFilters(): void {
    let filtered = [...this.retailers];

    // Apply search filter
    if (this.searchQuery.trim()) {
      const query = this.searchQuery.toLowerCase();
      filtered = filtered.filter(retailer => 
        retailer.name.toLowerCase().includes(query)
      );
    }

    // Apply risk filter
    if (this.riskFilter !== 'All') {
      filtered = filtered.filter(retailer => retailer.risk === this.riskFilter);
    }

    // Apply overdue filter
    if (this.overdueFilter !== 'All') {
      filtered = filtered.filter(retailer => {
        if (this.overdueFilter === '0-15') {
          return retailer.overdueDays >= 0 && retailer.overdueDays <= 15;
        } else if (this.overdueFilter === '16-30') {
          return retailer.overdueDays >= 16 && retailer.overdueDays <= 30;
        } else if (this.overdueFilter === '30+') {
          return retailer.overdueDays > 30;
        }
        return true;
      });
    }

    this.filteredRetailers = filtered;
  }

  onViewRetailer(retailer: Retailer): void {
    this.selectedRetailer = retailer;
    this.showSidebar = true;
    this.loadRetailerDetails(retailer.id);
  }

  loadRetailerDetails(retailerId: number): void {
    // Mock data - replace with actual API call
    if (retailerId === 2) {
      // Summit Supplies data
      this.outstandingInvoices = [
        {
          id: 1,
          invoiceNo: '10025',
          date: '2024-05-10',
          amount: 12000,
          status: 'Pending'
        },
        {
          id: 2,
          invoiceNo: '10024',
          date: '2024-05-01',
          amount: 10000,
          status: 'Overdue'
        },
        {
          id: 3,
          invoiceNo: '10022',
          date: '2024-04-15',
          amount: 6000,
          status: 'Overdue'
        }
      ];

      this.paymentHistory = [
        {
          id: 1,
          payment: '2024-04-10',
          amount: 5000,
          status: 'Approved'
        }
      ];
    } else {
      // Default data for other retailers
      this.outstandingInvoices = [];
      this.paymentHistory = [];
    }
  }

  closeSidebar(): void {
    this.showSidebar = false;
    this.selectedRetailer = null;
  }

  onRecordCollection(): void {
    console.log('Record Collection for:', this.selectedRetailer?.name);
    // Handle record collection logic
  }

  onAdjustCreditLimit(): void {
    console.log('Adjust Credit Limit for:', this.selectedRetailer?.name);
    // Handle credit limit adjustment logic
  }

  getRiskClass(risk: string): string {
    switch (risk) {
      case 'Safe':
        return 'risk-safe';
      case 'Warning':
        return 'risk-warning';
      case 'Blocked':
        return 'risk-blocked';
      default:
        return '';
    }
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'Pending':
        return 'status-pending';
      case 'Overdue':
        return 'status-overdue';
      case 'Paid':
      case 'Approved':
        return 'status-approved';
      case 'Rejected':
        return 'status-rejected';
      default:
        return '';
    }
  }

  formatCurrency(amount: number): string {
    return `$${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }

  onExcel(): void {
    console.log('Export to Excel');
    // Handle Excel export logic
  }
}

