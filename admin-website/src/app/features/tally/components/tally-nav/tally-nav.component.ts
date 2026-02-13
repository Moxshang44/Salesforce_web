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
      gap: 0;
      margin-bottom: 24px;
      border-bottom: 2px solid #e8e5e1;
      padding-bottom: 0;
      position: relative;
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
      position: relative;
      border-right: 1px solid #e8e5e1;
    }
    
    .tally-nav a:first-child {
      border-left: none;
    }
    
    .tally-nav a:last-child {
      border-right: none;
    }
    
    .tally-nav a:hover {
      color: #6C4423;
      background: rgba(102, 68, 35, 0.05);
    }
    
    .tally-nav a.active {
      color: #6C4423;
      border-bottom-color: #6C4423;
      background: rgba(102, 68, 35, 0.05);
    }
    
    .tally-nav a.active::after {
      content: '';
      position: absolute;
      bottom: -2px;
      left: 0;
      right: 0;
      height: 3px;
      background: #6C4423;
      z-index: 1;
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

