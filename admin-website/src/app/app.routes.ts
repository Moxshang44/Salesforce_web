import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { dmsAuthGuard } from './core/guards/dms-auth.guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full'
  },
  {
    path: 'login',
    loadComponent: () => import('./features/login/login.component').then(m => m.LoginComponent)
  },
  {
    path: 'dms',
    loadComponent: () => import('./features/dms/dms-login/dms-login.component').then(m => m.DmsLoginComponent)
  },
  {
    path: 'admin/dashboard',
    loadComponent: () => import('./features/admin-dashboard/admin-dashboard.component').then(m => m.AdminDashboardComponent),
    canActivate: [authGuard]
  },
  {
    path: 'admin/demo',
    loadComponent: () => import('./features/components-demo/components-demo.component').then(m => m.ComponentsDemoComponent),
    canActivate: [authGuard]
  },
  {
    path: 'admin/products',
    loadComponent: () => import('./features/product-master/product-master.component').then(m => m.ProductMasterComponent),
    canActivate: [authGuard]
  },
  {
    path: 'admin/brand',
    loadComponent: () => import('./features/brand/brand.component').then(m => m.BrandComponent),
    canActivate: [authGuard]
  },
  {
    path: 'admin/category',
    loadComponent: () => import('./features/category/category.component').then(m => m.CategoryComponent),
    canActivate: [authGuard]
  },
  {
    path: 'admin/scheme',
    loadComponent: () => import('./features/scheme/scheme.component').then(m => m.SchemeComponent),
    canActivate: [authGuard]
  },
  {
    path: 'admin/focusproducts',
    loadComponent: () => import('./features/product-master/product-master.component').then(m => m.ProductMasterComponent),
    canActivate: [authGuard]
  },
  {
    path: 'admin/incentives',
    loadComponent: () => import('./features/product-master/product-master.component').then(m => m.ProductMasterComponent),
    canActivate: [authGuard]
  },
  {
    path: 'admin/routes',
    loadComponent: () => import('./features/routes/routes.component').then(m => m.RoutesComponent),
    canActivate: [authGuard]
  },
  {
    path: 'admin/routes/add',
    loadComponent: () => import('./features/routes/components/add-routes/add-routes.component').then(m => m.AddRoutesComponent),
    canActivate: [authGuard]
  },
  {
    path: 'admin/routes/assign',
    loadComponent: () => import('./features/routes/components/assign-routes/assign-routes.component').then(m => m.AssignRoutesComponent),
    canActivate: [authGuard]
  },
  {
    path: 'admin/distributors',
    loadComponent: () => import('./features/distributors/distributors.component').then(m => m.DistributorsComponent),
    canActivate: [authGuard]
  },
  {
    path: 'admin/distributors/:id/stock',
    loadComponent: () => import('./features/distributors/distributor-stock/distributor-stock.component').then(m => m.DistributorStockComponent),
    canActivate: [authGuard]
  },
  {
    path: 'admin/super-stockist',
    loadComponent: () => import('./features/dashboard/dashboard.component').then(m => m.DashboardComponent),
    canActivate: [authGuard]
  },
  {
    path: 'admin/retailer',
    loadComponent: () => import('./features/retailers/retailers.component').then(m => m.RetailersComponent),
    canActivate: [authGuard]
  },
  {
    path: 'admin/finance',
    loadComponent: () => import('./features/dashboard/dashboard.component').then(m => m.DashboardComponent),
    canActivate: [authGuard]
  },
  {
    path: 'admin/marketing',
    loadComponent: () => import('./features/dashboard/dashboard.component').then(m => m.DashboardComponent),
    canActivate: [authGuard]
  },
  {
    path: 'admin/tasks',
    loadComponent: () => import('./features/dashboard/dashboard.component').then(m => m.DashboardComponent),
    canActivate: [authGuard]
  },
  {
    path: 'admin/employees',
    loadComponent: () => import('./features/employees/employees.component').then(m => m.EmployeesComponent),
    canActivate: [authGuard]
  },
  {
    path: 'admin/ai-chat',
    loadComponent: () => import('./features/dashboard/dashboard.component').then(m => m.DashboardComponent),
    canActivate: [authGuard]
  },
  {
    path: 'admin/assets',
    loadComponent: () => import('./features/dashboard/dashboard.component').then(m => m.DashboardComponent),
    canActivate: [authGuard]
  },
  {
    path: 'admin/settings',
    loadComponent: () => import('./features/dashboard/dashboard.component').then(m => m.DashboardComponent),
    canActivate: [authGuard]
  },
  {
    path: 'dms/dashboard',
    loadComponent: () => import('./features/dms/dms-dashboard/dms-dashboard.component').then(m => m.DmsDashboardComponent),
    canActivate: [dmsAuthGuard]
  },
  {
    path: 'dms/claims',
    loadComponent: () => import('./features/distributors/distributor-stock/distributor-stock.component').then(m => m.DistributorStockComponent),
    canActivate: [dmsAuthGuard]
  },
  {
    path: 'dms/purchase-orders',
    loadComponent: () => import('./features/dms/purchase-orders/purchase-orders.component').then(m => m.PurchaseOrdersComponent),
    canActivate: [dmsAuthGuard]
  },
  {
    path: 'dms/orders',
    loadComponent: () => import('./features/dms/orders/orders.component').then(m => m.OrdersComponent),
    canActivate: [dmsAuthGuard]
  },
  {
    path: 'dms/invoices',
    loadComponent: () => import('./features/dms/invoices/invoices.component').then(m => m.InvoicesComponent),
    canActivate: [dmsAuthGuard]
  },
  {
    path: 'dms/stock',
    loadComponent: () => import('./features/dms/stock/stock.component').then(m => m.StockComponent),
    canActivate: [dmsAuthGuard]
  },
  {
    path: 'dms/credit-checks',
    loadComponent: () => import('./features/dms/credit-checks/credit-checks.component').then(m => m.CreditChecksComponent),
    canActivate: [dmsAuthGuard]
  },
  {
    path: 'dms/compliance',
    loadComponent: () => import('./features/dms/compliance/compliance.component').then(m => m.ComplianceComponent),
    canActivate: [dmsAuthGuard]
  },
  {
    path: 'dms/billing-mode',
    loadComponent: () => import('./features/dms/billing-mode/billing-mode.component').then(m => m.BillingModeComponent),
    canActivate: [dmsAuthGuard],
    children: [
      {
        path: 'tally',
        loadChildren: () => import('./features/tally/tally.routes').then(m => m.tallyRoutes)
      }
    ]
  },
  {
    path: 'dms/ai-chatbot',
    loadComponent: () => import('./features/dms/ai-chatbot/ai-chatbot.component').then(m => m.AiChatbotComponent),
    canActivate: [dmsAuthGuard]
  },
  {
    path: '**',
    redirectTo: 'login'
  }
];
