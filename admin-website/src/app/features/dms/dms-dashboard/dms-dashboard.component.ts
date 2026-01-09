import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, NavigationEnd, ActivatedRoute } from '@angular/router';
import { filter } from 'rxjs/operators';
import { DmsSidebarComponent } from '../components/dms-sidebar/dms-sidebar.component';
import { HeaderComponent } from '../../../core/layout/header/header.component';
import { ButtonComponent } from '../../../shared/components/button/button.component';

interface DashboardSummary {
  billing_mode: 'NATIVE' | 'TALLY';
  unmapped_products_count: number;
  last_sync_at: string;
  totals: {
    orders_today_sfa: number;
    orders_today_retailer: number;
    unbilled_orders: number;
    unmatched_invoices: number;
    partially_billed_orders: number;
    stock_low_skus: number;
    claims_pending: number;
    overdue_outstanding: number;
  };
}

interface ExceptionItem {
  id: number;
  type: 'UNMATCHED_INVOICE' | 'PARTIAL_BILLING' | 'OVER_BILLED';
  description: string;
  count: number;
  route: string;
  queryParams: any;
}

interface ActivityItem {
  id: number;
  type: 'sync' | 'action';
  description: string;
  timestamp: string;
  status?: 'success' | 'error' | 'warning';
}

@Component({
  selector: 'app-dms-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    DmsSidebarComponent,
    HeaderComponent,
    ButtonComponent
  ],
  templateUrl: './dms-dashboard.component.html',
  styleUrl: './dms-dashboard.component.scss'
})
export class DmsDashboardComponent implements OnInit {
  currentRoute = '';
  distributorId = '1';
  distributorName = 'ABC Distributors';
  isLoading = true;
  
  summary: DashboardSummary | null = null;
  exceptions: ExceptionItem[] = [];
  recentActivity: ActivityItem[] = [];

  constructor(
    private router: Router,
    private route: ActivatedRoute
  ) {
    // Listen to route changes
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: NavigationEnd) => {
      this.currentRoute = event.url;
    });
  }

  ngOnInit() {
    this.currentRoute = this.router.url;
    // Get distributor ID from route if available
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.distributorId = id;
    }
    this.loadDashboardData();
  }

  loadDashboardData(): void {
    // Simulate API call
    setTimeout(() => {
      // Mock data - replace with actual API call
      this.summary = {
        billing_mode: 'TALLY',
        unmapped_products_count: 5,
        last_sync_at: new Date().toISOString(),
        totals: {
          orders_today_sfa: 12,
          orders_today_retailer: 8,
          unbilled_orders: 15,
          unmatched_invoices: 7,
          partially_billed_orders: 4,
          stock_low_skus: 9,
          claims_pending: 11,
          overdue_outstanding: 125000
        }
      };

      this.exceptions = [
        {
          id: 1,
          type: 'UNMATCHED_INVOICE',
          description: 'Unmatched Invoices',
          count: 7,
          route: '/dms/invoices',
          queryParams: { match: 'UNMATCHED' }
        },
        {
          id: 2,
          type: 'PARTIAL_BILLING',
          description: 'Partially Billed Orders',
          count: 4,
          route: '/dms/orders',
          queryParams: { billing: 'PARTIAL' }
        },
        {
          id: 3,
          type: 'OVER_BILLED',
          description: 'Over-billed Anomalies',
          count: 2,
          route: '/dms/invoices',
          queryParams: { filter: 'OVER_BILLED' }
        }
      ];

      this.recentActivity = [
        {
          id: 1,
          type: 'sync',
          description: 'Tally sync completed',
          timestamp: new Date(Date.now() - 5 * 60000).toISOString(),
          status: 'success'
        },
        {
          id: 2,
          type: 'action',
          description: 'Invoice #INV-12345 created',
          timestamp: new Date(Date.now() - 15 * 60000).toISOString(),
          status: 'success'
        },
        {
          id: 3,
          type: 'sync',
          description: 'Stock sync completed',
          timestamp: new Date(Date.now() - 30 * 60000).toISOString(),
          status: 'success'
        },
        {
          id: 4,
          type: 'action',
          description: 'Order #ORD-67890 billed',
          timestamp: new Date(Date.now() - 45 * 60000).toISOString(),
          status: 'success'
        },
        {
          id: 5,
          type: 'sync',
          description: 'Tally sync failed',
          timestamp: new Date(Date.now() - 60 * 60000).toISOString(),
          status: 'error'
        }
      ];

      this.isLoading = false;
    }, 1000);
  }

  getPageTitle(): string {
    if (this.currentRoute === '/dms/dashboard') {
      return 'Dashboard';
    }
    const routeMap: { [key: string]: string } = {
      '/dms/claims': 'Claims',
      '/dms/purchase-orders': 'Purchase Orders (Inbound / Primary)',
      '/dms/orders': 'Orders (Retailer Orders In)',
      '/dms/invoices': 'Invoices',
      '/dms/stock': 'Stock',
      '/dms/place-orders': 'Place Orders (to Super Stockist)',
      '/dms/credit-checks': 'Credit Checks / Collections',
      '/dms/compliance': 'E-way / E-invoice Compliance',
      '/dms/billing-mode': 'Billing Mode'
    };
    return routeMap[this.currentRoute] || 'DMS Dashboard';
  }

  showWarningBanner(): boolean {
    return this.summary?.billing_mode === 'TALLY' && 
           (this.summary?.unmapped_products_count || 0) > 0;
  }

  onKpiCardClick(route: string, queryParams?: any): void {
    this.router.navigate([route], { queryParams });
  }

  onExceptionView(exception: ExceptionItem): void {
    this.router.navigate([exception.route], { queryParams: exception.queryParams });
  }

  formatCurrency(amount: number): string {
    return `₹${amount.toLocaleString('en-IN')}`;
  }

  formatTimeAgo(timestamp: string): string {
    const now = new Date();
    const time = new Date(timestamp);
    const diffMs = now.getTime() - time.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays}d ago`;
  }

  getExceptionIcon(type: string): string {
    switch (type) {
      case 'UNMATCHED_INVOICE':
        return '📄';
      case 'PARTIAL_BILLING':
        return '⚠️';
      case 'OVER_BILLED':
        return '🚨';
      default:
        return 'ℹ️';
    }
  }
}
