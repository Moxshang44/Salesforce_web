import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SidebarComponent } from '../../../../core/layout/sidebar/sidebar.component';
import { HeaderComponent } from '../../../../core/layout/header/header.component';

@Component({
  selector: 'app-add-routes',
  standalone: true,
  imports: [CommonModule, SidebarComponent, HeaderComponent],
  templateUrl: './add-routes.component.html',
  styleUrl: './add-routes.component.scss'
})
export class AddRoutesComponent {

}
