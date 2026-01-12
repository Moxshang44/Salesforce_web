import { Routes } from '@angular/router';

export const tallyRoutes: Routes = [
  {
    path: '',
    redirectTo: 'dashboard',
    pathMatch: 'full'
  },
  {
    path: 'dashboard',
    loadComponent: () => import('./pages/dashboard/dashboard.component').then(m => m.DashboardComponent)
  },
  {
    path: 'ledgers',
    loadComponent: () => import('./pages/ledgers/ledgers.component').then(m => m.LedgersComponent)
  },
  {
    path: 'vouchers',
    loadComponent: () => import('./pages/vouchers/vouchers.component').then(m => m.VouchersComponent)
  },
  {
    path: 'stock',
    loadComponent: () => import('./pages/stock/stock.component').then(m => m.StockComponent)
  },
  {
    path: 'reports',
    loadComponent: () => import('./pages/reports/reports.component').then(m => m.ReportsComponent)
  }
];

