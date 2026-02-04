import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { ChatWidgetService } from '../../../shared/services/chat-widget.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})
export class HeaderComponent {
  companyName = 'Gaatha Global Marketing';
  hasNotifications = true;
  searchQuery = '';
  showProfileMenu = false;
  aiAssistantEnabled = true;

  constructor(
    private authService: AuthService,
    private router: Router,
    private chatWidgetService: ChatWidgetService
  ) {
    // Subscribe to enabled state
    this.chatWidgetService.enabled$.subscribe(enabled => {
      this.aiAssistantEnabled = enabled;
    });
    
    // Get initial state
    this.aiAssistantEnabled = this.chatWidgetService.isEnabled;
  }

  onSearch(event: Event) {
    const input = event.target as HTMLInputElement;
    this.searchQuery = input.value;
    console.log('Search:', this.searchQuery);
  }

  onNotificationClick() {
    console.log('Notifications clicked');
  }

  onAiClick() {
    this.chatWidgetService.toggle();
  }

  onAiToggle(event: Event) {
    event.stopPropagation();
    this.chatWidgetService.toggleEnabled();
  }

  onProfileClick() {
    this.showProfileMenu = !this.showProfileMenu;
  }

  onLogout() {
    this.showProfileMenu = false;
    // Check if we're in super admin context
    if (this.router.url.startsWith('/super-admin')) {
      this.authService.superAdminLogout();
    } else if (this.router.url.startsWith('/dms')) {
      this.authService.dmsLogout();
    } else {
      this.authService.logout();
    }
  }
}
