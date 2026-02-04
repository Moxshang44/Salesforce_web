import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { SidebarComponent } from '../../core/layout/sidebar/sidebar.component';
import { HeaderComponent } from '../../core/layout/header/header.component';

interface MonthlyTarget {
  month: string;
  shortMonth: string;
  target: number;
  lastYear: number;
}

interface SalesManager {
  id: string;
  name: string;
  role: 'NSM' | 'ZSM' | 'RSM' | 'ASM' | 'SO';
  location: string;
  targetAmount: number;
  percentage: number;
  vsLastYear: number;
  subordinates?: SalesManager[];
  monthlyTargets?: MonthlyTarget[];
}

interface BreadcrumbItem {
  label: string;
  role: string;
  id?: string;
}

@Component({
  selector: 'app-sales',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, SidebarComponent, HeaderComponent],
  templateUrl: './sales.component.html',
  styleUrl: './sales.component.scss'
})
export class SalesComponent implements OnInit {
  totalSalesTarget: string = '1,00,00,00,000';
  totalSalesTargetNumber: number = 10000000000;
  
  breadcrumbs: BreadcrumbItem[] = [
    { label: 'Company', role: 'Company' }
  ];

  currentLevel: 'company' | 'nsm' | 'zsm' | 'rsm' | 'asm' = 'company';
  currentManagers: SalesManager[] = [];
  
  // Sidebar state
  isSidebarOpen: boolean = false;
  selectedManager: SalesManager | null = null;
  allocatedAmount: number = 0;
  remainingAmount: number = 0;

  // Popup state for percentage adjustment
  popupOpenFor: string | null = null;
  tempPercentage: number = 0;
  isLocked: boolean = false;

  // Default monthly targets template
  getDefaultMonthlyTargets(annualTarget: number): MonthlyTarget[] {
    const months = [
      { month: 'January', shortMonth: 'JAN', lyMultiplier: 2.5 },
      { month: 'February', shortMonth: 'FEB', lyMultiplier: 2.2 },
      { month: 'March', shortMonth: 'MAR', lyMultiplier: 2.8 },
      { month: 'April', shortMonth: 'APR', lyMultiplier: 2.1 },
      { month: 'May', shortMonth: 'MAY', lyMultiplier: 2.6 },
      { month: 'June', shortMonth: 'JUN', lyMultiplier: 2.4 },
      { month: 'July', shortMonth: 'JUL', lyMultiplier: 3.0 },
      { month: 'August', shortMonth: 'AUG', lyMultiplier: 2.7 },
      { month: 'September', shortMonth: 'SEP', lyMultiplier: 2.3 },
      { month: 'October', shortMonth: 'OCT', lyMultiplier: 2.9 },
      { month: 'November', shortMonth: 'NOV', lyMultiplier: 2.5 },
      { month: 'December', shortMonth: 'DEC', lyMultiplier: 3.2 }
    ];
    
    return months.map(m => ({
      month: m.month,
      shortMonth: m.shortMonth,
      target: 0,
      lastYear: Math.round((annualTarget / 12) * (m.lyMultiplier / 2.5) / 10000000) // in Lakhs
    }));
  }

  // National Sales Managers (NSM)
  nationalSalesManagers: SalesManager[] = [
    {
      id: 'nsm1',
      name: 'Mahesh Babu',
      role: 'NSM',
      location: 'INDIA',
      targetAmount: 3300000000,
      percentage: 33,
      vsLastYear: 5,
      monthlyTargets: this.getDefaultMonthlyTargets(3300000000),
      subordinates: [
        {
          id: 'zsm1',
          name: 'Jay Mahiyavanshi',
          role: 'ZSM',
          location: 'South Zone',
          targetAmount: 825000000,
          percentage: 25,
          vsLastYear: 7,
          monthlyTargets: this.getDefaultMonthlyTargets(825000000),
          subordinates: [
            {
              id: 'rsm1',
              name: 'Krutik Shah',
              role: 'RSM',
              location: 'Karnataka',
              targetAmount: 412500000,
              percentage: 50,
              vsLastYear: 8,
              monthlyTargets: this.getDefaultMonthlyTargets(412500000)
            },
            {
              id: 'rsm2',
              name: 'Arjun Reddy',
              role: 'RSM',
              location: 'Tamil Nadu',
              targetAmount: 412500000,
              percentage: 50,
              vsLastYear: 6,
              monthlyTargets: this.getDefaultMonthlyTargets(412500000)
            }
          ]
        },
        {
          id: 'zsm2',
          name: 'Rahul Verma',
          role: 'ZSM',
          location: 'North Zone',
          targetAmount: 990000000,
          percentage: 30,
          vsLastYear: 4,
          monthlyTargets: this.getDefaultMonthlyTargets(990000000)
        },
        {
          id: 'zsm3',
          name: 'Amit Sharma',
          role: 'ZSM',
          location: 'West Zone',
          targetAmount: 825000000,
          percentage: 25,
          vsLastYear: 6,
          monthlyTargets: this.getDefaultMonthlyTargets(825000000)
        },
        {
          id: 'zsm4',
          name: 'Priya Nair',
          role: 'ZSM',
          location: 'East Zone',
          targetAmount: 660000000,
          percentage: 20,
          vsLastYear: 3,
          monthlyTargets: this.getDefaultMonthlyTargets(660000000)
        }
      ]
    },
    {
      id: 'nsm2',
      name: 'Ahmed Al-Mansoori',
      role: 'NSM',
      location: 'DUBAI',
      targetAmount: 2200000000,
      percentage: 22,
      vsLastYear: 5,
      monthlyTargets: this.getDefaultMonthlyTargets(2200000000),
      subordinates: [
        {
          id: 'zsm5',
          name: 'Hassan Ali',
          role: 'ZSM',
          location: 'Dubai Central',
          targetAmount: 1100000000,
          percentage: 50,
          vsLastYear: 6,
          monthlyTargets: this.getDefaultMonthlyTargets(1100000000)
        },
        {
          id: 'zsm6',
          name: 'Mohammed Rashid',
          role: 'ZSM',
          location: 'Abu Dhabi',
          targetAmount: 1100000000,
          percentage: 50,
          vsLastYear: 4,
          monthlyTargets: this.getDefaultMonthlyTargets(1100000000)
        }
      ]
    },
    {
      id: 'nsm3',
      name: 'Oliver Bennett',
      role: 'NSM',
      location: 'LONDON',
      targetAmount: 2300000000,
      percentage: 23,
      vsLastYear: 5,
      monthlyTargets: this.getDefaultMonthlyTargets(2300000000),
      subordinates: [
        {
          id: 'zsm7',
          name: 'James Wilson',
          role: 'ZSM',
          location: 'Greater London',
          targetAmount: 1150000000,
          percentage: 50,
          vsLastYear: 7,
          monthlyTargets: this.getDefaultMonthlyTargets(1150000000)
        },
        {
          id: 'zsm8',
          name: 'Emily Thompson',
          role: 'ZSM',
          location: 'South England',
          targetAmount: 1150000000,
          percentage: 50,
          vsLastYear: 3,
          monthlyTargets: this.getDefaultMonthlyTargets(1150000000)
        }
      ]
    },
    {
      id: 'nsm4',
      name: 'Alexander Hayes',
      role: 'NSM',
      location: 'USA',
      targetAmount: 2200000000,
      percentage: 22,
      vsLastYear: 5,
      monthlyTargets: this.getDefaultMonthlyTargets(2200000000),
      subordinates: [
        {
          id: 'zsm9',
          name: 'Michael Johnson',
          role: 'ZSM',
          location: 'East Coast',
          targetAmount: 880000000,
          percentage: 40,
          vsLastYear: 6,
          monthlyTargets: this.getDefaultMonthlyTargets(880000000)
        },
        {
          id: 'zsm10',
          name: 'Sarah Williams',
          role: 'ZSM',
          location: 'West Coast',
          targetAmount: 880000000,
          percentage: 40,
          vsLastYear: 5,
          monthlyTargets: this.getDefaultMonthlyTargets(880000000)
        },
        {
          id: 'zsm11',
          name: 'David Brown',
          role: 'ZSM',
          location: 'Central',
          targetAmount: 440000000,
          percentage: 20,
          vsLastYear: 4,
          monthlyTargets: this.getDefaultMonthlyTargets(440000000)
        }
      ]
    }
  ];

  selectedPath: SalesManager[] = [];

  constructor(private router: Router) {}

  ngOnInit(): void {
    this.currentManagers = this.nationalSalesManagers;
    this.currentLevel = 'company';
  }

  formatCurrency(amount: number): string {
    if (amount >= 10000000) {
      return '₹ ' + (amount / 10000000).toFixed(0) + ' Cr';
    } else if (amount >= 100000) {
      return '₹ ' + (amount / 100000).toFixed(0) + ' L';
    }
    return '₹ ' + amount.toLocaleString('en-IN');
  }

  formatInputCurrency(value: string): void {
    // Remove all non-digit characters
    const numericValue = value.replace(/[^0-9]/g, '');
    if (numericValue) {
      this.totalSalesTargetNumber = parseInt(numericValue, 10);
      // Format with Indian number system
      this.totalSalesTarget = this.totalSalesTargetNumber.toLocaleString('en-IN');
    }
  }

  autoSplitTarget(): void {
    // Simulate AI-based target distribution
    const totalManagers = this.currentManagers.length;
    let remainingPercentage = 100;
    
    this.currentManagers.forEach((manager, index) => {
      if (index === totalManagers - 1) {
        manager.percentage = remainingPercentage;
      } else {
        // Distribute based on location importance (simplified logic)
        const basePercentage = Math.floor(100 / totalManagers);
        const variance = Math.floor(Math.random() * 10) - 5;
        manager.percentage = Math.max(15, Math.min(40, basePercentage + variance));
        remainingPercentage -= manager.percentage;
      }
      manager.targetAmount = (this.totalSalesTargetNumber * manager.percentage) / 100;
    });
  }

  drillDown(manager: SalesManager): void {
    if (manager.subordinates && manager.subordinates.length > 0) {
      this.selectedPath.push(manager);
      this.breadcrumbs.push({
        label: manager.name,
        role: manager.role,
        id: manager.id
      });
      this.currentManagers = manager.subordinates;
      this.updateCurrentLevel();
    }
  }

  navigateToBreadcrumb(index: number): void {
    if (index === 0) {
      // Go back to company level
      this.breadcrumbs = [{ label: 'Company', role: 'Company' }];
      this.selectedPath = [];
      this.currentManagers = this.nationalSalesManagers;
      this.currentLevel = 'company';
    } else {
      // Navigate to specific level
      this.breadcrumbs = this.breadcrumbs.slice(0, index + 1);
      this.selectedPath = this.selectedPath.slice(0, index);
      
      if (this.selectedPath.length > 0) {
        const lastManager = this.selectedPath[this.selectedPath.length - 1];
        this.currentManagers = lastManager.subordinates || [];
      } else {
        this.currentManagers = this.nationalSalesManagers;
      }
      this.updateCurrentLevel();
    }
  }

  updateCurrentLevel(): void {
    if (this.breadcrumbs.length === 1) {
      this.currentLevel = 'company';
    } else {
      const lastRole = this.breadcrumbs[this.breadcrumbs.length - 1].role;
      switch (lastRole) {
        case 'NSM':
          this.currentLevel = 'nsm';
          break;
        case 'ZSM':
          this.currentLevel = 'zsm';
          break;
        case 'RSM':
          this.currentLevel = 'rsm';
          break;
        case 'ASM':
          this.currentLevel = 'asm';
          break;
        default:
          this.currentLevel = 'company';
      }
    }
  }

  getAllocationTitle(): string {
    switch (this.currentLevel) {
      case 'company':
        return 'Company Allocation';
      case 'nsm':
        return 'Zonal Allocation';
      case 'zsm':
        return 'Regional Allocation';
      case 'rsm':
        return 'Area Allocation';
      case 'asm':
        return 'Sales Officer Allocation';
      default:
        return 'Allocation';
    }
  }

  updateManagerTarget(manager: SalesManager, event: Event): void {
    const input = event.target as HTMLInputElement;
    const value = input.value.replace(/[^0-9]/g, '');
    if (value) {
      manager.targetAmount = parseInt(value, 10) * 10000000; // Convert Cr to actual value
      this.recalculatePercentages();
    }
  }

  recalculatePercentages(): void {
    const totalTarget = this.currentManagers.reduce((sum, m) => sum + m.targetAmount, 0);
    this.currentManagers.forEach(manager => {
      manager.percentage = Math.round((manager.targetAmount / totalTarget) * 100);
    });
  }

  // Sidebar methods
  openSidebar(manager: SalesManager, event: Event): void {
    event.stopPropagation();
    this.selectedManager = manager;
    this.isSidebarOpen = true;
    this.calculateAllocations();
  }

  closeSidebar(): void {
    this.isSidebarOpen = false;
    this.selectedManager = null;
  }

  calculateAllocations(): void {
    if (this.selectedManager && this.selectedManager.monthlyTargets) {
      this.allocatedAmount = this.selectedManager.monthlyTargets.reduce((sum, m) => sum + (m.target * 10000000), 0);
      this.remainingAmount = this.selectedManager.targetAmount - this.allocatedAmount;
    }
  }

  formatCrores(amount: number): string {
    return (amount / 10000000).toFixed(2);
  }

  formatLakhs(amount: number): string {
    return amount + 'L';
  }

  updateMonthlyTarget(index: number, event: Event): void {
    if (this.selectedManager && this.selectedManager.monthlyTargets) {
      const input = event.target as HTMLInputElement;
      const value = parseFloat(input.value) || 0;
      this.selectedManager.monthlyTargets[index].target = value;
      this.calculateAllocations();
    }
  }

  autoSplitMonthly(): void {
    if (this.selectedManager && this.selectedManager.monthlyTargets) {
      const monthlyAmount = this.selectedManager.targetAmount / 12 / 10000000; // Convert to Crores
      this.selectedManager.monthlyTargets.forEach(m => {
        m.target = Math.round(monthlyAmount * 100) / 100;
      });
      this.calculateAllocations();
    }
  }

  matchWithLastYear(): void {
    if (this.selectedManager && this.selectedManager.monthlyTargets) {
      this.selectedManager.monthlyTargets.forEach(m => {
        m.target = m.lastYear / 100; // Convert lakhs to crores
      });
      this.calculateAllocations();
    }
  }

  resetMonthlyTargets(): void {
    if (this.selectedManager && this.selectedManager.monthlyTargets) {
      this.selectedManager.monthlyTargets.forEach(m => {
        m.target = 0;
      });
      this.calculateAllocations();
    }
  }

  saveTargets(): void {
    // Save logic here - could emit to parent or call API
    console.log('Saving targets for:', this.selectedManager?.name);
    console.log('Monthly targets:', this.selectedManager?.monthlyTargets);
    this.closeSidebar();
  }

  // Popup methods for percentage adjustment
  openPercentagePopup(manager: SalesManager, event: Event): void {
    event.stopPropagation();
    this.popupOpenFor = manager.id;
    this.tempPercentage = manager.percentage;
    this.isLocked = false;
  }

  closePercentagePopup(): void {
    this.popupOpenFor = null;
    this.tempPercentage = 0;
    this.isLocked = false;
  }

  applyPercentage(): void {
    if (this.popupOpenFor) {
      const manager = this.currentManagers.find(m => m.id === this.popupOpenFor);
      if (manager) {
        manager.percentage = this.tempPercentage;
        // Recalculate target amount based on percentage
        const totalTarget = this.currentManagers.reduce((sum, m) => {
          if (m.id === this.popupOpenFor) {
            return sum;
          }
          return sum + m.targetAmount;
        }, 0);
        manager.targetAmount = (this.totalSalesTargetNumber * manager.percentage) / 100;
        // Recalculate other managers' percentages if not locked
        this.recalculatePercentages();
      }
    }
    this.closePercentagePopup();
  }

  toggleLock(): void {
    this.isLocked = !this.isLocked;
  }
}

