import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

interface NavItem {
  label: string;
  route: string;
  iconSvg: string;
  safeIconSvg?: SafeHtml;
}

@Component({
  selector: 'app-super-admin-sidebar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './super-admin-sidebar.component.html',
  styleUrl: './super-admin-sidebar.component.scss'
})
export class SuperAdminSidebarComponent {
  companyName = 'Super Admin';
  currentRoute = '';
  isCollapsed = true;
  
  navItems: NavItem[] = [];
  
  constructor(
    private router: Router,
    private sanitizer: DomSanitizer
  ) {
    this.currentRoute = this.router.url;
    // Initialize CSS variable - sidebar is collapsed by default
    document.documentElement.style.setProperty('--sidebar-width', '70px');
    
    // Initialize nav items with sanitized SVG icons
    this.initializeNavItems();
  }

  initializeNavItems(): void {
    const items: NavItem[] = [
      { 
        label: 'Companies', 
        route: '/super-admin/companies',
        iconSvg: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><polyline points="9 22 9 12 15 12 15 22" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>'
      },
    ];
    
    // Sanitize SVG icons
    this.navItems = items.map(item => ({
      ...item,
      safeIconSvg: this.sanitizer.bypassSecurityTrustHtml(item.iconSvg)
    }));
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

