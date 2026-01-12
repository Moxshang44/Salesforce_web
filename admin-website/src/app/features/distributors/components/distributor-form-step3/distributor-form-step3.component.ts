import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface Route {
  id: number;
  name: string;
  isAssigned: boolean;
}

interface DistributorFormStep3Data {
  route_ids: string[];
}

@Component({
  selector: 'app-distributor-form-step3',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './distributor-form-step3.component.html',
  styleUrl: './distributor-form-step3.component.scss'
})
export class DistributorFormStep3Component {
  @Input() step1Data: any = null;
  @Input() step2Data: any = null;
  @Output() save = new EventEmitter<DistributorFormStep3Data>();
  @Output() previous = new EventEmitter<void>();

  formData: DistributorFormStep3Data = {
    route_ids: []
  };

  assignedRoutes: Route[] = [];
  availableRoutes: Route[] = [
    { id: 1, name: 'Andheri Route', isAssigned: false },
    { id: 2, name: 'Lower Parel Route', isAssigned: false },
    { id: 3, name: 'Bandra Route', isAssigned: false },
    { id: 4, name: 'Goregaon Route', isAssigned: false },
    { id: 5, name: 'Kandivali Route', isAssigned: false },
    { id: 6, name: 'Malad Route', isAssigned: false },
    { id: 7, name: 'Borivali Route', isAssigned: false },
    { id: 8, name: 'Dadar Route', isAssigned: false }
  ];

  assignedCurrentPage = 1;
  assignedTotalPages = 1;
  availableCurrentPage = 1;
  availableTotalPages = 1;

  unassignRoute(route: Route): void {
    const index = this.assignedRoutes.findIndex(r => r.id === route.id);
    if (index > -1) {
      this.assignedRoutes.splice(index, 1);
      this.availableRoutes.push({ ...route, isAssigned: false });
      this.updateRouteIds();
    }
  }

  assignRoute(route: Route): void {
    const index = this.availableRoutes.findIndex(r => r.id === route.id);
    if (index > -1) {
      this.availableRoutes.splice(index, 1);
      this.assignedRoutes.push({ ...route, isAssigned: true });
      this.updateRouteIds();
    }
  }

  private updateRouteIds(): void {
    this.formData.route_ids = this.assignedRoutes.map(r => r.id.toString());
  }

  onSave(): void {
    // Route IDs are optional, can be empty array
    this.updateRouteIds();
    this.save.emit(this.formData);
  }

  onPrevious(): void {
    this.previous.emit();
  }
}
