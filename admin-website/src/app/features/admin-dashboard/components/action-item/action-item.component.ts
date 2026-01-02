import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonComponent } from '../../../../shared/components/button/button.component';

export interface ActionItem {
  id: string;
  message: string;
  actionLabel: string;
  variant?: 'primary' | 'secondary' | 'outline' | 'danger';
}

@Component({
  selector: 'app-action-item',
  standalone: true,
  imports: [CommonModule, ButtonComponent],
  templateUrl: './action-item.component.html',
  styleUrl: './action-item.component.scss'
})
export class ActionItemComponent {
  @Input() action!: ActionItem;
  @Output() actionClick = new EventEmitter<string>();

  get isUrgent(): boolean {
    return this.action.message.includes("Diwali Dhamaka") || 
           this.action.message.includes("Elite Widgets");
  }

  get isButtonRed(): boolean {
    return this.action.actionLabel === 'Extend' || 
           this.action.actionLabel === 'Order New';
  }

  onActionClick() {
    this.actionClick.emit(this.action.id);
  }
}

