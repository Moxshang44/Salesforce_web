import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-stats-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './stats-card.component.html',
  styleUrl: './stats-card.component.scss'
})
export class StatsCardComponent {
  @Input() title = '';
  @Input() value = '';
  @Input() subtitle?: string;
  @Input() trend?: { value: string; isPositive: boolean };
  @Input() icon?: string;
}

