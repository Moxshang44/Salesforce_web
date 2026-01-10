import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { DmsSidebarComponent } from '../components/dms-sidebar/dms-sidebar.component';
import { HeaderComponent } from '../../../core/layout/header/header.component';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { ModalComponent } from '../../../shared/components/modal/modal.component';

interface Retailer {
  id: number;
  name: string;
  creditLimit: number;
  outstanding: number;
  availableCredit: number;
  overdueDays: number;
  risk: 'Safe' | 'Warning' | 'Blocked';
  route?: string;
  type?: string;
  overdueAmount?: number;
  oldestOverdueDays?: number;
}

interface Bill {
  id: number;
  billNo: string;
  billDate: string;
  dueDate: string;
  total: number;
  paid: number;
  balance: number;
  status: 'Paid' | 'Partial' | 'Overdue';
}

interface Payment {
  id: number;
  receiptRef: string;
  date: string;
  amount: number;
  mode: string;
  allocatedTo: string;
  hasAttachment: boolean;
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

interface InvoiceAllocation {
  id: number;
  invoiceNo: string;
  dueDate: string;
  balance: number;
  allocatedAmount: number;
  isSelected: boolean;
  status: 'Overdue' | 'Due Soon' | 'Pending';
}

@Component({
  selector: 'app-credit-checks',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    DmsSidebarComponent,
    HeaderComponent,
    ButtonComponent,
    ModalComponent
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
  retailerId: string | null = null;
  isDetailView = false;

  retailers: Retailer[] = [
    {
      id: 1,
      name: 'Apex Retailers',
      creditLimit: 1500000,
      outstanding: 450250,
      availableCredit: 1049750,
      overdueDays: 0,
      risk: 'Safe',
      route: 'Andheri West',
      type: 'GT',
      overdueAmount: 125000,
      oldestOverdueDays: 45
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
  bills: Bill[] = [];
  payments: Payment[] = [];
  
  // Detail view filters
  billStatusFilter = 'All';
  billDateRangeStart = '2024-10-01';
  billDateRangeEnd = '2024-10-31';
  paymentModeFilter = 'All';
  paymentDateRangeStart = '2024-10-01';
  paymentDateRangeEnd = '2024-10-31';
  billSearchQuery = '';
  paymentSearchQuery = '';
  lastSyncTime = '2h ago';

  // Record Payment Modal State
  showRecordPaymentModal = false;
  currentStep = 1;
  paymentFormData = {
    paymentDate: new Date().toISOString().split('T')[0],
    amount: '',
    mode: '',
    reference: '',
    notes: '',
    attachment: null as File | null
  };
  invoiceAllocations: InvoiceAllocation[] = [];
  autoAllocate = true;
  keepUnallocated = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit() {
    // Check if retailer ID is in route
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.retailerId = id;
        this.isDetailView = true;
        this.loadRetailerDetail(parseInt(id));
      } else {
        this.isDetailView = false;
        this.filteredRetailers = this.retailers;
      }
    });
  }
  
  loadRetailerDetail(id: number): void {
    const retailer = this.retailers.find(r => r.id === id);
    if (retailer) {
      this.selectedRetailer = retailer;
      this.loadRetailerDetails(id);
      this.loadBillsAndPayments(id);
    } else {
      // If retailer not found, redirect to list
      this.router.navigate(['/dms/credit-checks']);
    }
  }
  
  loadBillsAndPayments(retailerId: number): void {
    // Mock data based on image description
    if (retailerId === 1) {
      // Apex Retailers data
      this.bills = [
        {
          id: 1,
          billNo: 'INV-2024-1001',
          billDate: '2024-10-05',
          dueDate: '2024-10-20',
          total: 50000,
          paid: 0,
          balance: 50000,
          status: 'Overdue'
        },
        {
          id: 2,
          billNo: 'INV-2024-1002',
          billDate: '2024-10-10',
          dueDate: '2024-10-25',
          total: 75000,
          paid: 25000,
          balance: 50000,
          status: 'Partial'
        },
        {
          id: 3,
          billNo: 'INV-2024-1003',
          billDate: '2024-10-15',
          dueDate: '2024-10-30',
          total: 30000,
          paid: 30000,
          balance: 0,
          status: 'Paid'
        },
        {
          id: 4,
          billNo: 'INV-2024-1004',
          billDate: '2024-10-18',
          dueDate: '2024-11-02',
          total: 45250,
          paid: 0,
          balance: 45250,
          status: 'Partial'
        },
        {
          id: 5,
          billNo: 'INV-2024-1005',
          billDate: '2024-10-22',
          dueDate: '2024-11-06',
          total: 25000,
          paid: 0,
          balance: 25000,
          status: 'Overdue'
        }
      ];
      
      this.payments = [
        {
          id: 1,
          receiptRef: 'REC-2024-501',
          date: '2024-10-08',
          amount: 30000,
          mode: 'Bank Transfer',
          allocatedTo: 'INV-2024-1003',
          hasAttachment: true
        },
        {
          id: 2,
          receiptRef: 'REC-2024-502',
          date: '2024-10-12',
          amount: 25000,
          mode: 'Cheque',
          allocatedTo: 'INV-2024-1002',
          hasAttachment: true
        },
        {
          id: 3,
          receiptRef: 'REC-2024-503',
          date: '2024-10-20',
          amount: 50000,
          mode: 'Cash',
          allocatedTo: 'Unallocated',
          hasAttachment: true
        },
        {
          id: 4,
          receiptRef: 'REC-2024-504',
          date: '2024-10-25',
          amount: 15000,
          mode: 'Bank Transfer',
          allocatedTo: 'INV-2024-1004',
          hasAttachment: true
        },
        {
          id: 5,
          receiptRef: 'REC-2024-505',
          date: '2024-10-28',
          amount: 10000,
          mode: 'UPI',
          allocatedTo: 'Unallocated',
          hasAttachment: true
        }
      ];
    } else {
      this.bills = [];
      this.payments = [];
    }
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
    // Navigate to detail page
    this.router.navigate(['/dms/credit-checks', retailer.id]);
  }
  
  onRowClick(retailer: Retailer): void {
    this.onViewRetailer(retailer);
  }
  
  goBackToList(): void {
    this.router.navigate(['/dms/credit-checks']);
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
    return `₹${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }
  
  formatDate(dateString: string): string {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' });
  }
  
  getTotalDebits(): number {
    return this.bills.reduce((sum, bill) => sum + bill.total, 0);
  }
  
  getTotalCredits(): number {
    return this.payments.reduce((sum, payment) => sum + payment.amount, 0);
  }
  
  getPendingAmount(): number {
    const totalDebits = this.getTotalDebits();
    const totalCredits = this.getTotalCredits();
    return totalDebits - totalCredits;
  }
  
  getOverdueAmount(): number {
    return this.bills
      .filter(bill => bill.status === 'Overdue')
      .reduce((sum, bill) => sum + bill.balance, 0);
  }
  
  onRecordPayment(): void {
    this.showRecordPaymentModal = true;
    this.currentStep = 1;
    // Reset form data
    this.paymentFormData = {
      paymentDate: new Date().toISOString().split('T')[0],
      amount: '',
      mode: '',
      reference: '',
      notes: '',
      attachment: null
    };
    // Load invoice allocations for step 2
    this.loadInvoiceAllocations();
  }

  closeRecordPaymentModal(): void {
    this.showRecordPaymentModal = false;
    this.currentStep = 1;
  }

  loadInvoiceAllocations(): void {
    // Convert bills to invoice allocations format
    this.invoiceAllocations = this.bills.map((bill, index) => {
      const dueDate = new Date(bill.dueDate);
      const today = new Date();
      const daysUntilDue = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      
      let status: 'Overdue' | 'Due Soon' | 'Pending' = 'Pending';
      if (daysUntilDue < 0) {
        status = 'Overdue';
      } else if (daysUntilDue <= 7) {
        status = 'Due Soon';
      }

      return {
        id: bill.id,
        invoiceNo: bill.billNo,
        dueDate: bill.dueDate,
        balance: bill.balance,
        allocatedAmount: 0,
        isSelected: false,
        status
      };
    });

    // Sort by overdue first (oldest first)
    this.invoiceAllocations.sort((a, b) => {
      if (a.status === 'Overdue' && b.status !== 'Overdue') return -1;
      if (a.status !== 'Overdue' && b.status === 'Overdue') return 1;
      return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
    });
  }

  onNextStep(): void {
    // Validate step 1 before proceeding
    if (this.currentStep === 1) {
      if (!this.paymentFormData.amount || !this.paymentFormData.mode) {
        alert('Please fill in all required fields (Amount and Mode)');
        return;
      }
      
      // If mode requires reference (electronic payments)
      const electronicModes = ['Bank Transfer', 'UPI', 'NEFT', 'RTGS', 'IMPS'];
      if (electronicModes.includes(this.paymentFormData.mode) && !this.paymentFormData.reference) {
        alert('Reference/UTR is required for electronic payments');
        return;
      }

      // If auto-allocate is enabled, allocate automatically
      if (this.autoAllocate) {
        this.autoAllocatePayment();
      }

      this.currentStep = 2;
    }
  }

  onBackStep(): void {
    if (this.currentStep > 1) {
      this.currentStep--;
    }
  }

  autoAllocatePayment(): void {
    const paymentAmount = parseFloat(this.paymentFormData.amount) || 0;
    let remainingAmount = paymentAmount;

    // Reset allocations
    this.invoiceAllocations.forEach(inv => {
      inv.allocatedAmount = 0;
      inv.isSelected = false;
    });

    // Allocate to oldest overdue first
    for (const invoice of this.invoiceAllocations) {
      if (remainingAmount <= 0) break;
      
      if (invoice.balance > 0) {
        const allocateAmount = Math.min(invoice.balance, remainingAmount);
        invoice.allocatedAmount = allocateAmount;
        invoice.isSelected = true;
        remainingAmount -= allocateAmount;
      }
    }

    // If there's remaining amount and keepUnallocated is false, allocate to next invoices
    if (remainingAmount > 0 && !this.keepUnallocated) {
      for (const invoice of this.invoiceAllocations) {
        if (remainingAmount <= 0) break;
        if (!invoice.isSelected && invoice.balance > 0) {
          const allocateAmount = Math.min(invoice.balance, remainingAmount);
          invoice.allocatedAmount += allocateAmount;
          invoice.isSelected = true;
          remainingAmount -= allocateAmount;
        }
      }
    }
  }

  onToggleAutoAllocate(): void {
    this.autoAllocate = !this.autoAllocate;
    if (this.autoAllocate) {
      this.autoAllocatePayment();
    } else {
      // Reset allocations when switching to manual
      this.invoiceAllocations.forEach(inv => {
        inv.allocatedAmount = 0;
        inv.isSelected = false;
      });
    }
  }

  onInvoiceCheckboxChange(invoice: InvoiceAllocation): void {
    if (!invoice.isSelected) {
      invoice.allocatedAmount = 0;
    } else {
      // Auto-set to balance if checked
      invoice.allocatedAmount = invoice.balance;
    }
  }

  onAllocationAmountChange(invoice: InvoiceAllocation): void {
    if (invoice.allocatedAmount > 0) {
      invoice.isSelected = true;
      if (invoice.allocatedAmount > invoice.balance) {
        invoice.allocatedAmount = invoice.balance;
      }
    } else {
      invoice.isSelected = false;
    }
  }

  getAllocatedTotal(): number {
    return this.invoiceAllocations.reduce((sum, inv) => sum + inv.allocatedAmount, 0);
  }

  getRemainingAmount(): number {
    const paymentAmount = parseFloat(this.paymentFormData.amount) || 0;
    return paymentAmount - this.getAllocatedTotal();
  }

  onSavePayment(): void {
    const paymentAmount = parseFloat(this.paymentFormData.amount) || 0;
    const allocatedTotal = this.getAllocatedTotal();
    const remaining = this.getRemainingAmount();

    // Validation
    if (remaining < 0) {
      alert('Allocated amount cannot exceed payment amount');
      return;
    }

    if (!this.keepUnallocated && remaining > 0) {
      const confirmAllocate = confirm(`₹${remaining.toLocaleString()} remains unallocated. Save anyway?`);
      if (!confirmAllocate) {
        return;
      }
    }

    // Here you would typically save to backend
    console.log('Saving payment:', {
      ...this.paymentFormData,
      amount: paymentAmount,
      allocations: this.invoiceAllocations.filter(inv => inv.isSelected),
      unallocatedAmount: remaining
    });

    // Reset and close modal
    alert('Payment recorded successfully!');
    this.closeRecordPaymentModal();
    
    // Refresh data
    if (this.selectedRetailer) {
      this.loadBillsAndPayments(this.selectedRetailer.id);
    }
  }

  onFileSelect(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.paymentFormData.attachment = input.files[0];
    }
  }

  getPaymentModeOptions(): string[] {
    return ['Cash', 'Cheque', 'Bank Transfer', 'UPI', 'NEFT', 'RTGS', 'IMPS', 'Credit Card', 'Debit Card'];
  }

  areAllSelected(): boolean {
    return this.invoiceAllocations.length > 0 && this.invoiceAllocations.every(inv => inv.isSelected);
  }

  onToggleAll(event: Event): void {
    const checked = (event.target as HTMLInputElement).checked;
    this.invoiceAllocations.forEach(invoice => {
      invoice.isSelected = checked;
      if (checked) {
        invoice.allocatedAmount = invoice.balance;
      } else {
        invoice.allocatedAmount = 0;
      }
    });
  }

  getDueDateClass(status: string): string {
    switch (status) {
      case 'Overdue':
        return 'due-date-overdue';
      case 'Due Soon':
        return 'due-date-soon';
      default:
        return 'due-date-pending';
    }
  }

  getPaymentAmountDisplay(): string {
    const amount = parseFloat(this.paymentFormData.amount) || 0;
    return amount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }
  
  onSendReminder(): void {
    console.log('Send Reminder for:', this.selectedRetailer?.name);
    // TODO: Implement send reminder functionality
  }
  
  onDownloadLedger(): void {
    console.log('Download Ledger for:', this.selectedRetailer?.name);
    // TODO: Implement download ledger functionality
  }
  
  getBillStatusClass(status: string): string {
    switch (status) {
      case 'Paid':
        return 'status-paid';
      case 'Partial':
        return 'status-partial';
      case 'Overdue':
        return 'status-overdue';
      default:
        return '';
    }
  }

  onExcel(): void {
    console.log('Export to Excel');
    // Handle Excel export logic
  }
}

