import { Component, OnInit, OnDestroy } from '@angular/core';
import { RouterOutlet, Router, NavigationEnd } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ChatWidgetComponent } from './shared/components/chat-widget/chat-widget.component';
import { ChatWidgetService } from './shared/services/chat-widget.service';
import { filter } from 'rxjs/operators';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, ChatWidgetComponent, CommonModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit, OnDestroy {
  title = 'Admin Website';
  showChatWidget = true;
  private enabledSubscription?: Subscription;

  constructor(
    private router: Router,
    private chatWidgetService: ChatWidgetService
  ) {}

  ngOnInit() {
    // Check initial route
    this.checkRoute(this.router.url);

    // Listen to route changes
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: any) => {
        this.checkRoute(event.url);
      });

    // Subscribe to AI Assistant enabled state
    this.enabledSubscription = this.chatWidgetService.enabled$.subscribe(enabled => {
      this.updateChatWidgetVisibility();
    });
    
    // Initial check
    this.updateChatWidgetVisibility();
  }

  ngOnDestroy() {
    if (this.enabledSubscription) {
      this.enabledSubscription.unsubscribe();
    }
  }

  private checkRoute(url: string) {
    // Hide chat widget on login page and super admin routes
    const isLoginPage = url === '/login' || url.startsWith('/login?');
    const isSuperAdminRoute = url === '/superadmin' || url.startsWith('/super-admin');
    const shouldShowByRoute = !isLoginPage && !isSuperAdminRoute;
    this.updateChatWidgetVisibility(shouldShowByRoute);
  }

  private updateChatWidgetVisibility(shouldShowByRoute?: boolean) {
    const routeCheck = shouldShowByRoute !== undefined ? shouldShowByRoute : 
      !this.router.url.startsWith('/login') && 
      !this.router.url.startsWith('/superadmin') && 
      !this.router.url.startsWith('/super-admin');
    
    const isEnabled = this.chatWidgetService.isEnabled;
    this.showChatWidget = routeCheck && isEnabled;
  }
}

