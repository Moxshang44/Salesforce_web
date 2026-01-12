import { Component, OnInit } from '@angular/core';
import { RouterOutlet, Router, NavigationEnd } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ChatWidgetComponent } from './shared/components/chat-widget/chat-widget.component';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, ChatWidgetComponent, CommonModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit {
  title = 'Admin Website';
  showChatWidget = true;

  constructor(private router: Router) {}

  ngOnInit() {
    // Check initial route
    this.checkRoute(this.router.url);

    // Listen to route changes
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: any) => {
        this.checkRoute(event.url);
      });
  }

  private checkRoute(url: string) {
    // Hide chat widget on login page and super admin routes
    const isLoginPage = url === '/login' || url.startsWith('/login?');
    const isSuperAdminRoute = url === '/superadmin' || url.startsWith('/super-admin');
    this.showChatWidget = !isLoginPage && !isSuperAdminRoute;
  }
}

