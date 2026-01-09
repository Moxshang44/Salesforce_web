import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatPaginatorModule, MatPaginator } from '@angular/material/paginator';
import { MatSortModule, MatSort } from '@angular/material/sort';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { TallyService } from '../../services/tally.service';
import { Voucher } from '../../models/tally.models';

@Component({
  selector: 'app-vouchers',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatSelectModule,
    MatFormFieldModule,
    MatProgressSpinnerModule,
    MatIconModule,
    MatButtonModule
  ],
  template: `
    <div class="vouchers-page">
      <h1>Vouchers</h1>

      <div *ngIf="loading" class="loading-spinner">
        <mat-spinner></mat-spinner>
      </div>

      <div *ngIf="!loading && error" class="error-message">
        <mat-icon>error</mat-icon>
        <p>{{ error }}</p>
      </div>

      <div *ngIf="!loading && !error" class="table-container">
        <div class="filters">
          <mat-form-field>
            <mat-label>Voucher Type</mat-label>
            <mat-select [formControl]="voucherTypeControl" (selectionChange)="onFilterChange()">
              <mat-option value="">All Types</mat-option>
              <mat-option value="Sales">Sales</mat-option>
              <mat-option value="Purchase">Purchase</mat-option>
              <mat-option value="Receipt">Receipt</mat-option>
              <mat-option value="Payment">Payment</mat-option>
              <mat-option value="Journal">Journal</mat-option>
              <mat-option value="Contra">Contra</mat-option>
            </mat-select>
          </mat-form-field>

          <button mat-raised-button color="primary" (click)="loadVouchers()">
            <mat-icon>refresh</mat-icon>
            Refresh
          </button>
        </div>

        <table mat-table [dataSource]="dataSource" matSort class="vouchers-table">
          <ng-container matColumnDef="date">
            <th mat-header-cell *matHeaderCellDef mat-sort-header>Date</th>
            <td mat-cell *matCellDef="let voucher">{{ formatDate(voucher.date) }}</td>
          </ng-container>

          <ng-container matColumnDef="vouchertypename">
            <th mat-header-cell *matHeaderCellDef mat-sort-header>Type</th>
            <td mat-cell *matCellDef="let voucher">
              <span class="voucher-type">{{ voucher.vouchertypename }}</span>
            </td>
          </ng-container>

          <ng-container matColumnDef="vouchernumber">
            <th mat-header-cell *matHeaderCellDef mat-sort-header>Number</th>
            <td mat-cell *matCellDef="let voucher">{{ voucher.vouchernumber || '-' }}</td>
          </ng-container>

          <ng-container matColumnDef="partyledgername">
            <th mat-header-cell *matHeaderCellDef mat-sort-header>Party</th>
            <td mat-cell *matCellDef="let voucher">{{ voucher.partyledgername || '-' }}</td>
          </ng-container>

          <ng-container matColumnDef="amount">
            <th mat-header-cell *matHeaderCellDef mat-sort-header>Amount</th>
            <td mat-cell *matCellDef="let voucher" class="amount">
              {{ formatAmount(voucher.amount) }}
            </td>
          </ng-container>

          <ng-container matColumnDef="narration">
            <th mat-header-cell *matHeaderCellDef>Narration</th>
            <td mat-cell *matCellDef="let voucher" class="narration">
              {{ voucher.narration || '-' }}
            </td>
          </ng-container>

          <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
          <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
        </table>

        <mat-paginator [pageSizeOptions]="[10, 25, 50, 100]" showFirstLastButtons></mat-paginator>
      </div>
    </div>
  `,
  styles: [`
    .vouchers-page {
      max-width: 1600px;
      margin: 0 auto;
    }

    h1 {
      margin-bottom: 30px;
      color: #1e293b;
    }

    .table-container {
      background: white;
      border-radius: 12px;
      padding: 24px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    }

    .filters {
      display: flex;
      gap: 16px;
      margin-bottom: 20px;
      align-items: center;
    }

    .filters mat-form-field {
      min-width: 200px;
    }

    .vouchers-table {
      width: 100%;
    }

    .vouchers-table th {
      background-color: #f8fafc;
      font-weight: 600;
      color: #1e293b;
    }

    .vouchers-table td {
      padding: 16px 12px;
    }

    .voucher-type {
      padding: 4px 12px;
      border-radius: 12px;
      background-color: #e0e7ff;
      color: #4338ca;
      font-size: 12px;
      font-weight: 500;
    }

    .amount {
      text-align: right;
      font-family: monospace;
      font-weight: 500;
      color: #059669;
    }

    .narration {
      max-width: 300px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
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

    mat-paginator {
      border-top: 1px solid #e2e8f0;
      margin-top: 20px;
    }
  `]
})
export class VouchersComponent implements OnInit {
  loading = true;
  error: string | null = null;
  displayedColumns: string[] = ['date', 'vouchertypename', 'vouchernumber', 'partyledgername', 'amount', 'narration'];
  dataSource = new MatTableDataSource<Voucher>();
  voucherTypeControl = new FormControl('');

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(private tallyService: TallyService) {}

  ngOnInit() {
    this.loadVouchers();
  }

  loadVouchers() {
    this.loading = true;
    this.error = null;

    const voucherType = this.voucherTypeControl.value || undefined;

    this.tallyService.getVouchers(voucherType).subscribe({
      next: (vouchers) => {
        this.dataSource.data = vouchers;
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort;
        this.loading = false;
      },
      error: (err) => {
        this.error = err.message;
        this.loading = false;
      }
    });
  }

  onFilterChange() {
    this.loadVouchers();
  }

  formatDate(value: any): string {
    if (!value) return '-';
    // Tally dates come in YYYYMMDD format
    const str = value.toString();
    if (str.length === 8) {
      return `${str.substring(6, 8)}/${str.substring(4, 6)}/${str.substring(0, 4)}`;
    }
    return value;
  }

  formatAmount(value: any): string {
    if (!value) return '₹0.00';
    const num = parseFloat(value.toString());
    return isNaN(num) ? '₹0.00' : `₹${Math.abs(num).toFixed(2)}`;
  }
}

