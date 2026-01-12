import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatPaginatorModule, MatPaginator } from '@angular/material/paginator';
import { MatSortModule, MatSort } from '@angular/material/sort';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { TallyService } from '../../services/tally.service';
import { StockItem } from '../../models/tally.models';

@Component({
  selector: 'app-stock',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatInputModule,
    MatFormFieldModule,
    MatProgressSpinnerModule,
    MatIconModule
  ],
  template: `
    <div class="stock-page">
      <h1>Stock Items</h1>

      <div *ngIf="loading" class="loading-spinner">
        <mat-spinner></mat-spinner>
      </div>

      <div *ngIf="!loading && error" class="error-message">
        <mat-icon>error</mat-icon>
        <p>{{ error }}</p>
      </div>

      <div *ngIf="!loading && !error" class="table-container">
        <mat-form-field class="search-field">
          <mat-label>Search Stock Items</mat-label>
          <input matInput (keyup)="applyFilter($event)" placeholder="Search by name...">
          <mat-icon matSuffix>search</mat-icon>
        </mat-form-field>

        <table mat-table [dataSource]="dataSource" matSort class="stock-table">
          <ng-container matColumnDef="name">
            <th mat-header-cell *matHeaderCellDef mat-sort-header>Item Name</th>
            <td mat-cell *matCellDef="let item">{{ item.name }}</td>
          </ng-container>

          <ng-container matColumnDef="parent">
            <th mat-header-cell *matHeaderCellDef mat-sort-header>Category</th>
            <td mat-cell *matCellDef="let item">{{ item.parent || '-' }}</td>
          </ng-container>

          <ng-container matColumnDef="baseunits">
            <th mat-header-cell *matHeaderCellDef mat-sort-header>Unit</th>
            <td mat-cell *matCellDef="let item">{{ item.baseunits || '-' }}</td>
          </ng-container>

          <ng-container matColumnDef="openingbalance">
            <th mat-header-cell *matHeaderCellDef mat-sort-header>Opening Qty</th>
            <td mat-cell *matCellDef="let item" class="quantity">
              {{ formatQuantity(item.openingbalance) }}
            </td>
          </ng-container>

          <ng-container matColumnDef="closingbalance">
            <th mat-header-cell *matHeaderCellDef mat-sort-header>Closing Qty</th>
            <td mat-cell *matCellDef="let item" class="quantity">
              {{ formatQuantity(item.closingbalance) }}
            </td>
          </ng-container>

          <ng-container matColumnDef="closingrate">
            <th mat-header-cell *matHeaderCellDef mat-sort-header>Rate</th>
            <td mat-cell *matCellDef="let item" class="amount">
              {{ formatAmount(item.closingrate) }}
            </td>
          </ng-container>

          <ng-container matColumnDef="closingvalue">
            <th mat-header-cell *matHeaderCellDef mat-sort-header>Value</th>
            <td mat-cell *matCellDef="let item" class="amount value">
              {{ formatAmount(item.closingvalue) }}
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
    .stock-page {
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

    .search-field {
      width: 100%;
      margin-bottom: 20px;
    }

    .stock-table {
      width: 100%;
    }

    .stock-table th {
      background-color: #f8fafc;
      font-weight: 600;
      color: #1e293b;
    }

    .stock-table td {
      padding: 16px 12px;
    }

    .quantity {
      text-align: right;
      font-weight: 500;
      color: #0369a1;
    }

    .amount {
      text-align: right;
      font-family: monospace;
      font-weight: 500;
    }

    .value {
      color: #059669;
      font-weight: 600;
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
export class StockComponent implements OnInit {
  loading = true;
  error: string | null = null;
  displayedColumns: string[] = ['name', 'parent', 'baseunits', 'openingbalance', 'closingbalance', 'closingrate', 'closingvalue'];
  dataSource = new MatTableDataSource<StockItem>();

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(private tallyService: TallyService) {}

  ngOnInit() {
    this.loadStockItems();
  }

  loadStockItems() {
    this.loading = true;
    this.error = null;

    this.tallyService.getAllStockItems().subscribe({
      next: (items) => {
        this.dataSource.data = items;
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

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  formatQuantity(value: any): string {
    if (!value) return '0';
    const num = parseFloat(value.toString());
    return isNaN(num) ? '0' : num.toFixed(2);
  }

  formatAmount(value: any): string {
    if (!value) return '₹0.00';
    const num = parseFloat(value.toString());
    return isNaN(num) ? '₹0.00' : `₹${Math.abs(num).toFixed(2)}`;
  }
}

