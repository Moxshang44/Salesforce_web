import { Component, OnInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { ChatWidgetService } from '../../services/chat-widget.service';

interface ChatMessage {
  id: number;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

@Component({
  selector: 'app-chat-widget',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule
  ],
  templateUrl: './chat-widget.component.html',
  styleUrl: './chat-widget.component.scss'
})
export class ChatWidgetComponent implements OnInit, OnDestroy {
  isOpen = false;
  chatMessages: ChatMessage[] = [];
  chatInput = '';
  isTyping = false;
  private subscription?: Subscription;
  
  @ViewChild('chatMessagesContainer', { static: false }) chatMessagesContainer?: ElementRef;

  constructor(private chatWidgetService: ChatWidgetService) {}

  ngOnInit() {
    // Subscribe to chat widget state changes
    this.subscription = this.chatWidgetService.isOpen$.subscribe(isOpen => {
      this.isOpen = isOpen;
      if (this.isOpen && this.chatMessages.length === 0) {
        this.initializeChat();
      }
      if (this.isOpen) {
        setTimeout(() => this.scrollToBottom(), 100);
      }
    });
  }

  ngOnDestroy() {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  toggle(): void {
    this.chatWidgetService.toggle();
  }

  close(): void {
    this.chatWidgetService.close();
  }

  initializeChat(): void {
    // Add welcome message
    this.chatMessages = [
      {
        id: 1,
        role: 'assistant',
        content: 'Hello! How can I help you today? I\'m here to assist with questions about the system, navigation, and general help.',
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
        content: this.generateHelpResponse(currentInput),
        timestamp: new Date()
      };
      this.chatMessages.push(assistantMessage);
      this.isTyping = false;
      this.scrollToBottom();
    }, 1000);
  }

  generateHelpResponse(userInput: string): string {
    // Simple response generation for help assistance (replace with actual AI API call)
    const lowerInput = userInput.toLowerCase();
    
    if (lowerInput.includes('order') || lowerInput.includes('orders')) {
      return 'To manage orders, navigate to the Orders section from the sidebar. You can create, view, and track orders there. Would you like to know more about any specific order feature?';
    } else if (lowerInput.includes('navigate') || lowerInput.includes('go to') || lowerInput.includes('where')) {
      return 'You can navigate using the sidebar menu on the left. The main sections include:\n- Dashboard\n- Orders\n- Stock/Inventory\n- Invoices\n- Billing Mode\n- AI Chatbot (for performing operations)\n\nWhat would you like to access?';
    } else if (lowerInput.includes('billing') || lowerInput.includes('tally')) {
      return 'Billing Mode allows you to configure Tally integration, view sync logs, and manage data mappings. Access it from the sidebar under "Billing Mode".';
    } else if (lowerInput.includes('chatbot') || lowerInput.includes('ai chatbot')) {
      return 'The AI Chatbot (available in the sidebar) is for performing operations and tasks. I\'m here for general help and assistance. What would you like help with?';
    } else if (lowerInput.includes('help') || lowerInput.includes('how')) {
      return 'I\'m here to help! I can assist with:\n- System navigation\n- Understanding features\n- Finding specific sections\n- General questions\n\nWhat would you like to know?';
    } else if (lowerInput.includes('hello') || lowerInput.includes('hi') || lowerInput.includes('hey')) {
      return 'Hello! How can I assist you today? I\'m here to help with any questions about the system or navigation.';
    } else {
      return 'I understand you\'re asking about: "' + userInput + '". I\'m here to help with navigation, system features, and general assistance. Could you provide more details or ask a specific question?';
    }
  }

  scrollToBottom(): void {
    setTimeout(() => {
      if (this.chatMessagesContainer?.nativeElement) {
        const element = this.chatMessagesContainer.nativeElement;
        element.scrollTop = element.scrollHeight;
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
      textarea = document.querySelector('.chat-widget-input') as HTMLTextAreaElement;
    }
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = Math.min(textarea.scrollHeight, 120) + 'px';
    }
  }

  onChatInputChange(event: Event): void {
    const textarea = event.target as HTMLTextAreaElement;
    this.autoResizeTextarea(textarea);
  }
}

