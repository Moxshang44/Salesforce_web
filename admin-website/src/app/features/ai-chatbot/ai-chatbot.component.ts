import { Component, OnInit, OnDestroy, ViewChild, ElementRef, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { Subscription } from 'rxjs';
import { SidebarComponent } from '../../core/layout/sidebar/sidebar.component';
import { HeaderComponent } from '../../core/layout/header/header.component';
import { ChatService, ChatHistoryItem } from './services/chat.service';

interface ChatMessage {
  id: number;
  role: 'user' | 'assistant';
  content: string;
  formattedContent?: SafeHtml;
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
  private sessionSubscription?: Subscription;

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
    const welcomeContent = 'Hello! I\'m your AI assistant. How can I help you with your admin tasks, product management, routes, distributors, employees, or any questions about the admin system?';
    this.chatMessages = [
      {
        id: 1,
        role: 'assistant',
        content: welcomeContent,
        formattedContent: this.formatMessageContent(welcomeContent),
        timestamp: new Date()
      }
    ];
  }

  loadChatHistory(): void {
    try {
      this.chatService.getChatHistory().subscribe({
        next: (response: any) => {
          console.log('Chat history response:', response);
          
          // Handle the sessions array response structure
          if (response.sessions && Array.isArray(response.sessions) && response.sessions.length > 0) {
            // Convert session IDs to ChatHistory format
            this.chatHistory = response.sessions.map((sessionId: string, index: number) => {
              // Extract timestamp from session ID if it follows the pattern session_timestamp_random
              let timestamp = new Date();
              const sessionParts = sessionId.split('_');
              if (sessionParts.length >= 2 && sessionParts[1]) {
                const sessionTimestamp = parseInt(sessionParts[1]);
                if (!isNaN(sessionTimestamp)) {
                  timestamp = new Date(sessionTimestamp);
                }
              }
              
              return {
                id: index + 1,
                title: `Chat ${index + 1}`,
                timestamp: timestamp,
                preview: 'Click to view messages...',
                sessionId: sessionId
              };
            });
            
            // Sort by timestamp (newest first) - sessions are likely already in order, but sort to be sure
            this.chatHistory.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
            
            // Update titles with better names
            this.chatHistory.forEach((chat, index) => {
              chat.title = `Chat ${this.chatHistory.length - index}`;
            });
            
            // Load previews for all sessions (in parallel)
            this.loadPreviewsForAllSessions();
            
            // Select the most recent chat and load its messages
            if (this.chatHistory.length > 0) {
              this.currentChatId = this.chatHistory[0].id;
              this.currentSessionId = this.chatHistory[0].sessionId || '';
              // Load messages for the selected chat
              this.loadMessagesForSession(this.currentSessionId);
            } else {
              // No history, create new chat
              this.createNewChat();
            }
          } 
          // Fallback: Handle old data structure if API changes
          else if (response.data && Array.isArray(response.data) && response.data.length > 0) {
            // Group messages by session_id
            const sessionsMap = new Map<string, ChatHistoryItem[]>();
            
            response.data.forEach((item: ChatHistoryItem) => {
              if (item.session_id) {
                if (!sessionsMap.has(item.session_id)) {
                  sessionsMap.set(item.session_id, []);
                }
                sessionsMap.get(item.session_id)!.push(item);
              }
            });
            
            // Convert to ChatHistory format
            this.chatHistory = Array.from(sessionsMap.entries()).map(([sessionId, messages], index) => {
              // Sort messages by timestamp
              const sortedMessages = messages.sort((a, b) => {
                const timeA = a.timestamp || a.created_at || '';
                const timeB = b.timestamp || b.created_at || '';
                return new Date(timeA).getTime() - new Date(timeB).getTime();
              });
              
              // Get the first user message as preview
              const firstUserMessage = sortedMessages.find(m => m.user_message);
              const preview = firstUserMessage?.user_message?.substring(0, 50) || 
                            sortedMessages[0]?.assistant_message?.substring(0, 50) || 
                            'New Chat';
              
              // Get the latest timestamp
              const latestMessage = sortedMessages[sortedMessages.length - 1];
              const timestamp = latestMessage?.timestamp || latestMessage?.created_at || new Date().toISOString();
              
              return {
                id: index + 1,
                title: preview.length > 30 ? preview.substring(0, 30) + '...' : preview,
                timestamp: new Date(timestamp),
                preview: preview + (preview.length >= 50 ? '...' : ''),
                sessionId: sessionId
              };
            });
            
            // Sort by timestamp (newest first)
            this.chatHistory.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
            
            // Select the most recent chat
            if (this.chatHistory.length > 0) {
              this.currentChatId = this.chatHistory[0].id;
              this.currentSessionId = this.chatHistory[0].sessionId || '';
              // Load messages for the selected chat
              this.loadMessagesForSession(this.currentSessionId);
            } else {
              // No history, create new chat
              this.createNewChat();
            }
          } else {
            // No history found, create new chat
            this.createNewChat();
          }
        },
        error: (error) => {
          console.error('Error loading chat history:', error);
          // On error, create a new chat
          this.createNewChat();
        }
      });
    } catch (error: any) {
      console.error('Error initializing chat history:', error);
      // On error, create a new chat
      this.createNewChat();
    }
  }

  loadPreviewsForAllSessions(): void {
    // Load previews for all sessions to update their titles
    this.chatHistory.forEach((chat, index) => {
      if (chat.sessionId) {
        this.chatService.getChatSession(chat.sessionId).subscribe({
          next: (response: any) => {
            // Handle new API format: {items: [{role: "user", message: "..."}, ...]}
            let messages: any[] = [];
            
            if (response.items && Array.isArray(response.items) && response.items.length > 0) {
              messages = response.items;
            } else if (response.data && Array.isArray(response.data) && response.data.length > 0) {
              messages = response.data;
            }
            
            if (messages.length > 0) {
              // Sort messages by timestamp
              const sortedMessages = messages.sort((a, b) => {
                const timeA = a.timestamp || a.created_at || '';
                const timeB = b.timestamp || b.created_at || '';
                return new Date(timeA).getTime() - new Date(timeB).getTime();
              });
              
              // Get the first user message as preview
              let preview = '';
              
              // Handle new format: {role: "user" | "assistant", message: "..."}
              const firstUserMessage = sortedMessages.find((m: any) => 
                (m.role === 'user' && m.message) || m.user_message
              );
              
              if (firstUserMessage) {
                preview = firstUserMessage.message || firstUserMessage.user_message || '';
              } else if (sortedMessages[0]) {
                // Fallback to first message
                preview = sortedMessages[0].message || sortedMessages[0].assistant_message || '';
              }
              
              if (!preview) {
                preview = `Chat ${index + 1}`;
              }
              
              // Update the chat history item with preview
              const chatItem = this.chatHistory.find(c => c.sessionId === chat.sessionId);
              if (chatItem) {
                chatItem.title = preview.length > 30 ? preview.substring(0, 30) + '...' : preview;
                chatItem.preview = preview.substring(0, 50) + (preview.length >= 50 ? '...' : '');
                
                // Update timestamp from first message if available
                if (sortedMessages[0]) {
                  const msgTimestamp = sortedMessages[0].timestamp || sortedMessages[0].created_at;
                  if (msgTimestamp) {
                    chatItem.timestamp = new Date(msgTimestamp);
                  }
                }
              }
            }
          },
          error: (error) => {
            // Silently fail for preview loading - don't show error to user
            console.log('Could not load preview for session:', chat.sessionId);
          }
        });
      }
    });
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
    // Cancel any pending subscription from previous chat
    if (this.sessionSubscription) {
      this.sessionSubscription.unsubscribe();
      this.sessionSubscription = undefined;
    }
    
    // Clear messages immediately to prevent mixing
    this.chatMessages = [];
    
    this.currentChatId = chatId;
    const chat = this.chatHistory.find(c => c.id === chatId);
    if (chat && chat.sessionId) {
      this.currentSessionId = chat.sessionId;
      // Load messages for this chat session
      this.loadMessagesForSession(chat.sessionId);
    } else {
      // Fallback: create new session
      this.currentSessionId = this.chatService.generateSessionId();
      this.chatMessages = [];
      this.initializeChatbot();
    }
  }

  loadMessagesForSession(sessionId: string): void {
    try {
      // Cancel any existing subscription
      if (this.sessionSubscription) {
        this.sessionSubscription.unsubscribe();
      }
      
      // Store the session ID we're loading to verify response matches
      const loadingSessionId = sessionId;
      
      // Clear messages before loading new ones
      this.chatMessages = [];
      
      this.sessionSubscription = this.chatService.getChatSession(sessionId).subscribe({
        next: (response: any) => {
          // Verify this response is for the currently selected session
          if (this.currentSessionId !== loadingSessionId) {
            console.log('Ignoring response for different session:', loadingSessionId, 'Current:', this.currentSessionId);
            return;
          }
          
          console.log('Chat session response:', response);
          
          // Handle new API format: {items: [{role: "user", message: "..."}, {role: "assistant", message: "..."}]}
          let messages: any[] = [];
          
          if (response.items && Array.isArray(response.items) && response.items.length > 0) {
            // New format: items array with role and message
            messages = response.items;
          } else if (response.data && Array.isArray(response.data) && response.data.length > 0) {
            // Old format: data array with user_message and assistant_message
            messages = response.data;
          }
          
          if (messages.length > 0) {
            // Convert to ChatMessage format - clear first to ensure clean state
            this.chatMessages = [];
            let messageIndex = 1;
            
            messages.forEach((item: any) => {
              // Handle new format: {role: "user" | "assistant", message: "..."}
              if (item.role && item.message) {
                this.chatMessages.push({
                  id: messageIndex++,
                  role: item.role === 'user' ? 'user' : 'assistant',
                  content: item.message,
                  formattedContent: item.role === 'assistant' ? this.formatMessageContent(item.message) : undefined,
                  timestamp: item.timestamp ? new Date(item.timestamp) : 
                            (item.created_at ? new Date(item.created_at) : new Date())
                });
              }
              // Handle old format: {user_message: "...", assistant_message: "..."}
              else {
                // Add user message if exists
                if (item.user_message) {
                  this.chatMessages.push({
                    id: messageIndex++,
                    role: 'user',
                    content: item.user_message,
                    timestamp: item.timestamp ? new Date(item.timestamp) : 
                              (item.created_at ? new Date(item.created_at) : new Date())
                  });
                }
                
                // Add assistant message if exists
                if (item.assistant_message) {
                  this.chatMessages.push({
                    id: messageIndex++,
                    role: 'assistant',
                    content: item.assistant_message,
                    formattedContent: this.formatMessageContent(item.assistant_message),
                    timestamp: item.timestamp ? new Date(item.timestamp) : 
                              (item.created_at ? new Date(item.created_at) : new Date())
                  });
                }
              }
            });
            
            // If no messages found, show welcome message
            if (this.chatMessages.length === 0) {
              this.initializeChatbot();
            } else {
              // Scroll to bottom after loading
              setTimeout(() => this.scrollToBottom(), 100);
            }
          } else {
            // No messages, show welcome
            this.initializeChatbot();
          }
        },
        error: (error) => {
          // Only show error if this is still the current session
          if (this.currentSessionId === loadingSessionId) {
            console.error('Error loading messages for session:', error);
            // On error, show welcome message
            this.initializeChatbot();
          }
        }
      });
    } catch (error: any) {
      console.error('Error loading messages:', error);
      this.initializeChatbot();
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
    // Cleanup subscriptions
    if (this.sessionSubscription) {
      this.sessionSubscription.unsubscribe();
    }
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

          // Format and add assistant response
          const responseContent = response.message || 'No response received.';
          const assistantMessage: ChatMessage = {
            id: Date.now() + 1,
            role: 'assistant',
            content: responseContent,
            formattedContent: this.formatMessageContent(responseContent),
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
            formattedContent: this.formatMessageContent(errorContent),
            timestamp: new Date()
          };
          this.chatMessages.push(errorMessage);
          this.scrollToBottom();
        }
      });
    } catch (error: any) {
      console.error('Error initializing chat request:', error);
      this.isTyping = false;
      
      const errorContent = error.message || 'Unable to send message. Please ensure you are logged in and try again.';
      const errorMessage: ChatMessage = {
        id: Date.now() + 1,
        role: 'assistant',
        content: errorContent,
        formattedContent: this.formatMessageContent(errorContent),
        timestamp: new Date()
      };
      this.chatMessages.push(errorMessage);
      this.scrollToBottom();
    }
  }

  // Format message content to detect and render tables
  formatMessageContent(content: string): SafeHtml {
    // Check if content already contains HTML table tags
    if (content.includes('<table') || content.includes('<TABLE') || content.includes('<Table')) {
      // Wrap existing HTML table with our styling wrapper
      let wrapped = content;
      
      // Remove rows that contain only dashes, dots, or separator characters
      wrapped = wrapped.replace(
        /<tr[^>]*>[\s\S]*?<\/tr>/gi,
        (match) => {
          // Check if all cells in this row contain only dashes, dots, or separators
          const cellContent = match.replace(/<[^>]+>/g, '').trim();
          if (cellContent.match(/^[\s\-\.:]+$/)) {
            return ''; // Remove separator rows
          }
          return match;
        }
      );
      
      // Wrap each table with our wrapper
      wrapped = wrapped.replace(
        /<table([^>]*)>/gi, 
        '<div class="chat-table-wrapper"><table class="chat-table"$1>'
      );
      wrapped = wrapped.replace(
        /<\/table>/gi,
        '</table></div>'
      );
      
      // Also ensure proper styling for existing tables
      wrapped = wrapped.replace(
        /<th([^>]*)>/gi,
        '<th class="chat-table-header"$1>'
      );
      
      // Preserve line breaks for non-table content
      wrapped = wrapped.replace(/\n/g, '<br>');
      
      return this.sanitizer.bypassSecurityTrustHtml(wrapped);
    }
    
    // Check if content contains table-like structures
    // Pattern 1: Markdown table (| separated with --- separator)
    if (content.includes('|') && (content.includes('---') || content.includes('|--'))) {
      return this.sanitizer.bypassSecurityTrustHtml(this.formatMarkdownTable(content));
    }
    
    // Pattern 2: Pipe-separated table without markdown
    if (content.includes('|') && this.looksLikeTable(content)) {
      return this.sanitizer.bypassSecurityTrustHtml(this.formatPipeTable(content));
    }
    
    // Pattern 3: Line-separated data that could be a table
    if (this.looksLikeDataTable(content)) {
      return this.sanitizer.bypassSecurityTrustHtml(this.formatDataTable(content));
    }
    
    // Default: return as plain text with line breaks preserved
    const formatted = content
      .replace(/\n/g, '<br>')
      .replace(/`([^`]+)`/g, '<code>$1</code>');
    return this.sanitizer.bypassSecurityTrustHtml(formatted);
  }

  looksLikeTable(content: string): boolean {
    const lines = content.split('\n').filter(line => line.trim());
    if (lines.length < 2) return false;
    
    // Check if multiple lines contain pipes
    const linesWithPipes = lines.filter(line => {
      const trimmed = line.trim();
      if (!trimmed.includes('|')) return false;
      const cells = trimmed.split('|').filter(c => c.trim());
      return cells.length >= 2; // At least 2 columns
    });
    
    // Need at least 2 rows with pipes to be considered a table
    if (linesWithPipes.length >= 2) {
      // Check if columns are consistent (similar number of cells)
      const firstRowCells = linesWithPipes[0].split('|').filter(c => c.trim()).length;
      const consistentRows = linesWithPipes.filter(line => {
        const cellCount = line.split('|').filter(c => c.trim()).length;
        return Math.abs(cellCount - firstRowCells) <= 1; // Allow 1 column difference
      });
      return consistentRows.length >= 2;
    }
    
    return false;
  }

  looksLikeDataTable(content: string): boolean {
    // Check for patterns like "Route Name: value" or structured data
    const lines = content.split('\n').filter(line => line.trim());
    if (lines.length < 3) return false;
    
    // Check for colon-separated key-value pairs or structured format
    const structuredLines = lines.filter(line => 
      line.includes(':') || 
      line.match(/^\s*\w+\s+\w+/) // Pattern like "test 423DFKA"
    );
    
    return structuredLines.length >= 3;
  }

  formatMarkdownTable(content: string): string {
    const lines = content.split('\n');
    let inTable = false;
    let tableHtml = '';
    let result = '';
    let headerProcessed = false;
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      
      // Check if it's a table separator line (skip it completely, don't render)
      if (line.match(/^\|[\s\-:]+\|$/) || line.match(/^[\s\-:|]+$/)) {
        if (inTable && !headerProcessed) {
          headerProcessed = true;
          // Convert the last row to header
          tableHtml = tableHtml.replace(/<tr>(.*?)<\/tr>/, '<thead><tr>$1</tr></thead><tbody>');
        }
        continue; // Skip separator line completely
      }
      
      if (line.includes('|') && line.split('|').filter(c => c.trim()).length > 1) {
        // Extract cells from the row
        const cells = line.split('|')
          .map(cell => cell.trim())
          .filter(cell => cell.length > 0);
        
        // Skip rows where all cells are only dashes, dots, or separator characters
        if (this.isSeparatorRow(cells)) {
          if (inTable && !headerProcessed) {
            headerProcessed = true;
            // Convert the last row to header
            tableHtml = tableHtml.replace(/<tr>(.*?)<\/tr>/, '<thead><tr>$1</tr></thead><tbody>');
          }
          continue; // Skip separator row
        }
        
        // Table row
        if (!inTable) {
          inTable = true;
          tableHtml = '<div class="chat-table-wrapper"><table class="chat-table">';
          headerProcessed = false;
        }
        
        if (cells.length > 0) {
          tableHtml += `<tr>${cells.map(cell => `<td>${this.escapeHtml(cell)}</td>`).join('')}</tr>`;
        }
      } else {
        // End of table
        if (inTable) {
          if (!headerProcessed) {
            // No header separator found, treat first row as header
            tableHtml = tableHtml.replace(/<tr>(.*?)<\/tr>/, '<thead><tr>$1</tr></thead><tbody>');
          } else {
            tableHtml += '</tbody>';
          }
          tableHtml += '</table></div>';
          result += tableHtml;
          tableHtml = '';
          inTable = false;
          headerProcessed = false;
        }
        if (line.trim()) {
          result += this.escapeHtml(line) + '<br>';
        }
      }
    }
    
    if (inTable) {
      if (!headerProcessed) {
        tableHtml = tableHtml.replace(/<tr>(.*?)<\/tr>/, '<thead><tr>$1</tr></thead><tbody>');
      } else {
        tableHtml += '</tbody>';
      }
      tableHtml += '</table></div>';
      result += tableHtml;
    }
    
    return result || this.escapeHtml(content).replace(/\n/g, '<br>');
  }

  formatPipeTable(content: string): string {
    const lines = content.split('\n');
    const result: string[] = [];
    let tableLines: string[] = [];
    let inTable = false;
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      const hasPipes = line.includes('|');
      const cellCount = line.split('|').filter(c => c.trim()).length;
      
      if (hasPipes && cellCount > 1) {
        // This is a table row
        if (!inTable) {
          inTable = true;
          tableLines = [];
        }
        tableLines.push(line);
      } else {
        // End of table or non-table line
        if (inTable && tableLines.length > 0) {
          result.push(this.buildTableFromLines(tableLines));
          tableLines = [];
          inTable = false;
        }
        if (line) {
          result.push(this.escapeHtml(line) + '<br>');
        }
      }
    }
    
    // Handle table at end of content
    if (inTable && tableLines.length > 0) {
      result.push(this.buildTableFromLines(tableLines));
    }
    
    return result.join('');
  }
  
  buildTableFromLines(lines: string[]): string {
    if (lines.length === 0) return '';
    
    let tableHtml = '<div class="chat-table-wrapper"><table class="chat-table">';
    let firstRow = true;
    
    for (const line of lines) {
      const cells = line.split('|')
        .map(cell => cell.trim())
        .filter(cell => cell.length > 0);
      
      // Skip rows where all cells are only dashes, dots, or separator characters
      if (this.isSeparatorRow(cells)) {
        if (firstRow) {
          // If first row is a separator, treat next row as header
          continue;
        } else {
          // Skip separator rows in body
          continue;
        }
      }
      
      if (cells.length > 0) {
        if (firstRow) {
          // First row is header
          tableHtml += `<thead><tr>${cells.map(cell => `<th>${this.escapeHtml(cell)}</th>`).join('')}</tr></thead><tbody>`;
          firstRow = false;
        } else {
          tableHtml += `<tr>${cells.map(cell => `<td>${this.escapeHtml(cell)}</td>`).join('')}</tr>`;
        }
      }
    }
    
    tableHtml += '</tbody></table></div>';
    return tableHtml;
  }

  formatDataTable(content: string): string {
    // For structured data like "Route Name: test, Code: 423DFKA"
    const lines = content.split('\n').filter(line => line.trim());
    let result = '';
    
    // Try to detect if it's a list format
    if (lines.some(line => line.includes(':'))) {
      result = '<div class="chat-data-list">';
      for (const line of lines) {
        if (line.includes(':')) {
          const [key, ...valueParts] = line.split(':');
          const value = valueParts.join(':').trim();
          result += `<div class="chat-data-item"><strong>${this.escapeHtml(key.trim())}:</strong> <span>${this.escapeHtml(value)}</span></div>`;
        } else {
          result += `<div class="chat-data-item">${this.escapeHtml(line)}</div>`;
        }
      }
      result += '</div>';
    } else {
      result = this.escapeHtml(content).replace(/\n/g, '<br>');
    }
    
    return result;
  }

  escapeHtml(text: string): string {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  // Check if a row contains only separator characters (dashes, dots, etc.)
  isSeparatorRow(cells: string[]): boolean {
    if (cells.length === 0) return true;
    
    // Check if all cells are only dashes, dots, colons, spaces, or empty
    return cells.every(cell => {
      const trimmed = cell.trim();
      return trimmed.length === 0 || trimmed.match(/^[\s\-\.:]+$/);
    });
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

