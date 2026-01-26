import { Component, OnInit, HostListener, ElementRef, ViewChild, OnDestroy, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterLinkActive, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { AuthService } from '../../services/auth.service';

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

export class SidebarComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('sidebarElement', { static: false }) sidebarElement!: ElementRef;
  
  companyName = 'Company Name';

  currentRoute = '';
  isCollapsed = false;
  showProductMasterPopup = false;
  popupPosition = { top: 0, left: 0 };
  
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
    { label: 'Routes', route: '/admin/routes', iconImage: 'assets/images/routes.png' },
    { label: 'Super Stockist', route: '/admin/super-stockist', iconImage: 'assets/images/superstockist.png' },
    { label: 'Distributors', route: '/admin/distributors', iconImage: 'assets/images/Distributor.png' },
    { label: 'Retailers', route: '/admin/retailer', iconImage: 'assets/images/finance.png' },
    { label: 'Employee Master', route: '/admin/employees', iconImage: 'assets/images/employees.png' },
    { label: 'Finance', route: '/admin/finance', iconImage: 'assets/images/finance.png' },
    { label: 'Marketing', route: '/admin/marketing', iconImage: 'assets/images/marketing.png' },
    { label: 'Assign Task', route: '/admin/tasks', iconImage: 'assets/images/assigntask.png' },
    { label: 'AI chat bot', route: '/admin/ai-chat', iconImage: 'assets/images/aichatbot.png' },
    { label: 'Assets', route: '/admin/assets', iconImage: 'assets/images/assets.png' },
    { label: 'Targets', route: '/admin/targets', iconImage: 'assets/images/finance.png' },
    { label: 'Sales Insights', route: '/admin/sales-insights', iconImage: 'assets/images/sales-insights.svg' },
    { label: 'Live View', route: '/admin/live-view', iconImage: 'assets/images/live-view.svg' },
    { label: 'Settings', route: '/admin/settings', iconImage: 'assets/images/settings.png' },
  ];

  constructor(
    private router: Router,
    private authService: AuthService,
    private elementRef: ElementRef
  ) {
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

  ngOnInit(): void {
    // Load company name from auth service
    this.companyName = this.authService.getCompanyName();
  }

  ngAfterViewInit(): void {
    // ViewChild is now available
  }

  isParentRouteActive(item: NavItem): boolean {
    if (!item.route || !item.subItems) return false;
    
    // Check if current route matches parent route or any sub-route
    return this.currentRoute === item.route || 
           item.subItems.some(subItem => this.currentRoute === subItem.route || this.currentRoute.startsWith(subItem.route + '/'));
  }

  toggleSubMenu(item: NavItem, event?: MouseEvent): void {
    if (item.subItems) {
      if (this.isCollapsed) {
        // When collapsed, show popup for Product Master
        if (item.label === 'Product Master') {
          this.openProductMasterPopup(item, event);
        }
      } else {
        item.isExpanded = !item.isExpanded;
      }
    }
  }

  openProductMasterPopup(item: NavItem, event?: MouseEvent): void {
    if (!item.subItems) return;
    
    // Find the clicked element to position the popup
    if (event) {
      const target = event.target as HTMLElement;
      const navItem = target?.closest('.nav-item') as HTMLElement;
      
      if (navItem) {
        const rect = navItem.getBoundingClientRect();
        this.popupPosition = {
          top: rect.bottom + 5,
          left: rect.left + rect.width + 5
        };
        this.showProductMasterPopup = true;
      }
    }
  }

  closeProductMasterPopup(): void {
    this.showProductMasterPopup = false;
  }

  navigateToSubItem(subItem: SubMenuItem): void {
    this.router.navigate([subItem.route]);
    this.closeProductMasterPopup();
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

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    // Get the sidebar element
    const sidebarEl = this.sidebarElement?.nativeElement || 
                     this.elementRef.nativeElement.querySelector('.sidebar') ||
                     this.elementRef.nativeElement;
    
    // Check if click is on popup
    const popup = document.querySelector('.product-master-popup');
    const clickedOnPopup = popup && popup.contains(event.target as Node);
    
    if (sidebarEl && !sidebarEl.contains(event.target as Node) && !clickedOnPopup) {
      // Close popup if open
      if (this.showProductMasterPopup) {
        this.closeProductMasterPopup();
      }
      
      // Click is outside the sidebar, collapse it if it's not already collapsed
      if (!this.isCollapsed) {
        this.isCollapsed = true;
        // Close all sub-menus when collapsing
        this.navItems.forEach(item => {
          if (item.subItems) {
            item.isExpanded = false;
          }
        });
        // Update CSS variable for main content margin
        document.documentElement.style.setProperty('--sidebar-width', '70px');
      }
    }
  }

  ngOnDestroy(): void {
    // Cleanup if needed
  }
}


