import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterLinkActive, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';

interface SubMenuItem {
  label: string;
  route: string;
}

interface NavItem {
  label: string;
  route?: string;
  icon?: string;
  iconImage?: string;
  subItems?: SubMenuItem[];
  isExpanded?: boolean;
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.scss'
})
export class SidebarComponent {
  companyName = 'Company Name';
  currentRoute = '';
  
  navItems: NavItem[] = [
    { label: 'Dashboard', route: '/dashboard', iconImage: 'assets/images/dashboard.png' },
    { 
      label: 'Product Master', 
      route: '/products', 
      iconImage: 'assets/images/productmastericonadmin.png',
      isExpanded: false,
      subItems: [
        { label: 'Brand', route: '/brand' },
        { label: 'Category', route: '/category' },
        { label: 'Product', route: '/products' },
        { label: 'Scheme', route: '/scheme' },
        { label: 'Focus Product', route: '/focusproducts' },
        { label: 'Incentives', route: '/incentives' }
      ]
    },
    { 
      label: 'Routes Master', 
      route: '/routes', 
      iconImage: 'assets/images/routes.png',
      isExpanded: false,
      subItems: [
        { label: 'Add Routes', route: '/routes' },
        { label: 'Assign Routes', route: '/routes/assign' }
      ]
    },
    { label: 'Distributors', route: '/distributors', iconImage: 'assets/images/Distributor.png' },
    { label: 'Super Stockist', route: '/super-stockist', iconImage: 'assets/images/superstockist.png' },
    { label: 'Retailer', route: '/retailer', iconImage: 'assets/images/finance.png' },
    { label: 'Finance', route: '/finance', iconImage: 'assets/images/finance.png' },
    { label: 'Marketing', route: '/marketing', iconImage: 'assets/images/marketing.png' },
    { label: 'Assign Task', route: '/tasks', iconImage: 'assets/images/assigntask.png' },
    { label: 'Employees', route: '/employees', iconImage: 'assets/images/employees.png' },
    { label: 'AI chat bot', route: '/ai-chat', iconImage: 'assets/images/aichatbot.png' },
    { label: 'Assets', route: '/assets', iconImage: 'assets/images/assets.png' },
    { label: 'Settings', route: '/settings', iconImage: 'assets/images/settings.png' },
  ];

  constructor(private router: Router) {
    this.currentRoute = this.router.url;
    
    // Listen to route changes
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: any) => {
        this.currentRoute = event.url;
        // Auto-expand parent items if their sub-route is active
        this.navItems.forEach(item => {
          if (item.subItems && this.isParentRouteActive(item)) {
            item.isExpanded = true;
          }
        });
      });
  }

  isParentRouteActive(item: NavItem): boolean {
    if (!item.route || !item.subItems) return false;
    
    // Check if current route matches parent route or any sub-route
    return this.currentRoute === item.route || 
           item.subItems.some(subItem => this.currentRoute === subItem.route || this.currentRoute.startsWith(subItem.route + '/'));
  }

  toggleSubMenu(item: NavItem): void {
    if (item.subItems) {
      item.isExpanded = !item.isExpanded;
    }
  }
}

