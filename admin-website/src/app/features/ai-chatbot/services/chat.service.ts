import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiService } from '../../../core/services/api.service';
import { AuthService } from '../../../core/services/auth.service';

export interface ChatRequest {
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
    
    if (!companyInfo || !companyInfo.company_id) {
      throw new Error('Company ID not found. Please ensure you are logged in.');
    }

    const requestBody: ChatRequest = {
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
}

