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

  constructor(
    private authService: AuthService,
    private router: Router,
    private chatWidgetService: ChatWidgetService
  ) {}

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

  onProfileClick() {
    this.showProfileMenu = !this.showProfileMenu;
  }

  onLogout() {
    this.showProfileMenu = false;
    // Check if we're in DMS context
    if (this.router.url.startsWith('/dms')) {
      this.authService.dmsLogout();
    } else {
      this.authService.logout();
    }
  }
}
