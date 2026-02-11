import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Params } from '@angular/router';
import { SidebarComponent } from '../../core/layout/sidebar/sidebar.component';
import { HeaderComponent } from '../../core/layout/header/header.component';
import { BaseChartDirective } from 'ng2-charts';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  ChartData,
  ChartOptions,
  TooltipItem
} from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement);

interface KpiCard {
  title: string;
  value: string;
  valueColor: string;
  insightText: string;
  insightColor: string;
  icon: 'up' | 'info' | 'warning' | null;
}

interface AttendanceSummary {
  presentDays: number;
  absentDays: number;
  totalHours: number;
}

interface TimeDistributionSegment {
  label: string;
  percentage: number;
  colorKey: 'inStore' | 'travel' | 'meetings' | 'other';
}

interface ProductivityScoreModel {
  score: number;
  statusText: string;
  description: string;
}

interface OutletSummary {
  name: string;
  lastOrderDaysAgo: number;
}

interface OutletNotVisitedModel {
  count: number;
  label: string;
  topOutlets: OutletSummary[];
}

interface RoutePerformanceRow {
  routeName: string;
  outletCoveragePercent: number;
  outletCoverageState: 'good' | 'medium' | 'bad';
  totalSales: number;
  avgOrderValue: number;
  visitBillRatioPercent: number;
  visitBillState: 'good' | 'medium' | 'bad';
}

interface ProductTag {
  productName: string;
  unitsLabel: string;
  severity: 'zero' | 'low' | 'high';
}

interface ProductPerformanceGroups {
  zeroSales: ProductTag[];
  lowSales: ProductTag[];
  highSales: ProductTag[];
}

interface ReturnReason {
  label: string;
  percentage: number;
  colorKey: 'green' | 'yellow' | 'red';
}

interface ReturnClaimsModel {
  totalValue: number;
  returnRatePercent: number;
  reasons: ReturnReason[];
}

@Component({
  selector: 'app-report',
  standalone: true,
  imports: [CommonModule, SidebarComponent, HeaderComponent, BaseChartDirective],
  templateUrl: './report.component.html',
  styleUrl: './report.component.scss'
})
export class ReportComponent implements OnInit {
  employeeId: string | null = null;
  employeeName: string | null = null;
  employeeCode: string | null = null;

  activeRange: 'FTD' | 'MTD' | 'YTD' | 'CUSTOM' = 'MTD';

  // Column chart base data (mock)
  private readonly targetValues: number[] = [
    12000, 13000, 11000, 12500, 14000, 14500, 13500, 13000, 12000, 15000,
    15200, 14800, 14000, 13800, 13600, 13400, 13200, 13000, 12800, 12600,
    12400, 12200, 12000, 11800, 11600, 11400, 11200, 11000, 10800, 10600
  ];

  private readonly achievedValues: number[] = [
    9000, 11000, 10000, 9500, 13500, 12000, 12500, 11800, 11500, 14000,
    14200, 13800, 13000, 12800, 12600, 12000, 11800, 11500, 11200, 11000,
    10500, 12000, 11800, 11200, 11000, 10800, 10000, 12000, 11500, 11200
  ];

  private readonly remainingValues: number[] = this.targetValues.map(
    (target, index) => Math.max(target - this.achievedValues[index], 0)
  );

  private readonly totalTarget = this.targetValues.reduce((sum, v) => sum + v, 0);
  private readonly totalAchieved = this.achievedValues.reduce((sum, v) => sum + v, 0);
  private readonly totalRemaining = Math.max(this.totalTarget - this.totalAchieved, 0);

  // For center label in donut
  donutPercentage = Math.round((this.totalAchieved / this.totalTarget) * 100);

  // KPI cards configuration (static UI data)
  kpiCards: KpiCard[] = [
    {
      title: 'New Outlets Added',
      value: '12',
      valueColor: '#000000',
      insightText: '8% vs last month',
      insightColor: '#47BE7D',
      icon: 'up'
    },
    {
      title: 'Total Outlets Visited',
      value: '145',
      valueColor: '#000000',
      insightText: '12% vs last month',
      insightColor: '#47BE7D',
      icon: 'up'
    },
    {
      title: 'Low Order Value Outlets',
      value: '28',
      valueColor: '#E65B5B',
      insightText: 'High Concern',
      insightColor: '#E65B5B',
      icon: 'info'
    },
    {
      title: 'Zero Order Value',
      value: '15',
      valueColor: '#E65B5B',
      insightText: 'Needs Audit',
      insightColor: '#E65B5B',
      icon: 'warning'
    },
    {
      title: 'Products with no Order',
      value: '08',
      valueColor: '#000000',
      insightText: 'Stable',
      insightColor: '#5A5A5B',
      icon: null
    }
  ];

  // Attendance & time utilization
  attendanceSummary: AttendanceSummary = {
    presentDays: 28,
    absentDays: 2,
    totalHours: 224
  };

  timeDistribution: TimeDistributionSegment[] = [
    { label: 'Instore', percentage: 50, colorKey: 'inStore' },
    { label: 'Travel', percentage: 30, colorKey: 'travel' },
    { label: 'Other', percentage: 20, colorKey: 'other' }
  ];

  attendanceInsight =
    'High Travel time vs productive time observed on Route 4.';

  // Productivity score
  productivityScore: ProductivityScoreModel = {
    score: 75,
    statusText: 'Good',
    description:
      'Conversion is high, but Travel time reduces overall potential. Focus on route density'
  };

  // Outlet not visited
  outletNotVisited: OutletNotVisitedModel = {
    count: 12,
    label: 'Inactive Outlets visit (>45 Days)',
    topOutlets: [
      { name: 'Sharma General Store', lastOrderDaysAgo: 52 },
      { name: 'Shiv Kirana Store', lastOrderDaysAgo: 48 },
      { name: 'Apna Bazar', lastOrderDaysAgo: 46 }
    ]
  };

  // Route-wise performance
  routePerformanceRows: RoutePerformanceRow[] = [
    {
      routeName: 'Andheri West - A',
      outletCoveragePercent: 92,
      outletCoverageState: 'good',
      totalSales: 45200,
      avgOrderValue: 1250,
      visitBillRatioPercent: 85,
      visitBillState: 'good'
    },
    {
      routeName: 'Borivali East - A',
      outletCoveragePercent: 78,
      outletCoverageState: 'medium',
      totalSales: 23200,
      avgOrderValue: 980,
      visitBillRatioPercent: 60,
      visitBillState: 'medium'
    },
    {
      routeName: 'Malad West - B',
      outletCoveragePercent: 15,
      outletCoverageState: 'bad',
      totalSales: 15200,
      avgOrderValue: 1650,
      visitBillRatioPercent: 40,
      visitBillState: 'bad'
    },
    {
      routeName: 'Malad West - B',
      outletCoveragePercent: 80,
      outletCoverageState: 'good',
      totalSales: 25260,
      avgOrderValue: 1050,
      visitBillRatioPercent: 30,
      visitBillState: 'bad'
    },
    {
      routeName: 'Malad West - B',
      outletCoveragePercent: 67,
      outletCoverageState: 'medium',
      totalSales: 45700,
      avgOrderValue: 1350,
      visitBillRatioPercent: 60,
      visitBillState: 'medium'
    }
  ];

  // Product performance issues
  productPerformance: ProductPerformanceGroups = {
    zeroSales: [
      { productName: 'Orange Cream Large', unitsLabel: '0 Units', severity: 'zero' },
      { productName: 'Choco Chip Standard', unitsLabel: '0 Units', severity: 'zero' },
      { productName: 'Butter Cookies 200g', unitsLabel: '0 Units', severity: 'zero' }
    ],
    lowSales: [
      { productName: 'Orange Cream Large', unitsLabel: '40 Units', severity: 'low' },
      { productName: 'Choco Chip Standard', unitsLabel: '40 Units', severity: 'low' },
      { productName: 'Butter Cookies 200g', unitsLabel: '40 Units', severity: 'low' }
    ],
    highSales: [
      { productName: 'Orange Cream Large', unitsLabel: '40 Units', severity: 'high' },
      { productName: 'Choco Chip Standard', unitsLabel: '40 Units', severity: 'high' },
      { productName: 'Butter Cookies 200g', unitsLabel: '40 Units', severity: 'high' }
    ]
  };

  // Return & claims
  returnClaims: ReturnClaimsModel = {
    totalValue: 4200,
    returnRatePercent: 5.2,
    reasons: [
      { label: 'Damage in Transit', percentage: 60, colorKey: 'green' },
      { label: 'Expiry', percentage: 30, colorKey: 'yellow' },
      { label: 'Wrong Supply', percentage: 10, colorKey: 'red' }
    ]
  };

  // Donut chart configuration
  donutChartData: ChartData<'doughnut'> = {
    labels: ['Achieved', 'Remaining'],
    datasets: [
      {
        // Use rupee values so tooltips show actual amounts
        data: [this.totalAchieved, this.totalRemaining],
        borderWidth: 0,
        hoverOffset: 2,
        backgroundColor: (context) => {
          const chart = context.chart;
          const { ctx, chartArea } = chart;
          if (!chartArea) {
            // Chart not yet fully initialized
            return context.dataIndex === 0 ? '#6C4423' : '#E8DED3';
          }

          const gradient = ctx.createLinearGradient(
            0,
            chartArea.bottom,
            0,
            chartArea.top
          );
          gradient.addColorStop(0, '#6C4423');
          gradient.addColorStop(1, '#D28444');

          // Achieved slice
          if (context.dataIndex === 0) {
            return gradient;
          }

          // Remaining slice
          return '#E8DED3';
        }
      }
    ]
  };

  donutChartOptions: ChartOptions<'doughnut'> = {
    responsive: true,
    cutout: '70%',
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        enabled: true,
        callbacks: {
          label: (context: TooltipItem<'doughnut'>) => {
            const label = context.label || '';
            const rawValue = context.raw as number;
            const formatted = rawValue.toLocaleString('en-IN');
            return `${label}: ₹ ${formatted}`;
          }
        }
      }
    }
  };

  barChartData: ChartData<'bar'> = {
    labels: Array.from({ length: 30 }, (_, i) =>
      (i + 1).toString().padStart(2, '0')
    ),
    datasets: [
      {
        // Bottom segment: achieved (gradient)
        label: 'Achieved',
        data: this.achievedValues,
        stack: 'total',
        borderRadius: 0,
        barPercentage: 0.8,
        categoryPercentage: 0.9,
        backgroundColor: (context) => {
          const chart = context.chart;
          const { ctx, chartArea } = chart;
          if (!chartArea) {
            return '#6C4423';
          }

          const gradient = ctx.createLinearGradient(
            0,
            chartArea.bottom,
            0,
            chartArea.top
          );
          gradient.addColorStop(0, '#6C4423');
          gradient.addColorStop(1, '#D28444');

          return gradient;
        }
      },
      {
        // Top segment: remaining target (light color)
        label: 'Remaining',
        data: this.remainingValues,
        stack: 'total',
        backgroundColor: '#D3C5B8',
        borderRadius: 0,
        barPercentage: 0.8,
        categoryPercentage: 0.9
      }
    ]
  };

  barChartOptions: ChartOptions<'bar'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        enabled: true
      }
    },
    scales: {
      x: {
        stacked: true,
        grid: {
          display: false
        },
        ticks: {
          color: '#6B6B6B',
          font: {
            size: 11
          }
        }
      },
      y: {
        stacked: true,
        grid: {
          color: '#F0E4D7'
        },
        ticks: {
          color: '#6B6B6B',
          font: {
            size: 11
          },
          callback: (value) => {
            const numeric = typeof value === 'string' ? parseFloat(value) : value;
            if (Number.isNaN(numeric)) {
              return value;
            }
            return `₹ ${numeric.toLocaleString('en-IN')}`;
          }
        },
        beginAtZero: true,
        suggestedMax: 16000
      }
    }
  };

  get hasEmployeeContext(): boolean {
    return !!(this.employeeId || this.employeeName || this.employeeCode);
  }

  constructor(private route: ActivatedRoute) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe((params: Params) => {
      this.employeeId = params['employeeId'] ?? null;
      this.employeeName = params['employeeName'] ?? null;
      this.employeeCode = params['employeeCode'] ?? null;
    });
  }

  setRange(range: 'FTD' | 'MTD' | 'YTD' | 'CUSTOM'): void {
    this.activeRange = range;
  }
}

