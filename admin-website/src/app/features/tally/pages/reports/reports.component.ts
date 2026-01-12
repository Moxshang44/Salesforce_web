import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatTabsModule } from '@angular/material/tabs';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { TallyService } from '../../services/tally.service';
import { Ledger } from '../../models/tally.models';

@Component({
  selector: 'app-reports',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatTableModule,
    MatTabsModule,
    MatProgressSpinnerModule,
    MatIconModule
  ],
  template: `
    <div class="reports-page">
      <h1>Reports</h1>

      <div *ngIf="loading" class="loading-spinner">
        <mat-spinner></mat-spinner>
      </div>

      <div *ngIf="!loading && error" class="error-message">
        <mat-icon>error</mat-icon>
        <p>{{ error }}</p>
      </div>

      <div *ngIf="!loading && !error">
        <!-- Summary Cards -->
        <div class="summary-cards">
          <mat-card class="summary-card receivables">
            <mat-card-content>
              <div class="icon">
                <mat-icon>arrow_upward</mat-icon>
              </div>
              <div class="details">
                <h3>Total Receivables</h3>
                <p class="amount">₹{{ summary.totalReceivables | number:'1.2-2' }}</p>
                <span class="count">{{ summary.receivablesCount }} parties</span>
              </div>
            </mat-card-content>
          </mat-card>

          <mat-card class="summary-card payables">
            <mat-card-content>
              <div class="icon">
                <mat-icon>arrow_downward</mat-icon>
              </div>
              <div class="details">
                <h3>Total Payables</h3>
                <p class="amount">₹{{ summary.totalPayables | number:'1.2-2' }}</p>
                <span class="count">{{ summary.payablesCount }} parties</span>
              </div>
            </mat-card-content>
          </mat-card>
        </div>

        <!-- Outstanding Tables -->
        <mat-tab-group class="outstanding-tabs">
          <mat-tab label="Receivables">
            <div class="table-container">
              <table mat-table [dataSource]="receivablesDataSource" class="outstanding-table">
                <ng-container matColumnDef="name">
                  <th mat-header-cell *matHeaderCellDef>Party Name</th>
                  <td mat-cell *matCellDef="let ledger">{{ ledger.name }}</td>
                </ng-container>

                <ng-container matColumnDef="parent">
                  <th mat-header-cell *matHeaderCellDef>Group</th>
                  <td mat-cell *matCellDef="let ledger">{{ ledger.parent || '-' }}</td>
                </ng-container>

                <ng-container matColumnDef="closingbalance">
                  <th mat-header-cell *matHeaderCellDef>Amount</th>
                  <td mat-cell *matCellDef="let ledger" class="amount receivable">
                    {{ formatAmount(ledger.closingbalance) }}
                  </td>
                </ng-container>

                <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
                <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
              </table>

              <div *ngIf="receivablesDataSource.data.length === 0" class="no-data">
                <mat-icon>check_circle</mat-icon>
                <p>No outstanding receivables</p>
              </div>
            </div>
          </mat-tab>

          <mat-tab label="Payables">
            <div class="table-container">
              <table mat-table [dataSource]="payablesDataSource" class="outstanding-table">
                <ng-container matColumnDef="name">
                  <th mat-header-cell *matHeaderCellDef>Party Name</th>
                  <td mat-cell *matCellDef="let ledger">{{ ledger.name }}</td>
                </ng-container>

                <ng-container matColumnDef="parent">
                  <th mat-header-cell *matHeaderCellDef>Group</th>
                  <td mat-cell *matCellDef="let ledger">{{ ledger.parent || '-' }}</td>
                </ng-container>

                <ng-container matColumnDef="closingbalance">
                  <th mat-header-cell *matHeaderCellDef>Amount</th>
                  <td mat-cell *matCellDef="let ledger" class="amount payable">
                    {{ formatAmount(ledger.closingbalance) }}
                  </td>
                </ng-container>

                <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
                <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
              </table>

              <div *ngIf="payablesDataSource.data.length === 0" class="no-data">
                <mat-icon>check_circle</mat-icon>
                <p>No outstanding payables</p>
              </div>
            </div>
          </mat-tab>
        </mat-tab-group>
      </div>
    </div>
  `,
  styles: [`
    .reports-page {
      max-width: 1400px;
      margin: 0 auto;
    }

    h1 {
      margin-bottom: 30px;
      color: #1e293b;
    }

    .summary-cards {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 20px;
      margin-bottom: 30px;
    }

    .summary-card {
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    }

    .summary-card mat-card-content {
      display: flex;
      align-items: center;
      gap: 20px;
      padding: 24px !important;
    }

    .summary-card .icon {
      width: 60px;
      height: 60px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .receivables .icon {
      background-color: #dcfce7;
    }

    .receivables .icon mat-icon {
      color: #16a34a;
      font-size: 32px;
      width: 32px;
      height: 32px;
    }

    .payables .icon {
      background-color: #fee2e2;
    }

    .payables .icon mat-icon {
      color: #dc2626;
      font-size: 32px;
      width: 32px;
      height: 32px;
    }

    .summary-card .details h3 {
      margin: 0 0 8px 0;
      font-size: 14px;
      color: #64748b;
      font-weight: 500;
    }

    .summary-card .amount {
      margin: 0;
      font-size: 28px;
      font-weight: 600;
      color: #1e293b;
    }

    .summary-card .count {
      font-size: 12px;
      color: #94a3b8;
    }

    .outstanding-tabs {
      background: white;
      border-radius: 12px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    }

    .table-container {
      padding: 24px;
      min-height: 300px;
    }

    .outstanding-table {
      width: 100%;
    }

    .outstanding-table th {
      background-color: #f8fafc;
      font-weight: 600;
      color: #1e293b;
    }

    .outstanding-table td {
      padding: 16px 12px;
    }

    .amount {
      text-align: right;
      font-family: monospace;
      font-weight: 600;
      font-size: 16px;
    }

    .receivable {
      color: #059669;
    }

    .payable {
      color: #dc2626;
    }

    .no-data {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 60px;
      color: #94a3b8;
    }

    .no-data mat-icon {
      font-size: 64px;
      width: 64px;
      height: 64px;
      margin-bottom: 16px;
      color: #d1d5db;
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
export class ReportsComponent implements OnInit {
  loading = true;
  error: string | null = null;
  displayedColumns: string[] = ['name', 'parent', 'closingbalance'];
  
  receivablesDataSource = new MatTableDataSource<Ledger>();
  payablesDataSource = new MatTableDataSource<Ledger>();
  
  summary = {
    totalReceivables: 0,
    totalPayables: 0,
    receivablesCount: 0,
    payablesCount: 0
  };

  constructor(private tallyService: TallyService) {}

  ngOnInit() {
    this.loadOutstandingReport();
  }

  loadOutstandingReport() {
    this.loading = true;
    this.error = null;

    this.tallyService.getOutstandingReport().subscribe({
      next: (result) => {
        this.receivablesDataSource.data = result.data.receivables || [];
        this.payablesDataSource.data = result.data.payables || [];
        this.summary = result.summary;
        this.loading = false;
      },
      error: (err) => {
        this.error = err.message;
        this.loading = false;
      }
    });
  }

  formatAmount(value: any): string {
    if (!value) return '₹0.00';
    const num = parseFloat(value.toString());
    return isNaN(num) ? '₹0.00' : `₹${Math.abs(num).toFixed(2)}`;
  }
}

