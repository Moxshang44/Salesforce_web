import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterOutlet } from '@angular/router';
import { DmsSidebarComponent } from '../components/dms-sidebar/dms-sidebar.component';
import { HeaderComponent } from '../../../core/layout/header/header.component';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { TallyNavComponent } from '../../tally/components/tally-nav/tally-nav.component';
import { TallyService } from '../../tally/services/tally.service';

interface ExtractionLog {
  id: number;
  type: string;
  timeframe: string;
  rows: number;
  createdAt: string;
  status: 'Success' | 'Pending' | 'Error';
}

@Component({
  selector: 'app-billing-mode',
  standalone: true,
  imports: [
    CommonModule,
    DmsSidebarComponent,
    HeaderComponent,
    ButtonComponent,
    RouterOutlet,
    TallyNavComponent
  ],
  templateUrl: './billing-mode.component.html',
  styleUrl: './billing-mode.component.scss'
})
export class BillingModeComponent implements OnInit {
  activeTab = 'tally';
  currentMode = 'TALLY';
  modeType = 'Flexi';
  showSwitchModal = false;
  showUnmappedAlert = true;
  unmappedCount = 85;
  isTallyConnected = false;
  testingConnection = false;
  
  // Overview data
  lastSyncTime = 'Today, 10:45 AM';
  lastSyncStatus = 'Successful (2 mins ago)';
  invoicesPulled = 1245;
  invoicesChange = '+5%';
  stockPulled = 45890;
  stockTime = '10:45 AM';
  
  extractionLogs: ExtractionLog[] = [
    {
      id: 1,
      type: 'Incremental Invoice',
      timeframe: 'Last 4 Hours',
      rows: 320,
      createdAt: '10:45 AM, Today',
      status: 'Success'
    },
    {
      id: 2,
      type: 'Stock Update',
      timeframe: 'Daily',
      rows: 45890,
      createdAt: '03:30 AM, Today',
      status: 'Success'
    },
    {
      id: 3,
      type: 'Incremental Invoice',
      timeframe: 'Last 4 Hours',
      rows: 215,
      createdAt: '06:45 AM, Today',
      status: 'Success'
    },
    {
      id: 4,
      type: 'Mapping Sync',
      timeframe: 'Manual',
      rows: 50,
      createdAt: 'Yesterday, 5:00 PM',
      status: 'Pending'
    }
  ];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private tallyService: TallyService
  ) {}

  ngOnInit() {
    // Check for tab query parameter
    const tab = this.route.snapshot.queryParams['tab'];
    if (tab && ['overview', 'mapping', 'sync-logs', 'data-trust', 'tally'].includes(tab)) {
      this.activeTab = tab;
    }
    // Check Tally connection status
    this.checkTallyConnection();
  }

  checkTallyConnection(): void {
    this.testingConnection = true;
    this.tallyService.testConnection().subscribe({
      next: (connected) => {
        this.isTallyConnected = connected;
        this.testingConnection = false;
      },
      error: () => {
        this.isTallyConnected = false;
        this.testingConnection = false;
      }
    });
  }

  setActiveTab(tab: string): void {
    this.activeTab = tab;
    // Update URL with tab parameter
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { tab },
      queryParamsHandling: 'merge'
    });
  }

  onSwitchMode(): void {
    this.showSwitchModal = true;
  }

  closeSwitchModal(): void {
    this.showSwitchModal = false;
  }

  confirmSwitch(): void {
    // Handle mode switch logic here
    console.log('Switching billing mode');
    this.closeSwitchModal();
    // Update mode after switch
    // this.currentMode = 'MANUAL';
  }

  onFixMapping(): void {
    this.setActiveTab('mapping');
    this.showUnmappedAlert = false;
  }

  dismissUnmappedAlert(): void {
    this.showUnmappedAlert = false;
  }

  getStatusClass(status: string): string {
    switch (status.toLowerCase()) {
      case 'success':
        return 'status-success';
      case 'pending':
        return 'status-pending';
      case 'error':
        return 'status-error';
      default:
        return '';
    }
  }
}

