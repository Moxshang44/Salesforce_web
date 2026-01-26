import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { SidebarComponent } from '../../core/layout/sidebar/sidebar.component';
import { HeaderComponent } from '../../core/layout/header/header.component';

@Component({
  selector: 'app-coming-soon',
  standalone: true,
  imports: [CommonModule, SidebarComponent, HeaderComponent],
  templateUrl: './coming-soon.component.html',
  styleUrl: './coming-soon.component.scss'
})
export class ComingSoonComponent implements OnInit {
  pageName: string = '';

  constructor(private route: ActivatedRoute) {}

  ngOnInit(): void {
    // Get page name from route
    const route = this.route.snapshot.url;
    if (route.length > 0) {
      const lastSegment = route[route.length - 1].path;
      
      // Convert route to readable page name
      this.pageName = lastSegment
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
    }
  }
}

