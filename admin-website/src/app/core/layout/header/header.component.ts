import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

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

  onSearch(event: Event) {
    const input = event.target as HTMLInputElement;
    this.searchQuery = input.value;
    console.log('Search:', this.searchQuery);
  }

  onNotificationClick() {
    console.log('Notifications clicked');
  }

  onAiClick() {
    console.log('Talk to AI clicked');
  }

  onProfileClick() {
    console.log('Profile clicked');
  }
}
