import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatPaginatorModule, MatPaginator } from '@angular/material/paginator';
import { MatSortModule, MatSort } from '@angular/material/sort';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { TallyService } from '../../services/tally.service';
import { Ledger } from '../../models/tally.models';
import { LedgerDetailsDialogComponent } from './ledger-details-dialog.component';

@Component({
  selector: 'app-ledgers',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatInputModule,
    MatFormFieldModule,
    MatProgressSpinnerModule,
    MatIconModule,
    MatButtonModule,
    MatDialogModule
  ],
  template: `
    <div class="ledgers-page">
      <h1>Ledgers</h1>

      <div *ngIf="loading" class="loading-spinner">
        <mat-spinner></mat-spinner>
      </div>

      <div *ngIf="!loading && error" class="error-message">
        <mat-icon>error</mat-icon>
        <p>{{ error }}</p>
      </div>

      <div *ngIf="!loading && !error" class="table-container">
        <mat-form-field class="search-field">
          <mat-label>Search Ledgers</mat-label>
          <input matInput (keyup)="applyFilter($event)" placeholder="Search by name or parent...">
          <mat-icon matSuffix>search</mat-icon>
        </mat-form-field>

        <table mat-table [dataSource]="dataSource" matSort class="ledgers-table">
          <ng-container matColumnDef="name">
            <th mat-header-cell *matHeaderCellDef mat-sort-header>Name</th>
            <td mat-cell *matCellDef="let ledger">{{ ledger.name }}</td>
          </ng-container>

          <ng-container matColumnDef="parent">
            <th mat-header-cell *matHeaderCellDef mat-sort-header>Parent Group</th>
            <td mat-cell *matCellDef="let ledger">{{ ledger.parent || '-' }}</td>
          </ng-container>

          <ng-container matColumnDef="openingbalance">
            <th mat-header-cell *matHeaderCellDef mat-sort-header>Opening Balance</th>
            <td mat-cell *matCellDef="let ledger" class="amount">
              {{ formatAmount(ledger.openingbalance) }}
            </td>
          </ng-container>

          <ng-container matColumnDef="closingbalance">
            <th mat-header-cell *matHeaderCellDef mat-sort-header>Closing Balance</th>
            <td mat-cell *matCellDef="let ledger" class="amount" 
                [class.positive]="isPositive(ledger.closingbalance)"
                [class.negative]="isNegative(ledger.closingbalance)">
              {{ formatAmount(ledger.closingbalance) }}
            </td>
          </ng-container>

          <ng-container matColumnDef="actions">
            <th mat-header-cell *matHeaderCellDef>Actions</th>
            <td mat-cell *matCellDef="let ledger">
              <button mat-icon-button color="primary" (click)="viewLedgerDetails(ledger)" 
                      matTooltip="View Vouchers">
                <mat-icon>visibility</mat-icon>
              </button>
            </td>
          </ng-container>

          <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
          <tr mat-row *matRowDef="let row; columns: displayedColumns;" 
              class="ledger-row" (click)="viewLedgerDetails(row)"></tr>
        </table>

        <mat-paginator [pageSizeOptions]="[10, 25, 50, 100]" showFirstLastButtons></mat-paginator>
      </div>
    </div>
  `,
  styles: [`
    .ledgers-page {
      max-width: 1400px;
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

    .ledgers-table {
      width: 100%;
    }

    .ledgers-table th {
      background-color: #f8fafc;
      font-weight: 600;
      color: #1e293b;
    }

    .ledgers-table td {
      padding: 16px 12px;
    }

    .ledger-row {
      cursor: pointer;
      transition: background-color 0.2s;
    }

    .ledger-row:hover {
      background-color: #f5f5f5;
    }

    .amount {
      text-align: right;
      font-family: monospace;
      font-weight: 500;
    }

    .positive {
      color: #059669;
    }

    .negative {
      color: #dc2626;
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
export class LedgersComponent implements OnInit {
  loading = true;
  error: string | null = null;
  displayedColumns: string[] = ['name', 'parent', 'openingbalance', 'closingbalance', 'actions'];
  dataSource = new MatTableDataSource<Ledger>();

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(
    private tallyService: TallyService,
    private dialog: MatDialog
  ) {}

  ngOnInit() {
    this.loadLedgers();
  }

  loadLedgers() {
    this.loading = true;
    this.error = null;

    this.tallyService.getAllLedgers().subscribe({
      next: (ledgers) => {
        this.dataSource.data = ledgers;
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

  formatAmount(value: any): string {
    if (!value) return '₹0.00';
    const num = parseFloat(value.toString());
    return isNaN(num) ? '₹0.00' : `₹${Math.abs(num).toFixed(2)}`;
  }

  isPositive(value: any): boolean {
    const num = parseFloat(value?.toString() || '0');
    return num > 0;
  }

  isNegative(value: any): boolean {
    const num = parseFloat(value?.toString() || '0');
    return num < 0;
  }

  viewLedgerDetails(ledger: Ledger) {
    this.dialog.open(LedgerDetailsDialogComponent, {
      width: '90%',
      maxWidth: '1200px',
      data: { ledger }
    });
  }
}

