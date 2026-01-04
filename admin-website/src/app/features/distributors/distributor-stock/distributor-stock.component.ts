import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { SidebarComponent } from '../../../core/layout/sidebar/sidebar.component';
import { HeaderComponent } from '../../../core/layout/header/header.component';
import { ButtonComponent } from '../../../shared/components/button/button.component';

interface StockItem {
  id: number;
  sku: string;
  productName: string;
  availableQuantity: number;
  unit: string;
  minRequiredStock: number;
  lastPurchase: number;
  lastPurchaseDate: string;
  stockStatus: 'in-stock' | 'low' | 'critical';
  statusText: string;
  isEditing?: boolean;
  editValue?: number;
}

interface ClaimItem {
  id: number;
  billNo: string;
  returnDate: string;
  productName: string;
  reason: string;
  quantity: number;
  unit: string;
  totalAmount: number;
  claimAmount: number;
  claimStatus: 'pending' | 'approved' | 'rejected';
}

interface OrderItem {
  id: number;
  orderId: string;
  orderDate: string;
  retailerName: string;
  placedBy: 'Salesman' | 'Retailer';
  orderTotalValue: number;
  billedAmount: number;
  pendingAmount: number;
  orderStatus: 'pending' | 'billed' | 'partial';
}

interface SampleItem {
  id: number;
  salesmanName: string;
  route: string;
  products: string[];
  amount: number;
  quantity: string;
  date: string;
}

interface SchemeClaimItem {
  id: number;
  billNo: string;
  retailerName: string;
  route: string;
  productName: string;
  quantity: number;
  unit: string;
  amount: number;
}

interface MonthWiseSummaryItem {
  id: number;
  month: string;
  returnClaims: number | null;
  schemeClaims: number | null;
  sampleClaims: number | null;
  totalClaim: number;
  clearedDate: string | null;
}

@Component({
  selector: 'app-distributor-stock',
  standalone: true,
  imports: [CommonModule, FormsModule, SidebarComponent, HeaderComponent, ButtonComponent],
  templateUrl: './distributor-stock.component.html',
  styleUrl: './distributor-stock.component.scss'
})
export class DistributorStockComponent implements OnInit {
  distributorId: string | null = null;
  activeTab = 'stocks';
  currentPage = 1;
  totalPages = 2;
  selectedReturnsType = 'Returns';
  hoveredSampleItem: SampleItem | null = null;
  hoverPosition = { x: 0, y: 0 };

  stockItems: StockItem[] = [
    {
      id: 1,
      sku: 'SKU-PCM-600',
      productName: 'Paracetamol 500mg',
      availableQuantity: 1250,
      unit: 'Units',
      minRequiredStock: 800,
      lastPurchase: 300,
      lastPurchaseDate: '12 Sep 2025',
      stockStatus: 'in-stock',
      statusText: 'In Stock'
    },
    {
      id: 2,
      sku: 'SKU-AMX-250',
      productName: 'Amoxicillin 250mg',
      availableQuantity: 420,
      unit: 'Units',
      minRequiredStock: 600,
      lastPurchase: 200,
      lastPurchaseDate: '02 Sep 2025',
      stockStatus: 'low',
      statusText: 'Low Stock'
    },
    {
      id: 3,
      sku: 'SKU-VTC-100',
      productName: 'Vitamin C Tablets',
      availableQuantity: 2100,
      unit: 'Units',
      minRequiredStock: 1000,
      lastPurchase: 500,
      lastPurchaseDate: '20 Aug 2025',
      stockStatus: 'in-stock',
      statusText: 'In Stock'
    },
    {
      id: 4,
      sku: 'SKU-CS-100',
      productName: 'Cough Syrup 100ml',
      availableQuantity: 310,
      unit: 'Bottles',
      minRequiredStock: 500,
      lastPurchase: 150,
      lastPurchaseDate: '28 Aug 2025',
      stockStatus: 'critical',
      statusText: 'Critical'
    },
    {
      id: 5,
      sku: 'SKU-IBU-400',
      productName: 'Ibuprofen 400mg',
      availableQuantity: 850,
      unit: 'Units',
      minRequiredStock: 750,
      lastPurchase: 400,
      lastPurchaseDate: '01 Sep 2025',
      stockStatus: 'in-stock',
      statusText: 'In Stock'
    },
    {
      id: 6,
      sku: 'SKU-MET-500',
      productName: 'Metformin 500mg',
      availableQuantity: 650,
      unit: 'Strips',
      minRequiredStock: 400,
      lastPurchase: 200,
      lastPurchaseDate: '22 Sep 2025',
      stockStatus: 'in-stock',
      statusText: 'In Stock'
    },
    {
      id: 7,
      sku: 'SKU-ATO-10',
      productName: 'Atorvastatin 10mg',
      availableQuantity: 1200,
      unit: 'Units',
      minRequiredStock: 500,
      lastPurchase: 150,
      lastPurchaseDate: '05 Oct 2025',
      stockStatus: 'in-stock',
      statusText: 'In Stock'
    },
    {
      id: 8,
      sku: 'SKU-LEV-01',
      productName: 'Levothyroxine 0.1mg',
      availableQuantity: 450,
      unit: 'Units',
      minRequiredStock: 300,
      lastPurchase: 150,
      lastPurchaseDate: '12 Sep 2025',
      stockStatus: 'in-stock',
      statusText: 'In Stock'
    },
    {
      id: 9,
      sku: 'SKU-OME-20',
      productName: 'Omeprazole 20mg',
      availableQuantity: 980,
      unit: 'Units',
      minRequiredStock: 600,
      lastPurchase: 200,
      lastPurchaseDate: '20 Sep 2025',
      stockStatus: 'in-stock',
      statusText: 'In Stock'
    }
  ];

  claimItems: ClaimItem[] = [
    {
      id: 1,
      billNo: '#BILL-45821',
      returnDate: '12 Sep 2025',
      productName: 'Ensure Gold Nutrition Powder 400gm',
      reason: 'Damaged Packaging',
      quantity: 4,
      unit: 'Units',
      totalAmount: 1560,
      claimAmount: 1560,
      claimStatus: 'pending'
    },
    {
      id: 2,
      billNo: '#BILL-45822',
      returnDate: '15 Sep 2025',
      productName: 'Paracetamol 500mg',
      reason: 'Expired Product',
      quantity: 6,
      unit: 'Units',
      totalAmount: 1200,
      claimAmount: 1200,
      claimStatus: 'approved'
    },
    {
      id: 3,
      billNo: '#BILL-45823',
      returnDate: '18 Sep 2025',
      productName: 'Amoxicillin 250mg',
      reason: 'Wrong Product',
      quantity: 3,
      unit: 'Units',
      totalAmount: 900,
      claimAmount: 0,
      claimStatus: 'rejected'
    },
    {
      id: 4,
      billNo: '#BILL-45824',
      returnDate: '20 Sep 2025',
      productName: 'Vitamin C Tablets',
      reason: 'Damaged Packaging',
      quantity: 5,
      unit: 'Units',
      totalAmount: 1250,
      claimAmount: 1250,
      claimStatus: 'pending'
    },
    {
      id: 5,
      billNo: '#BILL-45825',
      returnDate: '22 Sep 2025',
      productName: 'Cough Syrup 100ml',
      reason: 'Expired Product',
      quantity: 2,
      unit: 'Bottles',
      totalAmount: 800,
      claimAmount: 800,
      claimStatus: 'approved'
    },
    {
      id: 6,
      billNo: '#BILL-45826',
      returnDate: '25 Sep 2025',
      productName: 'Ibuprofen 400mg',
      reason: 'Damaged Packaging',
      quantity: 8,
      unit: 'Units',
      totalAmount: 1600,
      claimAmount: 1600,
      claimStatus: 'pending'
    },
    {
      id: 7,
      billNo: '#BILL-45827',
      returnDate: '28 Sep 2025',
      productName: 'Metformin 500mg',
      reason: 'Wrong Product',
      quantity: 4,
      unit: 'Strips',
      totalAmount: 1000,
      claimAmount: 0,
      claimStatus: 'rejected'
    },
    {
      id: 8,
      billNo: '#BILL-45828',
      returnDate: '01 Oct 2025',
      productName: 'Atorvastatin 10mg',
      reason: 'Expired Product',
      quantity: 7,
      unit: 'Units',
      totalAmount: 1400,
      claimAmount: 1400,
      claimStatus: 'approved'
    },
    {
      id: 9,
      billNo: '#BILL-45829',
      returnDate: '03 Oct 2025',
      productName: 'Omeprazole 20mg',
      reason: 'Damaged Packaging',
      quantity: 6,
      unit: 'Units',
      totalAmount: 1200,
      claimAmount: 1200,
      claimStatus: 'pending'
    }
  ];

  orderItems: OrderItem[] = [
    {
      id: 1,
      orderId: '#ORD-10021',
      orderDate: '12 Sep 2025',
      retailerName: 'Shree Medical Store',
      placedBy: 'Salesman',
      orderTotalValue: 9450,
      billedAmount: 0,
      pendingAmount: 9450,
      orderStatus: 'pending'
    },
    {
      id: 2,
      orderId: '#ORD-10022',
      orderDate: '13 Sep 2025',
      retailerName: 'WellCare Pharmacy',
      placedBy: 'Retailer',
      orderTotalValue: 599,
      billedAmount: 599,
      pendingAmount: 0,
      orderStatus: 'billed'
    },
    {
      id: 3,
      orderId: '#ORD-10023',
      orderDate: '14 Sep 2025',
      retailerName: 'HealthPlus Distributors',
      placedBy: 'Salesman',
      orderTotalValue: 1150,
      billedAmount: 780,
      pendingAmount: 370,
      orderStatus: 'partial'
    },
    {
      id: 4,
      orderId: '#ORD-10024',
      orderDate: '15 Sep 2025',
      retailerName: 'Arogya Medical Hall',
      placedBy: 'Retailer',
      orderTotalValue: 520,
      billedAmount: 520,
      pendingAmount: 0,
      orderStatus: 'billed'
    },
    {
      id: 5,
      orderId: '#ORD-10025',
      orderDate: '16 Sep 2025',
      retailerName: 'City Life Pharmacy',
      placedBy: 'Salesman',
      orderTotalValue: 990,
      billedAmount: 0,
      pendingAmount: 990,
      orderStatus: 'pending'
    },
    {
      id: 6,
      orderId: '#ORD-10026',
      orderDate: '17 Sep 2025',
      retailerName: 'Prime Care Pharmacy',
      placedBy: 'Retailer',
      orderTotalValue: 2400,
      billedAmount: 2400,
      pendingAmount: 0,
      orderStatus: 'billed'
    },
    {
      id: 7,
      orderId: '#ORD-10027',
      orderDate: '18 Sep 2025',
      retailerName: 'Wellness Point',
      placedBy: 'Salesman',
      orderTotalValue: 3200,
      billedAmount: 2000,
      pendingAmount: 1200,
      orderStatus: 'partial'
    },
    {
      id: 8,
      orderId: '#ORD-10028',
      orderDate: '19 Sep 2025',
      retailerName: 'Green Cross Medical',
      placedBy: 'Retailer',
      orderTotalValue: 780,
      billedAmount: 780,
      pendingAmount: 0,
      orderStatus: 'billed'
    },
    {
      id: 9,
      orderId: '#ORD-10029',
      orderDate: '20 Sep 2025',
      retailerName: 'LifeLine Chemists',
      placedBy: 'Salesman',
      orderTotalValue: 4500,
      billedAmount: 3000,
      pendingAmount: 1500,
      orderStatus: 'partial'
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

  onSearch(event: Event) {
    const input = event.target as HTMLInputElement;
    console.log('Search:', input.value);
  }

  goToPage(page: number) {
    this.currentPage = page;
  }

  previousPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
    }
  }

  nextPage() {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
    }
  }

  startEdit(item: StockItem): void {
    item.isEditing = true;
    item.editValue = item.minRequiredStock;
  }

  saveMinStock(item: StockItem): void {
    if (item.editValue !== undefined && item.editValue >= 0) {
      item.minRequiredStock = item.editValue;
    }
    item.isEditing = false;
    item.editValue = undefined;
  }

  cancelEdit(item: StockItem): void {
    item.isEditing = false;
    item.editValue = undefined;
  }

  showViewOptionsModal = false;
  selectedOrder: OrderItem | null = null;

  onViewOrder(order: OrderItem): void {
    this.selectedOrder = order;
    this.showViewOptionsModal = true;
  }

  closeViewOptionsModal(): void {
    this.showViewOptionsModal = false;
    this.selectedOrder = null;
  }

  onViewBill(): void {
    console.log('View Bill for order:', this.selectedOrder);
    this.closeViewOptionsModal();
  }

  onViewPurchase(): void {
    console.log('View Purchase for order:', this.selectedOrder);
    this.closeViewOptionsModal();
  }

  onCancelPending(order: OrderItem): void {
    console.log('Cancel pending order:', order);
  }

  sampleItems: SampleItem[] = [
    {
      id: 1,
      salesmanName: 'Rakesh Patel',
      route: 'CG Road Route',
      products: ['Ensure Gold Nutrition Powder', 'Horlicks Health Drink'],
      amount: 2200,
      quantity: '2+5=7',
      date: '15 Sep 2025'
    },
    {
      id: 2,
      salesmanName: 'Amit Shah',
      route: 'Satellite Route',
      products: ['Horlicks Health Drink', 'Vitamin C Capsule Pack', 'Bournvita Powder Pack'],
      amount: 1850,
      quantity: '3+2+1=6',
      date: '16 Sep 2025'
    },
    {
      id: 3,
      salesmanName: 'Suresh Mehta',
      route: 'Maninagar Route',
      products: ['Complan Nutrition Mix', 'Boost Energy Drink'],
      amount: 1910,
      quantity: '4+3=7',
      date: '16 Sep 2025'
    },
    {
      id: 4,
      salesmanName: 'Vikram Joshi',
      route: 'Bopal Route',
      products: ['ProteinX Powder', 'Pediasure Growth Powder', 'Nutrilite Daily', 'Ensure Diabetes Care'],
      amount: 2000,
      quantity: '5+4+1+3=13',
      date: '17 Sep 2025'
    },
    {
      id: 5,
      salesmanName: 'Rahul Verma',
      route: 'Navrangpura Route',
      products: ['Bournvita Pro Health', 'Horlicks Health Drink', 'Complan Nutrition Mix'],
      amount: 1620,
      quantity: '2+3+1=6',
      date: '17 Sep 2025'
    },
    {
      id: 6,
      salesmanName: 'Neeraj Singh',
      route: 'Gota Route',
      products: ['Pediasure Growth Powder', 'Ensure Gold Nutrition Powder'],
      amount: 2750,
      quantity: '3+4=7',
      date: '18 Sep 2025'
    },
    {
      id: 7,
      salesmanName: 'Mahesh Kumar',
      route: 'Chandkheda Route',
      products: ['Ensure Diabetes Care', 'Boost Energy Drink', 'Complan Nutrition Mix'],
      amount: 3450,
      quantity: '4+5+1=10',
      date: '18 Sep 2025'
    },
    {
      id: 8,
      salesmanName: 'Alok Trivedi',
      route: 'Vastrapur Route',
      products: ['Boost Energy Drink', 'Horlicks Health Drink'],
      amount: 1980,
      quantity: '3+2=5',
      date: '19 Sep 2025'
    },
    {
      id: 9,
      salesmanName: 'Kunal Desai',
      route: 'Thaltej Route',
      products: ['Nutrilite Daily', 'ProteinX Powder', 'Bournvita Pro Health'],
      amount: 4200,
      quantity: '6+3+1=10',
      date: '19 Sep 2025'
    }
  ];

  schemeClaimItems: SchemeClaimItem[] = [
    {
      id: 1,
      billNo: '#BILL-1001',
      retailerName: 'Shree Medical Store',
      route: 'Prahlad Nagar',
      productName: 'Ensure Gold Nutrition Powder',
      quantity: 5,
      unit: 'Units',
      amount: 2200
    },
    {
      id: 2,
      billNo: '#BILL-1002',
      retailerName: 'City Care Pharmacy',
      route: 'Navrangpura',
      productName: 'ColdAway Tablets',
      quantity: 10,
      unit: 'Units',
      amount: 830
    },
    {
      id: 3,
      billNo: '#BILL-1003',
      retailerName: 'HealthPlus Medical',
      route: 'Nehrunagar',
      productName: 'D-Immune Vitamin D3 Drops',
      quantity: 6,
      unit: 'Units',
      amount: 1290
    },
    {
      id: 4,
      billNo: '#BILL-1004',
      retailerName: 'Wellness Pharmacy',
      route: 'New Ranip',
      productName: 'Omega 3 Softgel Capsules',
      quantity: 4,
      unit: 'Units',
      amount: 2360
    },
    {
      id: 5,
      billNo: '#BILL-1005',
      retailerName: 'Arogya Medical Hall',
      route: 'Sabarmati',
      productName: 'Chyawanprash Awaleha 1kg',
      quantity: 3,
      unit: 'Units',
      amount: 1380
    },
    {
      id: 6,
      billNo: '#BILL-1006',
      retailerName: 'LifeCare Medical',
      route: 'CG Road',
      productName: 'GlucoCheck Test Strips',
      quantity: 2,
      unit: 'Units',
      amount: 1150
    },
    {
      id: 7,
      billNo: '#BILL-1007',
      retailerName: 'Medico Plus',
      route: 'Navrangpura',
      productName: 'NeuroBion Forte Tablets',
      quantity: 6,
      unit: 'Units',
      amount: 980
    },
    {
      id: 8,
      billNo: '#BILL-1008',
      retailerName: 'Sunrise Pharmacy',
      route: 'Vastrapur',
      productName: 'Liv52 Syrup',
      quantity: 3,
      unit: 'Units',
      amount: 760
    },
    {
      id: 9,
      billNo: '#BILL-1009',
      retailerName: 'GreenCross Medical',
      route: 'Amralwadi',
      productName: 'Digene Antacid Gel',
      quantity: 5,
      unit: 'Units',
      amount: 640
    }
  ];

  // Summary data
  totalClaimRaised: number = 325000;
  pendingClaims: number = 23000;
  clearedClaim: number = 302000;

  monthWiseSummary: MonthWiseSummaryItem[] = [
    {
      id: 1,
      month: 'January 2026',
      returnClaims: 9200,
      schemeClaims: 4800,
      sampleClaims: 6500,
      totalClaim: 20500,
      clearedDate: '15 Feb 2026'
    },
    {
      id: 2,
      month: '04 Jan 2026',
      returnClaims: 1600,
      schemeClaims: 4800,
      sampleClaims: null,
      totalClaim: 6400,
      clearedDate: null
    },
    {
      id: 3,
      month: '27 Jan 2026',
      returnClaims: null,
      schemeClaims: null,
      sampleClaims: 5000,
      totalClaim: 5000,
      clearedDate: null
    },
    {
      id: 4,
      month: '31 Jan 2026',
      returnClaims: 7600,
      schemeClaims: null,
      sampleClaims: 1500,
      totalClaim: 9100,
      clearedDate: null
    },
    {
      id: 5,
      month: 'February 2026',
      returnClaims: 8600,
      schemeClaims: 4300,
      sampleClaims: 1100,
      totalClaim: 14000,
      clearedDate: '12 Mar 2026'
    },
    {
      id: 6,
      month: 'March 2026',
      returnClaims: 10400,
      schemeClaims: 5600,
      sampleClaims: 2000,
      totalClaim: 18000,
      clearedDate: 'Pending'
    },
    {
      id: 7,
      month: 'April 2026',
      returnClaims: 11800,
      schemeClaims: 5700,
      sampleClaims: 2500,
      totalClaim: 20000,
      clearedDate: '18 May 2026'
    },
    {
      id: 8,
      month: 'May 2026',
      returnClaims: 12300,
      schemeClaims: 6200,
      sampleClaims: 2500,
      totalClaim: 21000,
      clearedDate: 'Pending'
    },
    {
      id: 9,
      month: 'June 2026',
      returnClaims: 10700,
      schemeClaims: 5100,
      sampleClaims: 1700,
      totalClaim: 17500,
      clearedDate: '20 Jul 2026'
    },
    {
      id: 10,
      month: 'July 2026',
      returnClaims: 13600,
      schemeClaims: 8000,
      sampleClaims: 3400,
      totalClaim: 25000,
      clearedDate: '16 Aug 2026'
    },
    {
      id: 11,
      month: 'August 2026',
      returnClaims: 11200,
      schemeClaims: 6400,
      sampleClaims: 2400,
      totalClaim: 20000,
      clearedDate: 'Pending'
    },
    {
      id: 12,
      month: 'September 2026',
      returnClaims: 15000,
      schemeClaims: 7500,
      sampleClaims: 4500,
      totalClaim: 27000,
      clearedDate: '22 Oct 2026'
    },
    {
      id: 13,
      month: 'October 2026',
      returnClaims: 9600,
      schemeClaims: 4900,
      sampleClaims: 1500,
      totalClaim: 16000,
      clearedDate: 'Pending'
    },
    {
      id: 14,
      month: 'November 2026',
      returnClaims: 11900,
      schemeClaims: 6100,
      sampleClaims: 2000,
      totalClaim: 20000,
      clearedDate: '12 Dec 2026'
    }
  ];

  get totalReturnQuantity(): number {
    if (this.selectedReturnsType === 'Sample') {
      return this.sampleItems.reduce((sum, item) => {
        const qty = parseInt(item.quantity.split('=')[1] || '0');
        return sum + qty;
      }, 0);
    }
    if (this.selectedReturnsType === 'Schemes') {
      return this.schemeClaimItems.reduce((sum, item) => sum + item.quantity, 0);
    }
    return this.claimItems.reduce((sum, item) => sum + item.quantity, 0);
  }

  get toBeClaimValue(): number {
    if (this.selectedReturnsType === 'Sample') {
      return this.sampleItems.reduce((sum, item) => sum + item.amount, 0);
    }
    if (this.selectedReturnsType === 'Schemes') {
      return this.schemeClaimItems.reduce((sum, item) => sum + item.amount, 0);
    }
    return this.claimItems
      .filter(item => item.claimStatus === 'pending')
      .reduce((sum, item) => sum + item.claimAmount, 0);
  }

  onMouseEnterSample(event: MouseEvent, item: SampleItem): void {
    this.hoveredSampleItem = item;
    const rect = (event.currentTarget as HTMLElement).getBoundingClientRect();
    this.hoverPosition = { 
      x: rect.left + rect.width / 2, 
      y: rect.top + rect.height 
    };
  }

  onMouseLeaveSample(): void {
    this.hoveredSampleItem = null;
  }

  onMouseMoveSample(event: MouseEvent): void {
    if (this.hoveredSampleItem) {
      const rect = (event.currentTarget as HTMLElement).getBoundingClientRect();
      this.hoverPosition = { 
        x: rect.left + rect.width / 2, 
        y: rect.top + rect.height 
      };
    }
  }
}
