import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SidebarComponent } from '../../core/layout/sidebar/sidebar.component';
import { HeaderComponent } from '../../core/layout/header/header.component';
import { ModalComponent } from '../../shared/components/modal/modal.component';
import { RouteFormStep1Component } from './components/route-form-step1/route-form-step1.component';
import { ButtonComponent } from '../../shared/components/button/button.component';

interface Route {
  id: number;
  actions: string;
  active: boolean;
  routeName: string;
  routeCode: string;
  channel: string;
  area: string;
  region: string;
}

@Component({
  selector: 'app-routes',
  standalone: true,
  imports: [CommonModule, SidebarComponent, HeaderComponent, ModalComponent, RouteFormStep1Component, ButtonComponent],
  templateUrl: './routes.component.html',
  styleUrl: './routes.component.scss'
})
export class RoutesComponent {
  currentPage = 1;
  totalPages = 2;
  isAddModalOpen = false;
  currentStep = 1;

  routes: Route[] = [
    {
      id: 1,
      actions: '',
      active: true,
      routeName: 'Kasthuri West Route',
      routeCode: '#01 MUM-ICIC',
      channel: 'General Trade',
      area: 'Andheri West',
      region: 'Mumbai'
    },
    {
      id: 2,
      actions: '',
      active: true,
      routeName: 'Kasthuri West Route',
      routeCode: '#01 MUM-ICIC',
      channel: 'General Trade',
      area: 'Andheri West',
      region: 'Mumbai'
    },
    {
      id: 3,
      actions: '',
      active: true,
      routeName: 'Kasthuri West Route',
      routeCode: '#01 MUM-ICIC',
      channel: 'Modern Trade',
      area: 'Andheri East',
      region: 'Mumbai'
    },
    {
      id: 4,
      actions: '',
      active: true,
      routeName: 'Chennai Route',
      routeCode: '#01 MUM-ICIC',
      channel: 'General Trade',
      area: 'Normal',
      region: 'Chennai'
    },
    {
      id: 5,
      actions: '',
      active: true,
      routeName: 'Dadar West Route',
      routeCode: '#01 MUM-ICIC',
      channel: 'Modern Trade',
      area: 'Dadar West',
      region: 'Mumbai'
    },
    {
      id: 6,
      actions: '',
      active: true,
      routeName: 'Dadar Route',
      routeCode: '#01 MUM-ICIC',
      channel: 'Horeca Trade',
      area: 'Dadar',
      region: 'Mumbai'
    },
    {
      id: 7,
      actions: '',
      active: true,
      routeName: 'Kasthuri West Route',
      routeCode: '#01 MUM-ICIC',
      channel: 'General Trade',
      area: 'Andheri West',
      region: 'Mumbai'
    },
    {
      id: 8,
      actions: '',
      active: true,
      routeName: 'Kurla Route',
      routeCode: '#01 MUM-ICIC',
      channel: 'General Trade',
      area: 'Kurla',
      region: 'Mumbai'
    },
    {
      id: 9,
      actions: '',
      active: true,
      routeName: 'Kasthuri West Route',
      routeCode: '#01 MUM-ICIC',
      channel: 'Modern Trade',
      area: 'Malad West',
      region: 'Mumbai'
    },
    {
      id: 10,
      actions: '',
      active: true,
      routeName: 'Kurla Route',
      routeCode: '#01 MUM-ICIC',
      channel: 'Horeca Trade',
      area: 'Kurla',
      region: 'Mumbai'
    }
  ];

  onBulkUpload(): void {
    console.log('Bulk Upload clicked');
  }

  onExcel(): void {
    console.log('Excel clicked');
  }

  onAdd(): void {
    this.currentStep = 1;
    this.isAddModalOpen = true;
  }

  closeAddModal(): void {
    this.isAddModalOpen = false;
    this.currentStep = 1;
  }

  getModalTitle(): string {
    switch (this.currentStep) {
      case 1:
        return 'Add Route — Step 1: Basic Route Adding Info';
      case 2:
        return 'Add Route — Step 2: Additional Route Details';
      case 3:
        return 'Add Route — Step 3: Route Configuration';
      default:
        return 'Add Route';
    }
  }

  onSaveStep1(formData: any): void {
    console.log('Save step 1:', formData);
    // For now, just close the modal after step 1
    // In a full implementation, you would move to step 2
    this.isAddModalOpen = false;
    this.currentStep = 1;
  }

  onFilter(): void {
    console.log('Filter clicked');
  }

  onEdit(route: Route): void {
    console.log('Edit route:', route);
     this.currentStep = 1;
    this.isAddModalOpen = true;
  }

  onDelete(route: Route): void {
    if (confirm(`Are you sure you want to delete "${route.routeName}"?`)) {
      // Remove the route from the list
      this.routes = this.routes.filter(r => r.id !== route.id);
      console.log('Route deleted:', route);
    } else {
      console.log('Delete cancelled');
    }
  }

  onView(route: Route): void {
    console.log('View route:', route);
  }

  onViewDetails(route: Route): void {
    console.log('View details:', route);
  }

  toggleActive(route: Route): void {
    route.active = !route.active;
  }
}
