import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

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
    path: 'dashboard',
    loadComponent: () => import('./features/admin-dashboard/admin-dashboard.component').then(m => m.AdminDashboardComponent),
    canActivate: [authGuard]
  },
  {
    path: 'demo',
    loadComponent: () => import('./features/components-demo/components-demo.component').then(m => m.ComponentsDemoComponent),
    canActivate: [authGuard]
  },
  {
    path: 'products',
    loadComponent: () => import('./features/product-master/product-master.component').then(m => m.ProductMasterComponent),
    canActivate: [authGuard]
  },
  {
    path: 'products/brand',
    loadComponent: () => import('./features/brand/brand.component').then(m => m.BrandComponent),
    canActivate: [authGuard]
  },
  {
    path: 'products/category',
    loadComponent: () => import('./features/category/category.component').then(m => m.CategoryComponent),
    canActivate: [authGuard]
  },
  {
    path: 'products/scheme',
    loadComponent: () => import('./features/scheme/scheme.component').then(m => m.SchemeComponent),
    canActivate: [authGuard]
  },
  {
    path: 'products/pricelist',
    loadComponent: () => import('./features/product-master/product-master.component').then(m => m.ProductMasterComponent),
    canActivate: [authGuard]
  },
  {
    path: 'routes',
    loadComponent: () => import('./features/routes/routes.component').then(m => m.RoutesComponent),
    canActivate: [authGuard]
  },
  {
    path: 'routes/add',
    loadComponent: () => import('./features/routes/components/add-routes/add-routes.component').then(m => m.AddRoutesComponent),
    canActivate: [authGuard]
  },
  {
    path: 'routes/assign',
    loadComponent: () => import('./features/routes/components/assign-routes/assign-routes.component').then(m => m.AssignRoutesComponent),
    canActivate: [authGuard]
  },
  {
    path: 'distributors',
    loadComponent: () => import('./features/distributors/distributors.component').then(m => m.DistributorsComponent),
    canActivate: [authGuard]
  },
  {
    path: 'distributors/:id/stock',
    loadComponent: () => import('./features/distributors/distributor-stock/distributor-stock.component').then(m => m.DistributorStockComponent),
    canActivate: [authGuard]
  },
  {
    path: 'super-stockist',
    loadComponent: () => import('./features/dashboard/dashboard.component').then(m => m.DashboardComponent),
    canActivate: [authGuard]
  },
  {
    path: 'finance',
    loadComponent: () => import('./features/dashboard/dashboard.component').then(m => m.DashboardComponent),
    canActivate: [authGuard]
  },
  {
    path: 'marketing',
    loadComponent: () => import('./features/dashboard/dashboard.component').then(m => m.DashboardComponent),
    canActivate: [authGuard]
  },
  {
    path: 'tasks',
    loadComponent: () => import('./features/dashboard/dashboard.component').then(m => m.DashboardComponent),
    canActivate: [authGuard]
  },
  {
    path: 'employees',
    loadComponent: () => import('./features/employees/employees.component').then(m => m.EmployeesComponent),
    canActivate: [authGuard]
  },
  {
    path: 'ai-chat',
    loadComponent: () => import('./features/dashboard/dashboard.component').then(m => m.DashboardComponent),
    canActivate: [authGuard]
  },
  {
    path: 'assets',
    loadComponent: () => import('./features/dashboard/dashboard.component').then(m => m.DashboardComponent),
    canActivate: [authGuard]
  },
  {
    path: 'settings',
    loadComponent: () => import('./features/dashboard/dashboard.component').then(m => m.DashboardComponent),
    canActivate: [authGuard]
  },
  {
    path: '**',
    redirectTo: 'login'
  }
];
