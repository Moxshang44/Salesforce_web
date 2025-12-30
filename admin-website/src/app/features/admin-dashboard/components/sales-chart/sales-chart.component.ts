import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

type TimeRange = 'daily' | 'weekly' | 'monthly';

@Component({
  selector: 'app-sales-chart',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './sales-chart.component.html',
  styleUrl: './sales-chart.component.scss'
})
export class SalesChartComponent {
  selectedRange: TimeRange = 'daily';

  selectRange(range: TimeRange) {
    this.selectedRange = range;
    console.log('Selected range:', range);
  }
}

