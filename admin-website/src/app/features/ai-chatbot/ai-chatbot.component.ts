import { Component, OnInit, OnDestroy, ViewChild, ElementRef, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { SidebarComponent } from '../../core/layout/sidebar/sidebar.component';
import { HeaderComponent } from '../../core/layout/header/header.component';
import { ChatService } from './services/chat.service';

interface ChatMessage {
  id: number;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface ChatHistory {
  id: number;
  title: string;
  timestamp: Date;
  preview: string;
  sessionId?: string;
}

type ChatMode = 'ask' | 'do' | 'plan';

interface ModeItem {
  value: ChatMode;
  label: string;
  iconSvg: string;
  safeIconSvg?: SafeHtml;
  description: string;
}

@Component({
  selector: 'app-ai-chatbot',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    SidebarComponent,
    HeaderComponent
  ],
  templateUrl: './ai-chatbot.component.html',
  styleUrl: './ai-chatbot.component.scss'
})
export class AiChatbotComponent implements OnInit, OnDestroy {
  chatMessages: ChatMessage[] = [];
  chatHistory: ChatHistory[] = [];
  currentChatId: number | null = null;
  chatInput = '';
  isTyping = false;
  selectedMode: ChatMode = 'ask';
  showModeDropdown = false;
  
  @ViewChild('chatMessagesContainer', { static: false }) chatMessagesContainer?: ElementRef;
  @ViewChild('modeDropdownContainer', { static: false }) modeDropdownContainer?: ElementRef;

  modes: ModeItem[] = [];
  currentSessionId: string = '';

  constructor(
    private sanitizer: DomSanitizer,
    private chatService: ChatService
  ) {}

  ngOnInit() {
    // Initialize modes with sanitized SVG icons
    this.initializeModes();
    // Initialize chatbot with welcome message
    this.initializeChatbot();
    this.loadChatHistory();
  }

  initializeModes(): void {
    const modeData: Omit<ModeItem, 'safeIconSvg'>[] = [
      { 
        value: 'ask', 
        label: 'Ask Mode', 
        iconSvg: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M13 8H8M16 12H8M11 16H8" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
        description: 'Ask questions and get answers'
      },
      { 
        value: 'do', 
        label: 'Do Mode', 
        iconSvg: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
        description: 'Perform actions and operations'
      },
      { 
        value: 'plan', 
        label: 'Plan Mode', 
        iconSvg: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><polyline points="14 2 14 8 20 8" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><line x1="16" y1="13" x2="8" y2="13" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><line x1="16" y1="17" x2="8" y2="17" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><polyline points="10 9 9 9 8 9" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
        description: 'Create plans and strategies'
      }
    ];
    
    // Sanitize SVG icons
    this.modes = modeData.map(mode => ({
      ...mode,
      safeIconSvg: this.sanitizer.bypassSecurityTrustHtml(mode.iconSvg)
    }));
  }

  initializeChatbot(): void {
    // Add welcome message
    this.chatMessages = [
      {
        id: 1,
        role: 'assistant',
        content: 'Hello! I\'m your AI assistant. How can I help you with your admin tasks, product management, routes, distributors, employees, or any questions about the admin system?',
        timestamp: new Date()
      }
    ];
  }

  loadChatHistory(): void {
    // Load chat history (mock data - replace with actual storage/API)
    const initialSessionId = this.chatService.generateSessionId();
    this.chatHistory = [
      {
        id: 1,
        title: 'New Chat',
        timestamp: new Date(),
        preview: 'Hello! I\'m your AI assistant...',
        sessionId: initialSessionId
      }
    ];
    if (this.chatHistory.length > 0) {
      this.currentChatId = this.chatHistory[0].id;
      this.currentSessionId = initialSessionId;
    }
  }

  createNewChat(): void {
    const newSessionId = this.chatService.generateSessionId();
    const newChat: ChatHistory = {
      id: Date.now(),
      title: 'New Chat',
      timestamp: new Date(),
      preview: '',
      sessionId: newSessionId
    };
    this.chatHistory.unshift(newChat);
    this.currentChatId = newChat.id;
    this.currentSessionId = newSessionId;
    this.chatMessages = [];
    this.initializeChatbot();
  }

  selectChat(chatId: number): void {
    this.currentChatId = chatId;
    const chat = this.chatHistory.find(c => c.id === chatId);
    if (chat) {
      this.currentSessionId = chat.sessionId || this.chatService.generateSessionId();
      // In a real app, load messages for this chat
      // For now, just reset to welcome message
      this.chatMessages = [];
      this.initializeChatbot();
      chat.preview = this.chatMessages.length > 0 
        ? this.chatMessages[this.chatMessages.length - 1].content.substring(0, 50) + '...'
        : '';
    }
  }

  deleteChat(chatId: number, event: Event): void {
    event.stopPropagation();
    this.chatHistory = this.chatHistory.filter(c => c.id !== chatId);
    if (this.currentChatId === chatId) {
      if (this.chatHistory.length > 0) {
        this.selectChat(this.chatHistory[0].id);
      } else {
        this.currentChatId = null;
        this.chatMessages = [];
        this.createNewChat();
      }
    }
  }

  toggleModeDropdown(): void {
    this.showModeDropdown = !this.showModeDropdown;
  }

  selectMode(mode: ChatMode): void {
    this.selectedMode = mode;
    this.showModeDropdown = false;
  }

  getCurrentModeLabel(): string {
    const mode = this.modes.find(m => m.value === this.selectedMode);
    return mode?.label || 'Ask Mode';
  }

  getCurrentModeIconSvg(): SafeHtml {
    const mode = this.modes.find(m => m.value === this.selectedMode);
    return mode?.safeIconSvg || this.sanitizer.bypassSecurityTrustHtml('<svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>');
  }

  @HostListener('document:click', ['$event'])
  onClickOutside(event: Event): void {
    if (this.modeDropdownContainer?.nativeElement && 
        !this.modeDropdownContainer.nativeElement.contains(event.target)) {
      this.showModeDropdown = false;
    }
  }

  ngOnDestroy(): void {
    // Cleanup if needed
  }

  sendMessage(): void {
    if (!this.chatInput.trim() || this.isTyping) {
      return;
    }

    // Create new chat if none exists
    if (this.currentChatId === null || !this.currentSessionId) {
      this.createNewChat();
    }

    // Add user message
    const userMessage: ChatMessage = {
      id: Date.now(),
      role: 'user',
      content: this.chatInput.trim(),
      timestamp: new Date()
    };
    this.chatMessages.push(userMessage);
    const currentInput = this.chatInput.trim();
    this.chatInput = '';
    this.isTyping = true;

    // Update chat history preview
    this.updateChatPreview(currentInput);

    // Call the API
    try {
      this.chatService.sendMessage(currentInput, this.currentSessionId).subscribe({
        next: (response) => {
          // Update session ID from response (in case it changed)
          if (response.session_id) {
            this.currentSessionId = response.session_id;
            // Update session ID in chat history
            if (this.currentChatId) {
              const chat = this.chatHistory.find(c => c.id === this.currentChatId);
              if (chat) {
                chat.sessionId = response.session_id;
              }
            }
          }

          // Add assistant response
          const assistantMessage: ChatMessage = {
            id: Date.now() + 1,
            role: 'assistant',
            content: response.message || 'No response received.',
            timestamp: new Date()
          };
          this.chatMessages.push(assistantMessage);
          this.isTyping = false;
          this.scrollToBottom();
          this.updateChatPreview(assistantMessage.content);

          // Handle follow-up question if needed
          if (response.needs_followup && response.followup_question) {
            // Optionally show follow-up question or handle it
            console.log('Follow-up question:', response.followup_question);
          }
        },
        error: (error) => {
          console.error('Error sending message:', error);
          this.isTyping = false;
          
          // Show error message to user
          let errorContent = 'Sorry, I encountered an error processing your request. Please try again.';
          if (error.error?.message) {
            errorContent = error.error.message;
          } else if (error.message) {
            errorContent = error.message;
          }
          
          const errorMessage: ChatMessage = {
            id: Date.now() + 1,
            role: 'assistant',
            content: errorContent,
            timestamp: new Date()
          };
          this.chatMessages.push(errorMessage);
          this.scrollToBottom();
        }
      });
    } catch (error: any) {
      console.error('Error initializing chat request:', error);
      this.isTyping = false;
      
      const errorMessage: ChatMessage = {
        id: Date.now() + 1,
        role: 'assistant',
        content: error.message || 'Unable to send message. Please ensure you are logged in and try again.',
        timestamp: new Date()
      };
      this.chatMessages.push(errorMessage);
      this.scrollToBottom();
    }
  }

  updateChatPreview(content: string): void {
    if (this.currentChatId) {
      const chat = this.chatHistory.find(c => c.id === this.currentChatId);
      if (chat) {
        chat.preview = content.substring(0, 50) + (content.length > 50 ? '...' : '');
        if (chat.title === 'New Chat' && content.trim()) {
          chat.title = content.substring(0, 30) + (content.length > 30 ? '...' : '');
        }
      }
    }
  }

  generateResponse(userInput: string, mode: ChatMode): string {
    // Simple response generation based on mode (replace with actual AI API call)
    const lowerInput = userInput.toLowerCase();
    const modePrefix = mode === 'ask' ? 'Let me answer that' : mode === 'do' ? 'I\'ll help you perform that' : 'Let me plan that';
    
    if (mode === 'ask') {
      if (lowerInput.includes('product') || lowerInput.includes('products')) {
        return modePrefix + ': You can manage products, brands, categories, and schemes in the Product Master section. I can help you with product information, inventory queries, or product-related operations.';
      } else if (lowerInput.includes('route') || lowerInput.includes('routes')) {
        return modePrefix + ': For route management, you can access the Routes section. I can help you create routes, assign routes to employees, or answer questions about route configurations.';
      } else if (lowerInput.includes('distributor') || lowerInput.includes('distributors')) {
        return modePrefix + ': Distributor management is available in the Distributors section. I can help you with distributor information, stock management, or distributor-related queries.';
      } else if (lowerInput.includes('employee') || lowerInput.includes('employees')) {
        return modePrefix + ': Employee management is in the Employee Master section. I can help you with employee information, role assignments, or employee-related operations.';
      } else if (lowerInput.includes('help')) {
        return modePrefix + ': I can assist you with:\n- Product management (brands, categories, products, schemes)\n- Route management and assignments\n- Distributor and retailer management\n- Employee management\n- Navigation within the admin system\n- General questions about features\n\nWhat would you like to know?';
      }
    } else if (mode === 'do') {
      if (lowerInput.includes('create') || lowerInput.includes('add') || lowerInput.includes('new')) {
        return modePrefix + ' action for you. Based on your request, I can help you create new products, routes, distributors, employees, or perform other operations. What specific action would you like me to perform?';
      } else if (lowerInput.includes('update') || lowerInput.includes('edit') || lowerInput.includes('modify')) {
        return modePrefix + ' update operation. I can help you update product details, modify routes, edit distributor information, or update employee records. Which item would you like to update?';
      } else if (lowerInput.includes('delete') || lowerInput.includes('remove')) {
        return modePrefix + ' deletion. Please specify which item you\'d like to delete, and I\'ll guide you through the process safely.';
      } else {
        return modePrefix + ' operation. I\'m ready to perform actions in the admin system. What would you like me to do?';
      }
    } else if (mode === 'plan') {
      if (lowerInput.includes('strategy') || lowerInput.includes('plan') || lowerInput.includes('approach')) {
        return modePrefix + ' strategically. Let me create a comprehensive plan for you. I\'ll break down the strategy into actionable steps and help you organize your approach. What area would you like to plan for?';
      } else {
        return modePrefix + ' step-by-step plan. I\'ll help you create a structured approach with clear milestones and actionable items. What would you like to plan?';
      }
    }
    
    // Default response
    if (lowerInput.includes('hello') || lowerInput.includes('hi')) {
      return 'Hello! I\'m your AI assistant in ' + mode + ' mode. How can I help you today?';
    } else {
      return modePrefix + '. I understand you\'re asking about: "' + userInput + '". I\'m here to help with admin system operations. Could you provide more details?';
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

  onAttachClick(event: Event): void {
    event.preventDefault();
    // Create file input element
    const input = document.createElement('input');
    input.type = 'file';
    input.multiple = true;
    input.onchange = (e: any) => {
      const files = e.target.files;
      if (files && files.length > 0) {
        console.log('Files selected:', files);
        // Handle file attachment logic here
        // You can add files to a list or send them with the message
      }
    };
    input.click();
  }
}

