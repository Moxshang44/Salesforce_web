import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-ai-assistant',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './ai-assistant.component.html',
  styleUrl: './ai-assistant.component.scss'
})
export class AiAssistantComponent {
  isOpen = false;
  isConnecting = false;

  toggleAssistant() {
    if (!this.isOpen) {
      this.isOpen = true;
      this.isConnecting = true;
      
      // Simulate connection
      setTimeout(() => {
        this.isConnecting = false;
      }, 2000);
    } else {
      this.closeAssistant();
    }
  }

  closeAssistant() {
    this.isOpen = false;
    this.isConnecting = false;
  }
}

