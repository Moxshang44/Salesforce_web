import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DmsSidebarComponent } from '../components/dms-sidebar/dms-sidebar.component';
import { HeaderComponent } from '../../../core/layout/header/header.component';

interface ChatMessage {
  id: number;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

@Component({
  selector: 'app-ai-chatbot',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    DmsSidebarComponent,
    HeaderComponent
  ],
  templateUrl: './ai-chatbot.component.html',
  styleUrl: './ai-chatbot.component.scss'
})
export class AiChatbotComponent implements OnInit {
  chatMessages: ChatMessage[] = [];
  chatInput = '';
  isTyping = false;
  
  @ViewChild('chatMessagesContainer', { static: false }) chatMessagesContainer?: ElementRef;

  ngOnInit() {
    // Initialize chatbot with welcome message
    this.initializeChatbot();
  }

  initializeChatbot(): void {
    // Add welcome message
    this.chatMessages = [
      {
        id: 1,
        role: 'assistant',
        content: 'Hello! I\'m your AI assistant. How can I help you with orders, inventory, billing mode, or any questions about your DMS system?',
        timestamp: new Date()
      }
    ];
  }

  sendMessage(): void {
    if (!this.chatInput.trim() || this.isTyping) {
      return;
    }

    // Add user message
    const userMessage: ChatMessage = {
      id: Date.now(),
      role: 'user',
      content: this.chatInput.trim(),
      timestamp: new Date()
    };
    this.chatMessages.push(userMessage);
    const currentInput = this.chatInput;
    this.chatInput = '';
    this.isTyping = true;

    // Simulate AI response (replace with actual API call)
    setTimeout(() => {
      const assistantMessage: ChatMessage = {
        id: Date.now() + 1,
        role: 'assistant',
        content: this.generateResponse(currentInput),
        timestamp: new Date()
      };
      this.chatMessages.push(assistantMessage);
      this.isTyping = false;
      this.scrollToBottom();
    }, 1000);
  }

  generateResponse(userInput: string): string {
    // Simple response generation (replace with actual AI API call)
    const lowerInput = userInput.toLowerCase();
    
    if (lowerInput.includes('order') || lowerInput.includes('orders')) {
      return 'I can help you with orders! You can view, create, or manage orders in the Orders section. Would you like to know more about any specific order functionality?';
    } else if (lowerInput.includes('inventory') || lowerInput.includes('stock')) {
      return 'For inventory and stock management, you can check the Stock section. I can help you track inventory levels, update stock, or answer questions about specific products.';
    } else if (lowerInput.includes('billing') || lowerInput.includes('tally')) {
      return 'I can help you with billing mode and Tally integration! You can configure Tally connections, manage mappings, and view sync logs in the Billing Mode section. What specific aspect would you like to know about?';
    } else if (lowerInput.includes('invoice') || lowerInput.includes('invoices')) {
      return 'For invoice management, you can access the Invoices section. I can help you understand invoice processing, status tracking, and invoice-related queries.';
    } else if (lowerInput.includes('help')) {
      return 'I\'m here to help! I can assist you with:\n- Managing orders and understanding order status\n- Inventory and stock queries\n- Billing mode and Tally integration\n- Invoice management\n- Navigation within the DMS system\n- General questions about features\n\nWhat would you like to know?';
    } else if (lowerInput.includes('hello') || lowerInput.includes('hi')) {
      return 'Hello! How can I assist you today? Feel free to ask me anything about orders, inventory, billing, invoices, or the DMS system.';
    } else {
      return 'Thank you for your message! I understand you\'re asking about: "' + userInput + '". I\'m here to help with DMS system questions including orders, inventory management, billing mode, and invoices. Could you provide more details about what you\'d like to know?';
    }
  }

  scrollToBottom(): void {
    setTimeout(() => {
      if (this.chatMessagesContainer?.nativeElement) {
        const element = this.chatMessagesContainer.nativeElement;
        element.scrollTop = element.scrollHeight;
      } else {
        const chatContainer = document.querySelector('.chat-messages');
        if (chatContainer) {
          chatContainer.scrollTop = chatContainer.scrollHeight;
        }
      }
    }, 100);
  }

  onChatInputKeyPress(event: KeyboardEvent): void {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.sendMessage();
    }
    // Auto-resize textarea
    this.autoResizeTextarea(event.target as HTMLTextAreaElement);
  }

  autoResizeTextarea(textarea?: HTMLTextAreaElement): void {
    if (!textarea) {
      textarea = document.querySelector('.chat-input') as HTMLTextAreaElement;
    }
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = Math.min(textarea.scrollHeight, 200) + 'px';
    }
  }

  onChatInputChange(event: Event): void {
    const textarea = event.target as HTMLTextAreaElement;
    this.autoResizeTextarea(textarea);
  }
}

