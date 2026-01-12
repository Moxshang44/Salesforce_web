import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { TallyService } from '../../services/tally.service';
import { Ledger, Voucher } from '../../models/tally.models';

@Component({
  selector: 'app-ledger-details-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatTableModule,
    MatProgressSpinnerModule
  ],
  template: `
    <h2 mat-dialog-title>
      <mat-icon>account_balance_wallet</mat-icon>
      {{ ledger.name }}
    </h2>

    <mat-dialog-content class="dialog-content">
      <div *ngIf="loading" class="loading-spinner">
        <mat-spinner diameter="40"></mat-spinner>
        <p>Loading vouchers...</p>
      </div>

      <div *ngIf="!loading && error" class="error-message">
        <mat-icon>error</mat-icon>
        <p>{{ error }}</p>
      </div>

      <div *ngIf="!loading && !error">
        <!-- Balance Summary -->
        <div class="balance-summary">
          <div class="balance-card opening">
            <span class="label">Opening Balance</span>
            <span class="value">{{ formatAmount(ledgerDetails.openingBalance) }}</span>
          </div>
          <div class="balance-card closing">
            <span class="label">Closing Balance</span>
            <span class="value">{{ formatAmount(ledgerDetails.closingBalance) }}</span>
          </div>
        </div>

        <!-- Vouchers Table -->
        <div class="vouchers-section">
          <h3>Transactions ({{ vouchers.length }})</h3>
          
          <div *ngIf="vouchers.length === 0" class="no-vouchers">
            <mat-icon>info</mat-icon>
            <p>No vouchers found for this ledger</p>
          </div>

          <table *ngIf="vouchers.length > 0" class="vouchers-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Voucher Type</th>
                <th>Number</th>
                <th>Particulars</th>
                <th class="amount-col">Debit</th>
                <th class="amount-col">Credit</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let voucher of vouchers">
                <td>{{ voucher.dspdateformat || voucher.date || '-' }}</td>
                <td>
                  <span class="voucher-type" [class]="getVoucherTypeClass(voucher)">
                    {{ voucher.vchtype || voucher.vouchertypename || '-' }}
                  </span>
                </td>
                <td>{{ voucher.vchno || voucher.vouchernumber || '-' }}</td>
                <td class="particulars">{{ voucher.particulars || voucher.narration || '-' }}</td>
                <td class="amount-col debit">{{ formatDebit(voucher) }}</td>
                <td class="amount-col credit">{{ formatCredit(voucher) }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </mat-dialog-content>

    <mat-dialog-actions align="end">
      <button mat-button (click)="close()">Close</button>
      <button mat-raised-button color="primary" (click)="refresh()">
        <mat-icon>refresh</mat-icon>
        Refresh
      </button>
    </mat-dialog-actions>
  `,
  styles: [`
    h2 {
      display: flex;
      align-items: center;
      gap: 12px;
      color: #1e293b;
      margin: 0;
      padding: 20px 24px;
      border-bottom: 1px solid #e2e8f0;
    }

    .dialog-content {
      min-height: 300px;
      padding: 24px !important;
    }

    .loading-spinner {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 60px;
      gap: 20px;
      color: #64748b;
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

    .balance-summary {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 16px;
      margin-bottom: 30px;
    }

    .balance-card {
      padding: 20px;
      border-radius: 12px;
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .balance-card.opening {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
    }

    .balance-card.closing {
      background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
      color: white;
    }

    .balance-card .label {
      font-size: 14px;
      opacity: 0.9;
    }

    .balance-card .value {
      font-size: 24px;
      font-weight: 600;
    }

    .vouchers-section h3 {
      margin: 0 0 20px 0;
      color: #1e293b;
      font-size: 18px;
    }

    .no-vouchers {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 40px;
      color: #94a3b8;
    }

    .no-vouchers mat-icon {
      font-size: 48px;
      width: 48px;
      height: 48px;
      margin-bottom: 12px;
    }

    .vouchers-table {
      width: 100%;
      border-collapse: collapse;
      background: white;
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 1px 3px rgba(0,0,0,0.1);
    }

    .vouchers-table thead {
      background-color: #f8fafc;
    }

    .vouchers-table th {
      padding: 12px;
      text-align: left;
      font-weight: 600;
      color: #475569;
      border-bottom: 2px solid #e2e8f0;
    }

    .vouchers-table td {
      padding: 12px;
      border-bottom: 1px solid #f1f5f9;
    }

    .vouchers-table tbody tr:hover {
      background-color: #f8fafc;
    }

    .voucher-type {
      padding: 4px 12px;
      border-radius: 12px;
      font-size: 12px;
      font-weight: 500;
      white-space: nowrap;
    }

    .voucher-type.sales {
      background-color: #dcfce7;
      color: #166534;
    }

    .voucher-type.receipt {
      background-color: #dbeafe;
      color: #1e40af;
    }

    .voucher-type.payment {
      background-color: #fee2e2;
      color: #991b1b;
    }

    .voucher-type.purchase {
      background-color: #fef3c7;
      color: #92400e;
    }

    .amount-col {
      text-align: right;
      font-family: monospace;
      font-weight: 500;
      min-width: 120px;
    }

    .debit {
      color: #dc2626;
    }

    .credit {
      color: #059669;
    }

    .particulars {
      max-width: 300px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    mat-dialog-actions {
      padding: 16px 24px;
      border-top: 1px solid #e2e8f0;
    }
  `]
})
export class LedgerDetailsDialogComponent implements OnInit {
  ledger: Ledger;
  loading = true;
  error: string | null = null;
  vouchers: any[] = [];
  ledgerDetails: any = {
    openingBalance: 0,
    closingBalance: 0
  };

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: { ledger: Ledger },
    private dialogRef: MatDialogRef<LedgerDetailsDialogComponent>,
    private tallyService: TallyService
  ) {
    this.ledger = data.ledger;
  }

  ngOnInit() {
    this.loadLedgerDetails();
  }

  loadLedgerDetails() {
    this.loading = true;
    this.error = null;

    this.tallyService.getLedgerByName(this.ledger.name || '').subscribe({
      next: (data) => {
        this.ledgerDetails = data;
        this.vouchers = data.vouchers || [];
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

  formatDebit(voucher: any): string {
    const amount = parseFloat(voucher.debit || voucher.amount || 0);
    return amount > 0 ? `₹${amount.toFixed(2)}` : '-';
  }

  formatCredit(voucher: any): string {
    const amount = parseFloat(voucher.credit || voucher.amount || 0);
    return amount < 0 ? `₹${Math.abs(amount).toFixed(2)}` : '-';
  }

  getVoucherTypeClass(voucher: any): string {
    const type = (voucher.vchtype || voucher.vouchertypename || '').toLowerCase();
    if (type.includes('sales')) return 'voucher-type sales';
    if (type.includes('receipt')) return 'voucher-type receipt';
    if (type.includes('payment')) return 'voucher-type payment';
    if (type.includes('purchase')) return 'voucher-type purchase';
    return 'voucher-type';
  }

  refresh() {
    this.loadLedgerDetails();
  }

  close() {
    this.dialogRef.close();
  }
}

