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
  isCollapsed = false;
  
  navItems: NavItem[] = [
    { label: 'Dashboard', route: '/admin/dashboard', iconImage: 'assets/images/dashboard.png' },
    { 
      label: 'Product Master', 
      route: '/admin/products', 
      iconImage: 'assets/images/productmastericonadmin.png',
      isExpanded: false,
      subItems: [
        { label: 'Brand', route: '/admin/brand' },
        { label: 'Category', route: '/admin/category' },
        { label: 'Product', route: '/admin/products' },
        { label: 'Scheme', route: '/admin/scheme' },
        { label: 'Focus Product', route: '/admin/focusproducts' },
        { label: 'Incentives', route: '/admin/incentives' }
      ]
    },
    { 
      label: 'Routes', 
      route: '/admin/routes', 
      iconImage: 'assets/images/routes.png',
      isExpanded: false,
      subItems: [
        { label: 'Add Routes', route: '/admin/routes' },
        { label: 'Assign Routes', route: '/admin/routes/assign' }
      ]
    },
    { label: 'Super Stockist', route: '/admin/super-stockist', iconImage: 'assets/images/superstockist.png' },
    { label: 'Distributors', route: '/admin/distributors', iconImage: 'assets/images/Distributor.png' },
    { label: 'Retailers', route: '/admin/retailer', iconImage: 'assets/images/finance.png' },
    { label: 'Employee Master', route: '/admin/employees', iconImage: 'assets/images/employees.png' },
    { label: 'Finance', route: '/admin/finance', iconImage: 'assets/images/finance.png' },
    { label: 'Marketing', route: '/admin/marketing', iconImage: 'assets/images/marketing.png' },
    { label: 'Assign Task', route: '/admin/tasks', iconImage: 'assets/images/assigntask.png' },
    { label: 'AI chat bot', route: '/admin/ai-chat', iconImage: 'assets/images/aichatbot.png' },
    { label: 'Assets', route: '/admin/assets', iconImage: 'assets/images/assets.png' },
    { label: 'Settings', route: '/admin/settings', iconImage: 'assets/images/settings.png' },
  ];

  constructor(private router: Router) {
    this.currentRoute = this.router.url;
    // Initialize CSS variable
    document.documentElement.style.setProperty('--sidebar-width', '220px');
    
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
    if (item.subItems && !this.isCollapsed) {
      item.isExpanded = !item.isExpanded;
    }
  }

  toggleSidebar(): void {
    this.isCollapsed = !this.isCollapsed;
    // Close all sub-menus when collapsing
    if (this.isCollapsed) {
      this.navItems.forEach(item => {
        if (item.subItems) {
          item.isExpanded = false;
        }
      });
    }
    // Update CSS variable for main content margin
    document.documentElement.style.setProperty('--sidebar-width', this.isCollapsed ? '70px' : '220px');
  }
}


