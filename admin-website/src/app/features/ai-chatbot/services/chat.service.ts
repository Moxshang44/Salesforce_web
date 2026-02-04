import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiService } from '../../../core/services/api.service';
import { AuthService } from '../../../core/services/auth.service';

export interface ChatRequest {
  user_id: string;
  company_id: string;
  session_id: string;
  user_message: string;
}

export interface ChatResponse {
  session_id: string;
  message: string;
  needs_followup: boolean;
  followup_question: string;
}

export interface ChatHistoryItem {
  session_id: string;
  user_message?: string;
  assistant_message?: string;
  timestamp?: string;
  created_at?: string;
}

export interface ChatHistoryResponse {
  status_code?: number;
  data?: ChatHistoryItem[];
  sessions?: string[];  // Array of session IDs
  message?: string;
}

export interface ChatSessionResponse {
  status_code?: number;
  data?: ChatHistoryItem[];
  message?: string;
}

@Injectable({
  providedIn: 'root'
})
export class ChatService {
  constructor(
    private http: HttpClient,
    private apiService: ApiService,
    private authService: AuthService
  ) {}

  sendMessage(userMessage: string, sessionId: string): Observable<ChatResponse> {
    const companyInfo = this.authService.getCompanyInfo();
    const userId = this.authService.getUserId();
    
    if (!companyInfo || !companyInfo.company_id) {
      throw new Error('Company ID not found. Please ensure you are logged in.');
    }
    
    if (!userId) {
      throw new Error('User ID not found. Please ensure you are logged in.');
    }

    const requestBody: ChatRequest = {
      user_id: userId,
      company_id: companyInfo.company_id,
      session_id: sessionId,
      user_message: userMessage
    };

    const headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });

    const url = this.apiService.getApiUrl('agents/chat');
    
    return this.http.post<ChatResponse>(url, requestBody, { headers });
  }

  generateSessionId(): string {
    // Generate a unique session ID
    return `session_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
  }

  getChatHistory(): Observable<ChatHistoryResponse> {
    const userId = this.authService.getUserId();
    
    if (!userId) {
      throw new Error('User ID not found. Please ensure you are logged in.');
    }

    const headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });

    const url = this.apiService.getApiUrl(`agents/${userId}/chat`);
    
    return this.http.get<ChatHistoryResponse>(url, { headers });
  }

  getChatSession(sessionId: string): Observable<ChatSessionResponse> {
    const userId = this.authService.getUserId();
    
    if (!userId) {
      throw new Error('User ID not found. Please ensure you are logged in.');
    }

    if (!sessionId) {
      throw new Error('Session ID is required.');
    }

    const headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });

    const url = this.apiService.getApiUrl(`agents/${userId}/chat/${sessionId}`);
    
    return this.http.get<ChatSessionResponse>(url, { headers });
  }
}

