import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';

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
  
  navItems: NavItem[] = [
    { label: 'Dashboard', route: '/dashboard', iconImage: 'assets/images/dashboard.png' },
    { 
      label: 'Product Master', 
      route: '/products', 
      iconImage: 'assets/images/productmastericonadmin.png',
      isExpanded: false,
      subItems: [
        { label: 'Brand', route: '/products/brand' },
        { label: 'Category', route: '/products/category' },
        { label: 'Product', route: '/products' },
        { label: 'Scheme', route: '/products/scheme' },
        { label: 'Pricelist', route: '/products/pricelist' }
      ]
    },
    { label: 'Routes', route: '/routes', iconImage: 'assets/images/routes.png' },
    { label: 'Distributors', route: '/distributors', iconImage: 'assets/images/Distributor.png' },
    { label: 'Super Stockist', route: '/super-stockist', iconImage: 'assets/images/superstockist.png' },
    { 
      label: 'Retailer', 
      route: '/retailer', 
      iconImage: 'assets/images/finance.png',
      isExpanded: false,
      subItems: [
        { label: 'Finance', route: '/finance' },
        { label: 'Marketing', route: '/marketing' }
      ]
    },
    { label: 'Assign Task', route: '/tasks', iconImage: 'assets/images/assigntask.png' },
    { label: 'Employees', route: '/employees', iconImage: 'assets/images/employees.png' },
    { label: 'AI chat bot', route: '/ai-chat', iconImage: 'assets/images/aichatbot.png' },
    { label: 'Assets', route: '/assets', iconImage: 'assets/images/assets.png' },
    { label: 'Settings', route: '/settings', iconImage: 'assets/images/settings.png' },
  ];

  toggleSubMenu(item: NavItem): void {
    if (item.subItems) {
      item.isExpanded = !item.isExpanded;
    }
  }
}

