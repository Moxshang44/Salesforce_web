import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-tally-nav',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  template: `
    <nav class="tally-nav">
      <a *ngFor="let item of menuItems" 
         [routerLink]="item.route"
         routerLinkActive="active"
         [routerLinkActiveOptions]="{exact: false}">
        {{ item.label }}
      </a>
    </nav>
  `,
  styles: [`
    .tally-nav {
      display: flex;
      gap: 8px;
      margin-bottom: 24px;
      border-bottom: 2px solid #e8e5e1;
      padding-bottom: 0;
    }
    
    .tally-nav a {
      padding: 12px 24px;
      text-decoration: none;
      color: #666;
      font-weight: 600;
      border-bottom: 3px solid transparent;
      margin-bottom: -2px;
      transition: all 0.2s ease;
      font-size: 15px;
    }
    
    .tally-nav a:hover {
      color: #664423;
      background: rgba(102, 68, 35, 0.05);
    }
    
    .tally-nav a.active {
      color: #664423;
      border-bottom-color: #664423;
    }
  `]
})
export class TallyNavComponent {
  menuItems = [
    { label: 'Dashboard', route: '/dms/billing-mode/tally/dashboard' },
    { label: 'Ledgers', route: '/dms/billing-mode/tally/ledgers' },
    { label: 'Vouchers', route: '/dms/billing-mode/tally/vouchers' },
    { label: 'Stock Items', route: '/dms/billing-mode/tally/stock' },
    { label: 'Reports', route: '/dms/billing-mode/tally/reports' }
  ];
}

