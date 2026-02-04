import { Component, OnInit, OnDestroy } from '@angular/core';
import { RouterOutlet, Router, NavigationEnd, NavigationStart, NavigationCancel, NavigationError } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ChatWidgetComponent } from './shared/components/chat-widget/chat-widget.component';
import { ChatWidgetService } from './shared/services/chat-widget.service';
import { filter } from 'rxjs/operators';
import { Subscription } from 'rxjs';
import { LogoLoaderComponent } from './shared/components/logo-loader/logo-loader.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, ChatWidgetComponent, CommonModule, LogoLoaderComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit, OnDestroy {
  title = 'Admin Website';
  showChatWidget = true;
  isRouteLoading = false;
  private enabledSubscription?: Subscription;
  private routeSubscription?: Subscription;
  private navStartTime = 0;
  private loadingTimeoutId: any = null;
  private readonly minLoaderMs = 1000;

  constructor(
    private router: Router,
    private chatWidgetService: ChatWidgetService
  ) {}

  ngOnInit() {
    // Check initial route
    this.checkRoute(this.router.url);

    // Listen to route changes
    this.routeSubscription = this.router.events.subscribe((event: any) => {
      if (event instanceof NavigationStart) {
        this.navStartTime = Date.now();
        this.isRouteLoading = true;
        if (this.loadingTimeoutId) {
          clearTimeout(this.loadingTimeoutId);
          this.loadingTimeoutId = null;
        }
        return;
      }

      if (event instanceof NavigationEnd) {
        this.checkRoute(event.url);
      }

      if (event instanceof NavigationEnd || event instanceof NavigationCancel || event instanceof NavigationError) {
        const elapsed = Date.now() - this.navStartTime;
        const remaining = this.minLoaderMs - elapsed;
        if (remaining > 0) {
          this.loadingTimeoutId = setTimeout(() => {
            this.isRouteLoading = false;
            this.loadingTimeoutId = null;
          }, remaining);
        } else {
          this.isRouteLoading = false;
        }
      }
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
    if (this.routeSubscription) {
      this.routeSubscription.unsubscribe();
    }
    if (this.loadingTimeoutId) {
      clearTimeout(this.loadingTimeoutId);
      this.loadingTimeoutId = null;
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

