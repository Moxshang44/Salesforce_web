import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { TallyService } from '../../services/tally.service';

@Component({
  selector: 'app-tally-connection-status',
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule,
    MatButtonModule,
    MatSnackBarModule,
    MatProgressSpinnerModule,
    MatTooltipModule
  ],
  template: `
    <div class="connection-status-card">
      <div class="status-content">
        <div class="status-indicator">
          @if (testing) {
            <mat-spinner diameter="20"></mat-spinner>
          } @else {
            <mat-icon [class.connected]="isConnected" [class.disconnected]="!isConnected">
              {{ isConnected ? 'check_circle' : 'cancel' }}
            </mat-icon>
          }
        </div>
        <div class="status-text">
          <span class="status-label">{{ isConnected ? 'Connected to Tally' : 'Disconnected from Tally' }}</span>
          @if (!testing && !isConnected) {
            <span class="status-message">Unable to connect to Tally server</span>
          }
        </div>
      </div>
      <button 
        mat-icon-button 
        (click)="testConnection()" 
        [disabled]="testing"
        class="refresh-button"
        matTooltip="Test Connection">
        <mat-icon>refresh</mat-icon>
      </button>
    </div>
  `,
  styles: [`
    .connection-status-card {
      display: flex;
      align-items: center;
      justify-content: space-between;
      background: white;
      border: 1px solid #e8e5e1;
      border-radius: 12px;
      padding: 16px 20px;
      margin-bottom: 24px;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
    }

    .status-content {
      display: flex;
      align-items: center;
      gap: 12px;
      flex: 1;
    }

    .status-indicator {
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .status-indicator mat-icon {
      font-size: 24px;
      width: 24px;
      height: 24px;
    }

    .status-indicator .connected {
      color: #4ade80;
    }

    .status-indicator .disconnected {
      color: #f87171;
    }

    .status-text {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .status-label {
      font-size: 15px;
      font-weight: 600;
      color: #1a1a1a;
    }

    .status-message {
      font-size: 13px;
      color: #999;
    }

    .refresh-button {
      color: #666;
    }

    .refresh-button:hover {
      background: rgba(102, 68, 35, 0.1);
      color: #664423;
    }

    .refresh-button:disabled {
      opacity: 0.5;
    }
  `]
})
export class TallyConnectionStatusComponent implements OnInit {
  isConnected = false;
  testing = false;

  constructor(
    private tallyService: TallyService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit() {
    this.testConnection();
  }

  testConnection() {
    this.testing = true;
    this.tallyService.testConnection().subscribe({
      next: (connected) => {
        this.isConnected = connected;
        this.testing = false;
        this.snackBar.open(
          connected ? 'Connected to Tally successfully' : 'Failed to connect to Tally',
          'Close',
          { duration: 3000 }
        );
      },
      error: (error) => {
        this.isConnected = false;
        this.testing = false;
        this.snackBar.open(
          'Error: ' + error.message,
          'Close',
          { duration: 5000 }
        );
      }
    });
  }
}

