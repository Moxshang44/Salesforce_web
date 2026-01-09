import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';

interface NavItem {
  label: string;
  route: string;
  iconImage?: string;
}

@Component({
  selector: 'app-dms-sidebar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './dms-sidebar.component.html',
  styleUrl: './dms-sidebar.component.scss'
})
export class DmsSidebarComponent {
  companyName = 'DMS';
  currentRoute = '';
  isCollapsed = false;
  
  navItems: NavItem[] = [
    { label: 'Dashboard', route: '/dms/dashboard' },
    { label: 'Claims', route: '/dms/claims' },
    { label: 'Purchase Orders (Inbound / Primary)', route: '/dms/purchase-orders' },
    { label: 'Orders (Retailer Orders In)', route: '/dms/orders' },
    { label: 'Invoices', route: '/dms/invoices' },
    { label: 'Stock', route: '/dms/stock' },
    { label: 'Place Orders (to Super Stockist)', route: '/dms/place-orders' },
    { label: 'Credit Checks / Collections', route: '/dms/credit-checks' },
    { label: 'E-way / E-invoice Compliance', route: '/dms/compliance' },
    { label: 'Billing Mode', route: '/dms/billing-mode' },
  ];

  constructor(private router: Router) {
    this.currentRoute = this.router.url;
    // Initialize CSS variable
    document.documentElement.style.setProperty('--sidebar-width', '220px');
  }

  toggleSidebar(): void {
    this.isCollapsed = !this.isCollapsed;
    if (this.isCollapsed) {
      document.documentElement.style.setProperty('--sidebar-width', '70px');
    } else {
      document.documentElement.style.setProperty('--sidebar-width', '220px');
    }
  }
}

