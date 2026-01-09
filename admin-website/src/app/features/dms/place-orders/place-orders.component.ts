import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DmsSidebarComponent } from '../components/dms-sidebar/dms-sidebar.component';
import { HeaderComponent } from '../../../core/layout/header/header.component';
import { ButtonComponent } from '../../../shared/components/button/button.component';

interface LineItem {
  id: number;
  sku: string;
  description: string;
  quantity: number;
  unitPrice: number;
}

interface RecentPO {
  id: number;
  poNo: string;
  date: string;
  status: 'Approved' | 'Pending' | 'Rejected' | 'Info';
}

@Component({
  selector: 'app-place-orders',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    DmsSidebarComponent,
    HeaderComponent,
    ButtonComponent
  ],
  templateUrl: './place-orders.component.html',
  styleUrl: './place-orders.component.scss'
})
export class PlaceOrdersComponent implements OnInit {
  selectedSuperStockist = '';
  expectedDeliveryDate = '';
  deliveryNote = '';
  selectedSku = '';
  newItemQuantity = 10;
  
  lineItems: LineItem[] = [
    {
      id: 1,
      sku: 'SKU-1001',
      description: 'Premium Coffee Beans 1kg',
      quantity: 10,
      unitPrice: 15.00
    },
    {
      id: 2,
      sku: 'SKU-1002',
      description: 'Premium Coffee Beans 2kg',
      quantity: 1,
      unitPrice: 15.00
    },
    {
      id: 3,
      sku: 'SKU-1003',
      description: 'Premium Coffee 1kg',
      quantity: 1,
      unitPrice: 10.00
    }
  ];

  recentPOs: RecentPO[] = [
    {
      id: 1,
      poNo: 'PO-24001',
      date: 'Oct 24, 2024',
      status: 'Approved'
    },
    {
      id: 2,
      poNo: 'PO-24002',
      date: 'Oct 23, 2024',
      status: 'Pending'
    },
    {
      id: 3,
      poNo: 'PO-24003',
      date: 'Oct 22, 2024',
      status: 'Rejected'
    },
    {
      id: 4,
      poNo: 'PO-24004',
      date: 'Oct 21, 2024',
      status: 'Info'
    }
  ];

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

  taxRate = 0.05; // 5%

  ngOnInit() {
    // Set default delivery date to tomorrow
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    this.expectedDeliveryDate = this.formatDate(tomorrow);
  }

  formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  formatDisplayDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
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

  formatCurrency(amount: number): string {
    return `$${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
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
  }

  onSaveDraft(): void {
    console.log('Save Draft', {
      superStockist: this.selectedSuperStockist,
      deliveryDate: this.expectedDeliveryDate,
      deliveryNote: this.deliveryNote,
      lineItems: this.lineItems
    });
    // Handle save draft logic
  }

  onViewPO(po: RecentPO): void {
    console.log('View PO:', po.poNo);
    // Handle view PO logic
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'Approved':
        return 'status-approved';
      case 'Pending':
        return 'status-pending';
      case 'Rejected':
        return 'status-rejected';
      case 'Info':
        return 'status-info';
      default:
        return '';
    }
  }
}
