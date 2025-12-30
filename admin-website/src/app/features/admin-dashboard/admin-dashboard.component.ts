import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SidebarComponent } from '../../core/layout/sidebar/sidebar.component';
import { HeaderComponent } from '../../core/layout/header/header.component';
import { StatsCardComponent } from './components/stats-card/stats-card.component';
import { ActionItemComponent, ActionItem } from './components/action-item/action-item.component';
import { SalesChartComponent } from './components/sales-chart/sales-chart.component';
import { AiAssistantComponent } from './components/ai-assistant/ai-assistant.component';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    SidebarComponent,
    HeaderComponent,
    StatsCardComponent,
    ActionItemComponent,
    SalesChartComponent,
    AiAssistantComponent
  ],
  templateUrl: './admin-dashboard.component.html',
  styleUrl: './admin-dashboard.component.scss'
})
export class AdminDashboardComponent {
  stats = [
    {
      title: 'Total Sales (Today)',
      value: '₹4,50,000',
      trend: { value: '12% vs yesterday', isPositive: true }
    },
    {
      title: 'Active Workers',
      value: '124',
      subtitle: '3 Sales Reps currently active.'
    },
    {
      title: 'Active Routes',
      value: '8 Routes Live',
      subtitle: '3 Sales Reps currently active.'
    }
  ];

  actions: ActionItem[] = [
    {
      id: '1',
      message: "Scheme 'Diwali Dhamaka' expires in 2 days.",
      actionLabel: 'Extend',
      variant: 'outline'
    },
    {
      id: '2',
      message: "New Distributor 'ABC Traders' waiting for approval.",
      actionLabel: 'Review',
      variant: 'outline'
    },
    {
      id: '3',
      message: '5 Returns requests pending.',
      actionLabel: 'Review',
      variant: 'outline'
    },
    {
      id: '4',
      message: "Product 'Elite Widgets' stock below safety level.",
      actionLabel: 'Order New',
      variant: 'outline'
    },
    {
      id: '5',
      message: 'New Feature Request: Loyalty Program.',
      actionLabel: 'Prioritize',
      variant: 'outline'
    }
  ];

  onActionClick(actionId: string) {
    console.log('Action clicked:', actionId);
    // Handle action based on ID
  }
}

