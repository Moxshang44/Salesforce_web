// TypeScript interfaces for Tally data models

export interface Company {
  name: string;
  guid?: string;
  [key: string]: any;
}

export interface Ledger {
  name: string;
  parent?: string;
  closingbalance?: string | number;
  openingbalance?: string | number;
  [key: string]: any;
}

export interface Voucher {
  date?: string;
  vouchertypename?: string;
  vouchernumber?: string;
  partyledgername?: string;
  amount?: string | number;
  narration?: string;
  [key: string]: any;
}

export interface StockItem {
  name: string;
  parent?: string;
  baseunits?: string;
  closingbalance?: string | number;
  closingrate?: string | number;
  closingvalue?: string | number;
  openingbalance?: string | number;
  [key: string]: any;
}

export interface OutstandingReport {
  receivables: Ledger[];
  payables: Ledger[];
  all: Ledger[];
}

export interface OutstandingSummary {
  totalReceivables: number;
  totalPayables: number;
  receivablesCount: number;
  payablesCount: number;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  count?: number;
  summary?: any;
}

