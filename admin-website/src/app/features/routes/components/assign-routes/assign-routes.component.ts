import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SidebarComponent } from '../../../../core/layout/sidebar/sidebar.component';
import { HeaderComponent } from '../../../../core/layout/header/header.component';

@Component({
  selector: 'app-assign-routes',
  standalone: true,
  imports: [CommonModule, SidebarComponent, HeaderComponent],
  templateUrl: './assign-routes.component.html',
  styleUrl: './assign-routes.component.scss'
})
export class AssignRoutesComponent {

}
