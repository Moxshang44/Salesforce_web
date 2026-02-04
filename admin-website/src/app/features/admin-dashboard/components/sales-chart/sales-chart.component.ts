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
  selectedRange: TimeRange = 'monthly';

  // Monthly data from Jan to Dec (matching the image)
  monthlyData: ChartData[] = [
    { label: 'Jan', sales: 200000, target: 180000 },
    { label: 'Feb', sales: 220000, target: 200000 },
    { label: 'Mar', sales: 250000, target: 230000 },
    { label: 'Apr', sales: 240000, target: 250000 },
    { label: 'May', sales: 230000, target: 250000 },
    { label: 'Jun', sales: 260000, target: 270000 },
    { label: 'Jul', sales: 280000, target: 300000 },
    { label: 'Aug', sales: 290000, target: 310000 },
    { label: 'Sep', sales: 320000, target: 330000 },
    { label: 'Oct', sales: 350000, target: 360000 },
    { label: 'Nov', sales: 380000, target: 390000 },
    { label: 'Dec', sales: 420000, target: 400000 }
  ];

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

  get chartData(): ChartData[] {
    switch (this.selectedRange) {
      case 'daily':
        return this.dailyData;
      case 'weekly':
        return this.weeklyData;
      case 'monthly':
        return this.monthlyData;
      default:
        return this.monthlyData;
    }
  }

  get maxValue(): number {
    const allValues = this.chartData.flatMap(d => [d.sales, d.target]);
    return Math.max(...allValues) * 1.1; // Add 10% padding
  }

  get minValue(): number {
    const allValues = this.chartData.flatMap(d => [d.sales, d.target]);
    return Math.min(...allValues) * 0.9; // Subtract 10% padding
  }

  get chartWidth(): number {
    return 60 + this.chartData.length * 70;
  }

  get chartHeight(): number {
    return 200;
  }

  get chartEndX(): number {
    return this.chartWidth - 10;
  }

  getYPosition(value: number): number {
    const range = this.maxValue - this.minValue;
    const normalized = (value - this.minValue) / range;
    return 30 + (this.chartHeight - normalized * this.chartHeight);
  }

  formatValue(value: number): string {
    if (value >= 1000000) {
      return `${(value / 1000000).toFixed(1)}M`;
    } else if (value >= 1000) {
      return `${(value / 1000).toFixed(0)}K`;
    }
    return value.toString();
  }

  getLinePath(data: ChartData[], type: 'sales' | 'target'): string {
    const points = data.map((d, i) => {
      const x = 60 + (i * 70) + 37.5;
      const y = this.getYPosition(type === 'sales' ? d.sales : d.target);
      return `${x},${y}`;
    });
    return `M ${points.join(' L ')}`;
  }

  selectRange(range: TimeRange) {
    this.selectedRange = range;
  }
}
