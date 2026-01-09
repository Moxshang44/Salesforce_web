import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { 
  Company, 
  Ledger, 
  Voucher, 
  StockItem, 
  OutstandingReport,
  OutstandingSummary,
  ApiResponse 
} from '../models/tally.models';

@Injectable({
  providedIn: 'root'
})
export class TallyService {
  private apiUrl = 'http://localhost:5000/api';

  constructor(private http: HttpClient) {}

  // Test Tally connection
  testConnection(): Observable<boolean> {
    return this.http.get<ApiResponse<any>>(`${this.apiUrl}/companies/test`).pipe(
      map(response => response.success),
      catchError(this.handleError)
    );
  }

  // Companies
  getCompanies(): Observable<Company[]> {
    return this.http.get<ApiResponse<Company[]>>(`${this.apiUrl}/companies`).pipe(
      map(response => response.data || []),
      catchError(this.handleError)
    );
  }

  // Ledgers
  getAllLedgers(): Observable<Ledger[]> {
    return this.http.get<ApiResponse<Ledger[]>>(`${this.apiUrl}/ledgers`).pipe(
      map(response => response.data || []),
      catchError(this.handleError)
    );
  }

  getLedgerByName(name: string): Observable<any> {
    return this.http.get<ApiResponse<any>>(`${this.apiUrl}/ledgers/${encodeURIComponent(name)}`).pipe(
      map(response => response.data!),
      catchError(this.handleError)
    );
  }

  getLedgerVouchers(name: string, fromDate?: string, toDate?: string): Observable<Voucher[]> {
    let params = new HttpParams();
    if (fromDate) params = params.set('fromDate', fromDate);
    if (toDate) params = params.set('toDate', toDate);

    return this.http.get<ApiResponse<Voucher[]>>(`${this.apiUrl}/ledgers/${encodeURIComponent(name)}/vouchers`, { params }).pipe(
      map(response => response.data || []),
      catchError(this.handleError)
    );
  }

  // Vouchers
  getVouchers(voucherType?: string, fromDate?: string, toDate?: string): Observable<Voucher[]> {
    let params = new HttpParams();
    if (voucherType) params = params.set('type', voucherType);
    if (fromDate) params = params.set('fromDate', fromDate);
    if (toDate) params = params.set('toDate', toDate);

    return this.http.get<ApiResponse<Voucher[]>>(`${this.apiUrl}/vouchers`, { params }).pipe(
      map(response => response.data || []),
      catchError(this.handleError)
    );
  }

  // Stock
  getAllStockItems(): Observable<StockItem[]> {
    return this.http.get<ApiResponse<StockItem[]>>(`${this.apiUrl}/stock`).pipe(
      map(response => response.data || []),
      catchError(this.handleError)
    );
  }

  getStockItemByName(name: string): Observable<StockItem> {
    return this.http.get<ApiResponse<StockItem>>(`${this.apiUrl}/stock/${encodeURIComponent(name)}`).pipe(
      map(response => response.data!),
      catchError(this.handleError)
    );
  }

  // Reports
  getOutstandingReport(): Observable<{ data: OutstandingReport, summary: OutstandingSummary }> {
    return this.http.get<ApiResponse<OutstandingReport>>(`${this.apiUrl}/reports/outstanding`).pipe(
      map(response => ({
        data: response.data!,
        summary: response.summary
      })),
      catchError(this.handleError)
    );
  }

  getTrialBalance(): Observable<any[]> {
    return this.http.get<ApiResponse<any[]>>(`${this.apiUrl}/reports/trial-balance`).pipe(
      map(response => response.data || []),
      catchError(this.handleError)
    );
  }

  // Error handler
  private handleError(error: any): Observable<never> {
    console.error('API Error:', error);
    const errorMessage = error.error?.error || error.message || 'An unknown error occurred';
    return throwError(() => new Error(errorMessage));
  }
}

