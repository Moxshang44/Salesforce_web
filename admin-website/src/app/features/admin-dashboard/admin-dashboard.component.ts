import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SidebarComponent } from '../../core/layout/sidebar/sidebar.component';
import { HeaderComponent } from '../../core/layout/header/header.component';
import { StatsCardComponent } from './components/stats-card/stats-card.component';
import { SalesChartComponent } from './components/sales-chart/sales-chart.component';
import { ActionItemComponent, ActionItem } from './components/action-item/action-item.component';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    SidebarComponent,
    HeaderComponent,
    StatsCardComponent,
    SalesChartComponent,
    ActionItemComponent
  ],
  templateUrl: './admin-dashboard.component.html',
  styleUrl: './admin-dashboard.component.scss'
})
export class AdminDashboardComponent {
  // Action items matching the original design
  actionItems: ActionItem[] = [
    {
      id: '1',
      message: "Scheme 'Diwali Dhamaka' expires in 2 days.",
      actionLabel: 'Extend?',
      variant: 'danger'
    },
    {
      id: '2',
      message: "New Distributor 'ABC Traders' waiting for approval.",
      actionLabel: 'Review',
      variant: 'primary'
    },
    {
      id: '3',
      message: '5 Returns requests pending.',
      actionLabel: 'Review',
      variant: 'primary'
    },
    {
      id: '4',
      message: "Product 'Elite Widgets' stock below safety level.",
      actionLabel: 'Order Now',
      variant: 'danger'
    },
    {
      id: '5',
      message: 'New Feature Request: Loyalty Program.',
      actionLabel: 'Prioritize',
      variant: 'primary'
    }
  ];

  onActionClick(actionId: string) {
    console.log('Action clicked:', actionId);
    // Handle action click
  }
}
