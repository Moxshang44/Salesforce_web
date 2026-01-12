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
import { ModalComponent } from '../../../../shared/components/modal/modal.component';

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
    MatButtonModule,
    ModalComponent
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
          <tr mat-row *matRowDef="let row; columns: displayedColumns;" 
              (click)="onRowClick(row)" 
              style="cursor: pointer;"></tr>
          
          <!-- No data row -->
          <tr class="mat-row" *matNoDataRow>
            <td class="mat-cell no-data-cell" [attr.colspan]="displayedColumns.length">
              <div class="no-data-message">
                <mat-icon>inbox</mat-icon>
                <p>No vouchers found</p>
                <p class="no-data-hint">Try selecting a different voucher type or check your Tally connection.</p>
              </div>
            </td>
          </tr>
        </table>

        <mat-paginator [pageSizeOptions]="[10, 25, 50, 100]" showFirstLastButtons></mat-paginator>
      </div>
    </div>

    <!-- Voucher Detail Modal -->
    <app-modal 
      [isOpen]="showDetailModal" 
      [title]="'Voucher Details'"
      width="1200px"
      (close)="closeDetailModal()"
    >
      <div *ngIf="loadingDetails" class="loading-spinner">
        <mat-spinner></mat-spinner>
        <p>Loading voucher details...</p>
      </div>

      <div *ngIf="!loadingDetails && selectedVoucher" class="voucher-details">
        <!-- Voucher Header -->
        <div class="detail-section">
          <h3>Voucher Information</h3>
          <div class="detail-grid">
            <div class="detail-item">
              <label>Date:</label>
              <span>{{ formatDate(getFieldValue(selectedVoucher, 'date', 'DATE')) }}</span>
            </div>
            <div class="detail-item">
              <label>Type:</label>
              <span>{{ getFieldValue(selectedVoucher, 'vchtype', 'VCHTYPE', 'vouchertypename') || '-' }}</span>
            </div>
            <div class="detail-item">
              <label>Number:</label>
              <span>{{ getFieldValue(selectedVoucher, 'vouchernumber', 'VOUCHERNUMBER', 'vchnumber', 'VCHNUMBER') || '-' }}</span>
            </div>
            <div class="detail-item">
              <label>Party:</label>
              <span>{{ getFieldValue(selectedVoucher, 'partyledgername', 'PARTYLEDGERNAME', 'partyname', 'PARTYNAME') || '-' }}</span>
            </div>
          </div>
        </div>

        <!-- Inventory Items -->
        <div class="detail-section" *ngIf="getInventoryEntries(selectedVoucher).length > 0">
          <h3>Items</h3>
          <table class="detail-table">
            <thead>
              <tr>
                <th>Item Name</th>
                <th>HSN Code</th>
                <th>Quantity</th>
                <th>Rate</th>
                <th>Discount</th>
                <th>Amount</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let item of getInventoryEntries(selectedVoucher)">
                <td>{{ getFieldValue(item, 'stockitemname', 'STOCKITEMNAME', 'name', 'NAME', 'itemname', 'ITEMNAME') || '-' }}</td>
                <td>{{ getFieldValue(item, 'hsncode', 'HSNCODE', 'hsn', 'HSN', 'hsnsac', 'HSNSAC') || '-' }}</td>
                <td>
                  <span *ngIf="getFieldValue(item, 'actualqty', 'ACTUALQTY', 'quantity', 'QUANTITY', 'qty', 'QTY')">
                    {{ getFieldValue(item, 'actualqty', 'ACTUALQTY', 'quantity', 'QUANTITY', 'qty', 'QTY') }}
                    {{ getFieldValue(item, 'unit', 'UNIT', 'baseunit', 'BASEUNIT') || '' }}
                  </span>
                  <span *ngIf="!getFieldValue(item, 'actualqty', 'ACTUALQTY', 'quantity', 'QUANTITY', 'qty', 'QTY')">-</span>
                </td>
                <td>{{ formatAmount(getFieldValue(item, 'rate', 'RATE', 'rateper', 'RATEPER', 'unitrate', 'UNITRATE')) }}</td>
                <td>{{ formatAmount(getFieldValue(item, 'discount', 'DISCOUNT', 'discountamount', 'DISCOUNTAMOUNT', 'disc', 'DISC')) }}</td>
                <td>{{ formatAmount(getFieldValue(item, 'amount', 'AMOUNT', 'billamount', 'BILLAMOUNT', 'value', 'VALUE')) }}</td>
              </tr>
              <tr class="subtotal-row" *ngIf="getInventoryEntries(selectedVoucher).length > 0">
                <td colspan="5" class="subtotal-label"><strong>Items Subtotal:</strong></td>
                <td class="subtotal-amount"><strong>{{ formatAmount(getItemsSubtotal(selectedVoucher)) }}</strong></td>
              </tr>
            </tbody>
          </table>
        </div>
        
        <!-- Show message if no items but we have ledger entries -->
        <div class="detail-section" *ngIf="getInventoryEntries(selectedVoucher).length === 0 && getLedgerEntries(selectedVoucher).length > 0">
          <p class="info-message">Item details are not available in the voucher data. Showing ledger entries only.</p>
        </div>

        <!-- Tax Breakdown -->
        <div class="detail-section" *ngIf="getTaxEntries(selectedVoucher).length > 0">
          <h3>Taxes</h3>
          <table class="detail-table">
            <thead>
              <tr>
                <th>Tax Type</th>
                <th>Amount</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let tax of getTaxEntries(selectedVoucher)">
                <td>{{ getFieldValue(tax, 'ledgername', 'LEDGERNAME', 'name', 'NAME') || '-' }}</td>
                <td>{{ formatAmount(getFieldValue(tax, 'amount', 'AMOUNT', 'billamount', 'BILLAMOUNT')) }}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Other Ledger Entries (Cash, etc.) -->
        <div class="detail-section" *ngIf="getOtherLedgerEntries(selectedVoucher).length > 0">
          <h3>Other Ledger Entries</h3>
          <table class="detail-table">
            <thead>
              <tr>
                <th>Ledger Name</th>
                <th>Amount</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let entry of getOtherLedgerEntries(selectedVoucher)">
                <td>{{ getFieldValue(entry, 'ledgername', 'LEDGERNAME', 'name', 'NAME') || '-' }}</td>
                <td>{{ formatAmount(getFieldValue(entry, 'amount', 'AMOUNT', 'billamount', 'BILLAMOUNT')) }}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Total Amount -->
        <div class="detail-section total-section">
          <div class="total-amount">
            <label>Grand Total:</label>
            <span class="amount-large">{{ formatAmount(getTotalAmount(selectedVoucher)) }}</span>
          </div>
        </div>

        <!-- Action Buttons -->
        <div class="detail-section action-buttons-section">
          <button mat-raised-button color="primary" (click)="generatePDF()" [disabled]="generatingPDF">
            <mat-icon *ngIf="!generatingPDF">picture_as_pdf</mat-icon>
            <mat-progress-spinner *ngIf="generatingPDF" diameter="20" mode="indeterminate" style="display: inline-block; margin-right: 8px;"></mat-progress-spinner>
            {{ generatingPDF ? 'Generating PDF...' : 'Generate PDF' }}
          </button>
        </div>
      </div>

      <div *ngIf="!loadingDetails && !selectedVoucher" class="no-data-message">
        <p>No voucher data available</p>
      </div>
    </app-modal>
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

    .no-data-cell {
      padding: 60px 20px !important;
      text-align: center;
    }

    .no-data-message {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 12px;
      color: #64748b;
    }

    .no-data-message mat-icon {
      font-size: 48px;
      width: 48px;
      height: 48px;
      color: #cbd5e1;
    }

    .no-data-message p {
      margin: 0;
      font-size: 16px;
      font-weight: 500;
    }

    .no-data-hint {
      font-size: 14px;
      font-weight: 400;
      color: #94a3b8;
    }

    mat-paginator {
      border-top: 1px solid #e2e8f0;
      margin-top: 20px;
    }

    .voucher-details {
      max-height: 70vh;
      overflow-y: auto;
    }

    .detail-section {
      margin-bottom: 24px;
    }

    .detail-section h3 {
      margin: 0 0 16px 0;
      font-size: 18px;
      font-weight: 600;
      color: #1e293b;
      border-bottom: 2px solid #e2e8f0;
      padding-bottom: 8px;
    }

    .detail-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 16px;
    }

    .detail-item {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .detail-item label {
      font-size: 12px;
      font-weight: 600;
      color: #64748b;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .detail-item span {
      font-size: 14px;
      color: #1e293b;
    }

    .detail-table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 12px;
    }

    .detail-table th {
      background-color: #f8fafc;
      padding: 12px;
      text-align: left;
      font-weight: 600;
      font-size: 12px;
      color: #64748b;
      text-transform: uppercase;
      border-bottom: 2px solid #e2e8f0;
    }

    .detail-table td {
      padding: 12px;
      border-bottom: 1px solid #e2e8f0;
      font-size: 14px;
      color: #1e293b;
    }

    .detail-table tr:hover {
      background-color: #f8fafc;
    }

    .total-section {
      margin-top: 24px;
      padding-top: 24px;
      border-top: 2px solid #e2e8f0;
    }

    .total-amount {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 16px;
      background-color: #f8fafc;
      border-radius: 8px;
    }

    .total-amount label {
      font-size: 16px;
      font-weight: 600;
      color: #1e293b;
    }

    .amount-large {
      font-size: 24px;
      font-weight: 700;
      color: #059669;
    }

    .subtotal-row {
      background-color: #f8fafc;
      border-top: 2px solid #e2e8f0;
    }

    .subtotal-label {
      text-align: right;
      padding-right: 16px;
    }

    .subtotal-amount {
      text-align: right;
      font-weight: 600;
      color: #1e293b;
    }

    .info-message {
      padding: 12px;
      background-color: #fef3c7;
      border-left: 4px solid #f59e0b;
      border-radius: 4px;
      color: #92400e;
      font-size: 14px;
    }
  `]
})
export class VouchersComponent implements OnInit {
  loading = true;
  error: string | null = null;
  displayedColumns: string[] = ['date', 'vouchertypename', 'vouchernumber', 'partyledgername', 'amount', 'narration'];
  dataSource = new MatTableDataSource<Voucher>();
  voucherTypeControl = new FormControl('Sales'); // Default to Sales vouchers
  showDetailModal = false;
  selectedVoucher: any = null;
  loadingDetails = false;
  generatingPDF = false;

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
        // Filter vouchers by type on frontend as fallback if backend doesn't filter
        let filteredVouchers = vouchers;
        if (voucherType && vouchers.length > 0) {
          const typeLower = voucherType.toLowerCase();
          filteredVouchers = vouchers.filter(v => {
            // Try multiple field names (Tally uses VCHTYPE, backend normalizes to vchtype)
            // Use bracket notation for all index signature properties
            const vType = (v['vchtype'] || 
                          v['VCHTYPE'] || 
                          v.vouchertypename || 
                          v['vouchertype'] || 
                          v['vouchertype'] || 
                          '').toString().toLowerCase();
            
            // Exclude "QB Sales" entries - only show "Sales"
            if (vType.includes('qb sales') || vType === 'qb sales') {
              return false;
            }
            
            // For "Sales" type, only match exact "Sales" entries (not "QB Sales")
            if (typeLower === 'sales') {
              return vType === 'sales' || vType === typeLower;
            }
            
            return vType === typeLower || 
                   vType.includes(typeLower) ||
                   (vType.includes('sales') && typeLower === 'sales');
          });
        }
        
         // Map Tally field names to our expected format for display
         filteredVouchers = filteredVouchers.map(v => {
           // Calculate the correct amount using the same logic as getTotalAmount
           const correctAmount = this.calculateVoucherAmount(v);
           
           return {
             ...v,
             // Ensure we have the fields the template expects
             // Use bracket notation for all index signature properties
             date: v.date || v['DATE'],
             vouchertypename: v.vouchertypename || v['vchtype'] || v['VCHTYPE'] || v['type'],
             vouchernumber: v.vouchernumber || v['VOUCHERNUMBER'] || v['vchnumber'] || v['VCHNUMBER'],
             partyledgername: v.partyledgername || v['PARTYLEDGERNAME'] || v['partyname'] || v['PARTYNAME'],
             amount: correctAmount, // Use calculated amount instead of raw amount
             narration: v.narration || v['NARRATION'] || v['description'] || v['DESCRIPTION']
           };
         });
        
        this.dataSource.data = filteredVouchers;
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort;
        this.loading = false;
        
        // Log for debugging
        console.log(`Loaded ${filteredVouchers.length} ${voucherType || 'all'} vouchers`);
      },
      error: (err) => {
        this.error = err.message || 'Failed to load vouchers. Please check your Tally connection.';
        this.loading = false;
        console.error('Error loading vouchers:', err);
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

  onRowClick(voucher: any): void {
    // Use the voucher data directly from the list
    // The list data from importdata format should already have all details
    // including inventory entries and ledger entries
    this.selectedVoucher = voucher;
    this.showDetailModal = true;
    this.loadingDetails = false;
    
    // Log for debugging to see what data we have
    console.log('Voucher data:', {
      hasInventoryEntries: this.getInventoryEntries(voucher).length > 0,
      hasLedgerEntries: this.getLedgerEntries(voucher).length > 0,
      voucherKeys: Object.keys(voucher).slice(0, 20) // First 20 keys
    });
  }

  closeDetailModal(): void {
    this.showDetailModal = false;
    this.selectedVoucher = null;
  }

  getInventoryEntries(voucher: any): any[] {
    if (!voucher) return [];
    
    // Try all possible field names for inventory entries
    let entries = voucher.inventoryentries || 
                  voucher['inventoryentries'] || 
                  voucher.INVENTORYENTRIES || 
                  voucher['INVENTORYENTRIES'] ||
                  voucher['inventoryentries.list'] ||
                  voucher['INVENTORYENTRIES.LIST'] ||
                  voucher['inventoryentries_list'] ||
                  voucher['INVENTORYENTRIES_LIST'] ||
                  null;
    
    // If not found, check all keys for inventory-related entries
    if (!entries) {
      const allKeys = Object.keys(voucher);
      for (const key of allKeys) {
        const keyLower = key.toLowerCase();
        if (keyLower.includes('inventory') && keyLower.includes('entr')) {
          entries = voucher[key];
          console.log(`Found inventory entries in key: ${key}`);
          break;
        }
      }
    }
    
    if (!entries) return [];
    
    // Handle different structures
    if (Array.isArray(entries)) {
      return entries;
    }
    if (entries && typeof entries === 'object') {
      if (entries.list) {
        return Array.isArray(entries.list) ? entries.list : [entries.list];
      }
      if (entries.LIST) {
        return Array.isArray(entries.LIST) ? entries.LIST : [entries.LIST];
      }
      // If it's a single object, return as array
      return [entries];
    }
    return [];
  }

  getLedgerEntries(voucher: any): any[] {
    if (!voucher) return [];
    
    // Try all possible field names for ledger entries
    let entries = voucher.ledgerentries || 
                  voucher['ledgerentries'] || 
                  voucher.LEDGERENTRIES || 
                  voucher['LEDGERENTRIES'] ||
                  voucher['ledgerentries.list'] ||
                  voucher['LEDGERENTRIES.LIST'] ||
                  voucher['ledgerentries_list'] ||
                  voucher['LEDGERENTRIES_LIST'] ||
                  null;
    
    // If not found, check all keys for ledger-related entries
    if (!entries) {
      const allKeys = Object.keys(voucher);
      for (const key of allKeys) {
        const keyLower = key.toLowerCase();
        if (keyLower.includes('ledger') && keyLower.includes('entr')) {
          entries = voucher[key];
          console.log(`Found ledger entries in key: ${key}`);
          break;
        }
      }
    }
    
    if (!entries) return [];
    
    // Handle different structures
    if (Array.isArray(entries)) {
      return entries;
    }
    if (entries && typeof entries === 'object') {
      if (entries.list) {
        return Array.isArray(entries.list) ? entries.list : [entries.list];
      }
      if (entries.LIST) {
        return Array.isArray(entries.LIST) ? entries.LIST : [entries.LIST];
      }
      // If it's a single object, return as array
      return [entries];
    }
    return [];
  }

  getFieldValue(obj: any, ...fieldNames: string[]): any {
    for (const fieldName of fieldNames) {
      const value = obj[fieldName] || obj[fieldName.toLowerCase()] || obj[fieldName.toUpperCase()];
      if (value !== undefined && value !== null && value !== '') {
        return value;
      }
    }
    return null;
  }

  getTotalAmount(voucher: any): number {
    // The Cash ledger entry already includes all taxes (CGST, SGST)
    // So we should use the Cash amount as the total, not sum all ledger entries
    const ledgerEntries = this.getLedgerEntries(voucher);
    
    // Find the Cash ledger entry (or the main party ledger entry)
    // This is the total amount that already includes taxes
    let totalAmount = 0;
    
    // Try to find Cash or the main party ledger (usually the one with the largest amount)
    const partyLedgerName = (this.getFieldValue(voucher, 'partyledgername', 'PARTYLEDGERNAME', 'partyname', 'PARTYNAME') || '').toLowerCase();
    
    const cashEntry = ledgerEntries.find((entry: any) => {
      const ledgerName = (this.getFieldValue(entry, 'ledgername', 'LEDGERNAME', 'name', 'NAME') || '').toLowerCase();
      return ledgerName === 'cash' || 
             ledgerName === partyLedgerName ||
             ledgerName.includes('cash') ||
             ledgerName.includes(partyLedgerName);
    });
    
    if (cashEntry) {
      const amount = this.getFieldValue(cashEntry, 'amount', 'AMOUNT', 'billamount', 'BILLAMOUNT');
      if (amount) {
        totalAmount = typeof amount === 'string' ? parseFloat(amount.toString().replace(/,/g, '')) : parseFloat(amount);
      }
    } else if (ledgerEntries.length > 0) {
      // If no Cash found, find the entry with the largest amount (usually the main party entry)
      let maxAmount = 0;
      let maxEntry = null;
      
      ledgerEntries.forEach((entry: any) => {
        const amount = this.getFieldValue(entry, 'amount', 'AMOUNT', 'billamount', 'BILLAMOUNT');
        if (amount) {
          const numAmount = typeof amount === 'string' ? parseFloat(amount.toString().replace(/,/g, '')) : parseFloat(amount);
          const absAmount = Math.abs(numAmount);
          if (absAmount > maxAmount) {
            maxAmount = absAmount;
            maxEntry = entry;
          }
        }
      });
      
      if (maxEntry) {
        const amount = this.getFieldValue(maxEntry, 'amount', 'AMOUNT', 'billamount', 'BILLAMOUNT');
        if (amount) {
          totalAmount = typeof amount === 'string' ? parseFloat(amount.toString().replace(/,/g, '')) : parseFloat(amount);
        }
      }
    }
    
    // Fallback to voucher amount if no ledger entries found
    if (!totalAmount) {
      const voucherAmount = this.getFieldValue(voucher, 'amount', 'AMOUNT', 'total', 'TOTAL');
      if (voucherAmount) {
        totalAmount = typeof voucherAmount === 'string' ? parseFloat(voucherAmount.toString().replace(/,/g, '')) : parseFloat(voucherAmount);
      }
    }
    
    return Math.abs(totalAmount) || 0;
  }

  getItemsSubtotal(voucher: any): number {
    const items = this.getInventoryEntries(voucher);
    let subtotal = 0;
    
    items.forEach((item: any) => {
      const amount = this.getFieldValue(item, 'amount', 'AMOUNT', 'billamount', 'BILLAMOUNT', 'value', 'VALUE');
      if (amount) {
        const numAmount = typeof amount === 'string' ? parseFloat(amount.toString().replace(/,/g, '')) : parseFloat(amount);
        subtotal += Math.abs(numAmount) || 0;
      }
    });
    
    return subtotal;
  }

  getTaxEntries(voucher: any): any[] {
    const ledgerEntries = this.getLedgerEntries(voucher);
    return ledgerEntries.filter((entry: any) => {
      const ledgerName = (this.getFieldValue(entry, 'ledgername', 'LEDGERNAME', 'name', 'NAME') || '').toLowerCase();
      return ledgerName.includes('cgst') || 
             ledgerName.includes('sgst') || 
             ledgerName.includes('igst') ||
             ledgerName.includes('gst') ||
             ledgerName.includes('tax');
    });
  }

  getOtherLedgerEntries(voucher: any): any[] {
    const ledgerEntries = this.getLedgerEntries(voucher);
    const taxEntries = this.getTaxEntries(voucher);
    const taxLedgerNames = taxEntries.map((entry: any) => 
      (this.getFieldValue(entry, 'ledgername', 'LEDGERNAME', 'name', 'NAME') || '').toLowerCase()
    );
    
    return ledgerEntries.filter((entry: any) => {
      const ledgerName = (this.getFieldValue(entry, 'ledgername', 'LEDGERNAME', 'name', 'NAME') || '').toLowerCase();
      return !taxLedgerNames.includes(ledgerName);
    });
  }

  calculateVoucherAmount(voucher: any): number {
    // Use the same logic as getTotalAmount to ensure table and popup show the same amount
    // This finds the Cash ledger entry which is the correct total
    return this.getTotalAmount(voucher);
  }

  generatePDF(): void {
    if (!this.selectedVoucher) return;

    const vchkey = this.selectedVoucher.vchkey || 
                   this.selectedVoucher['vchkey'] || 
                   this.selectedVoucher.VCHKEY || 
                   this.selectedVoucher['VCHKEY'];
    
    if (!vchkey) {
      console.error('Voucher key not found');
      this.error = 'Cannot generate PDF: Voucher key not found';
      return;
    }

    this.generatingPDF = true;
    this.error = null;

    this.tallyService.generateVoucherPDF(vchkey).subscribe({
      next: (blob: Blob) => {
        // Create a download link
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        
        // Get voucher number for filename
        const voucherNumber = this.getFieldValue(this.selectedVoucher, 'vouchernumber', 'VOUCHERNUMBER', 'vchnumber', 'VCHNUMBER') || 'voucher';
        const date = this.formatDate(this.getFieldValue(this.selectedVoucher, 'date', 'DATE'));
        const filename = `Voucher_${voucherNumber}_${date.replace(/\//g, '-')}.pdf`;
        
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
        
        this.generatingPDF = false;
      },
      error: (err) => {
        console.error('Error generating PDF:', err);
        this.error = 'Failed to generate PDF. Please try again.';
        this.generatingPDF = false;
      }
    });
  }
}

