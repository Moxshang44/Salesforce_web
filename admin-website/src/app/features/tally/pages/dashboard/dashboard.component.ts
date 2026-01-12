import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { TallyService } from '../../services/tally.service';
import { forkJoin } from 'rxjs';

interface DashboardStats {
  companies: number;
  ledgers: number;
  stockItems: number;
  totalReceivables: number;
  totalPayables: number;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatIconModule,
    MatProgressSpinnerModule
  ],
  template: `
    <div class="dashboard">
      <h1>Dashboard</h1>
      
      <div *ngIf="loading" class="loading-spinner">
        <mat-spinner></mat-spinner>
      </div>

      <div *ngIf="!loading && error" class="error-message">
        <mat-icon>error</mat-icon>
        <p>{{ error }}</p>
      </div>

      <div *ngIf="!loading && !error" class="stats-grid">
        <mat-card class="stat-card">
          <mat-card-content>
            <div class="stat-icon companies">
              <mat-icon>business</mat-icon>
            </div>
            <div class="stat-details">
              <h3>{{ stats.companies }}</h3>
              <p>Companies</p>
            </div>
          </mat-card-content>
        </mat-card>

        <mat-card class="stat-card">
          <mat-card-content>
            <div class="stat-icon ledgers">
              <mat-icon>account_balance_wallet</mat-icon>
            </div>
            <div class="stat-details">
              <h3>{{ stats.ledgers }}</h3>
              <p>Ledgers</p>
            </div>
          </mat-card-content>
        </mat-card>

        <mat-card class="stat-card">
          <mat-card-content>
            <div class="stat-icon stock">
              <mat-icon>inventory_2</mat-icon>
            </div>
            <div class="stat-details">
              <h3>{{ stats.stockItems }}</h3>
              <p>Stock Items</p>
            </div>
          </mat-card-content>
        </mat-card>

        <mat-card class="stat-card">
          <mat-card-content>
            <div class="stat-icon receivables">
              <mat-icon>trending_up</mat-icon>
            </div>
            <div class="stat-details">
              <h3>₹{{ stats.totalReceivables | number:'1.2-2' }}</h3>
              <p>Total Receivables</p>
            </div>
          </mat-card-content>
        </mat-card>

        <mat-card class="stat-card">
          <mat-card-content>
            <div class="stat-icon payables">
              <mat-icon>trending_down</mat-icon>
            </div>
            <div class="stat-details">
              <h3>₹{{ stats.totalPayables | number:'1.2-2' }}</h3>
              <p>Total Payables</p>
            </div>
          </mat-card-content>
        </mat-card>
      </div>
    </div>
  `,
  styles: [`
    .dashboard {
      max-width: 1400px;
      margin: 0 auto;
    }

    h1 {
      margin-bottom: 30px;
      color: #1e293b;
    }

    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 20px;
    }

    .stat-card {
      background: white;
      border-radius: 12px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
      transition: transform 0.2s;
    }

    .stat-card:hover {
      transform: translateY(-4px);
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    }

    .stat-card mat-card-content {
      display: flex;
      align-items: center;
      gap: 20px;
      padding: 24px !important;
    }

    .stat-icon {
      width: 60px;
      height: 60px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .stat-icon mat-icon {
      font-size: 32px;
      width: 32px;
      height: 32px;
      color: white;
    }

    .stat-icon.companies { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); }
    .stat-icon.ledgers { background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); }
    .stat-icon.stock { background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%); }
    .stat-icon.receivables { background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%); }
    .stat-icon.payables { background: linear-gradient(135deg, #fa709a 0%, #fee140 100%); }

    .stat-details h3 {
      margin: 0;
      font-size: 28px;
      font-weight: 600;
      color: #1e293b;
    }

    .stat-details p {
      margin: 4px 0 0 0;
      font-size: 14px;
      color: #64748b;
    }

    .loading-spinner {
      display: flex;
      justify-content: center;
      padding: 60px;
    }

    .error-message {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 20px;
      background-color: #fee;
      border-radius: 8px;
      color: #c00;
    }
  `]
})
export class DashboardComponent implements OnInit {
  loading = true;
  error: string | null = null;
  stats: DashboardStats = {
    companies: 0,
    ledgers: 0,
    stockItems: 0,
    totalReceivables: 0,
    totalPayables: 0
  };

  constructor(private tallyService: TallyService) {}

  ngOnInit() {
    this.loadDashboardData();
  }

  loadDashboardData() {
    this.loading = true;
    this.error = null;

    forkJoin({
      companies: this.tallyService.getCompanies(),
      ledgers: this.tallyService.getAllLedgers(),
      stock: this.tallyService.getAllStockItems(),
      outstanding: this.tallyService.getOutstandingReport()
    }).subscribe({
      next: (data) => {
        this.stats = {
          companies: data.companies.length,
          ledgers: data.ledgers.length,
          stockItems: data.stock.length,
          totalReceivables: data.outstanding.summary?.totalReceivables || 0,
          totalPayables: data.outstanding.summary?.totalPayables || 0
        };
        this.loading = false;
      },
      error: (err) => {
        this.error = err.message;
        this.loading = false;
      }
    });
  }
}

