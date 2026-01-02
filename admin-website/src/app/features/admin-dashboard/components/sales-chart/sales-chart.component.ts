import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

type TimeRange = 'daily' | 'weekly' | 'monthly';

interface ChartData {
  label: string;
  sales: number;
  target: number;
}

@Component({
  selector: 'app-sales-chart',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './sales-chart.component.html',
  styleUrl: './sales-chart.component.scss'
})
export class SalesChartComponent {
  selectedRange: TimeRange = 'daily';

  // Dummy data for different time ranges
  dailyData: ChartData[] = [
    { label: 'Mon', sales: 45000, target: 50000 },
    { label: 'Tue', sales: 52000, target: 50000 },
    { label: 'Wed', sales: 48000, target: 50000 }
  ];

  weeklyData: ChartData[] = [
    { label: 'Week 1', sales: 320000, target: 350000 },
    { label: 'Week 2', sales: 340000, target: 350000 },
    { label: 'Week 3', sales: 360000, target: 350000 },
    { label: 'Week 4', sales: 330000, target: 350000 }
  ];

  monthlyData: ChartData[] = [
    { label: 'Jan', sales: 1200000, target: 1400000 },
    { label: 'Feb', sales: 1350000, target: 1400000 },
    { label: 'Mar', sales: 1450000, target: 1400000 },
    { label: 'Apr', sales: 1300000, target: 1400000 },
    { label: 'May', sales: 1500000, target: 1400000 },
    { label: 'Jun', sales: 1420000, target: 1400000 }
  ];

  get chartData(): ChartData[] {
    switch (this.selectedRange) {
      case 'daily':
        return this.dailyData;
      case 'weekly':
        return this.weeklyData;
      case 'monthly':
        return this.monthlyData;
      default:
        return this.dailyData;
    }
  }

  get maxValue(): number {
    const allValues = this.chartData.flatMap(d => [d.sales, d.target]);
    return Math.max(...allValues) * 1.1; // Add 10% padding
  }

  get chartWidth(): number {
    return 60 + this.chartData.length * 70;
  }

  get chartEndX(): number {
    return this.chartWidth - 10;
  }

  getBarHeight(value: number): number {
    return (value / this.maxValue) * 200; // Max height 200px
  }

  formatValue(value: number): string {
    if (value >= 1000000) {
      return `₹${(value / 1000000).toFixed(1)}M`;
    } else if (value >= 1000) {
      return `₹${(value / 1000).toFixed(0)}K`;
    }
    return `₹${value.toLocaleString()}`;
  }

  selectRange(range: TimeRange) {
    this.selectedRange = range;
    console.log('Selected range:', range);
  }
}

