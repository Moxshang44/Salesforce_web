import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface Route {
  id: number;
  name: string;
  isAssigned: boolean;
}

interface DistributorFormStep3Data {
  selectedCountry: string;
  selectedZone: string;
  selectedRegion: string;
  selectedArea: string;
  selectedDivision: string;
  assignedRoutes: number[];
}

@Component({
  selector: 'app-distributor-form-step3',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './distributor-form-step3.component.html',
  styleUrl: './distributor-form-step3.component.scss'
})
export class DistributorFormStep3Component {
  @Output() save = new EventEmitter<DistributorFormStep3Data>();
  @Output() previous = new EventEmitter<void>();

  formData: DistributorFormStep3Data = {
    selectedCountry: 'India',
    selectedZone: '1 Selected',
    selectedRegion: '1 Selected',
    selectedArea: 'India',
    selectedDivision: '1 Selected',
    assignedRoutes: [1, 2, 3, 4, 5]
  };

  countryOptions = ['India', 'USA', 'UK', 'Germany', 'Japan'];
  zoneOptions = ['1 Selected', 'Zone 1', 'Zone 2', 'Zone 3'];
  regionOptions = ['1 Selected', 'Region 1', 'Region 2', 'Region 3'];
  areaOptions = ['India', 'Area 1', 'Area 2', 'Area 3'];
  divisionOptions = ['1 Selected', 'Division 1', 'Division 2', 'Division 3'];

  assignedRoutes: Route[] = [
    { id: 1, name: 'Andheri Route', isAssigned: true },
    { id: 2, name: 'Lower Parel Route', isAssigned: true },
    { id: 3, name: 'Bandra Route', isAssigned: true },
    { id: 4, name: 'Goregaon Route', isAssigned: true },
    { id: 5, name: 'Kandivali Route', isAssigned: true }
  ];

  availableRoutes: Route[] = [
    { id: 6, name: 'Andheri Route', isAssigned: false },
    { id: 7, name: 'Lower Parel Route', isAssigned: false },
    { id: 8, name: 'Bandra Route', isAssigned: false },
    { id: 9, name: 'Goregaon Route', isAssigned: false },
    { id: 10, name: 'Kandivali Route', isAssigned: false }
  ];

  assignedCurrentPage = 1;
  assignedTotalPages = 2;
  availableCurrentPage = 1;
  availableTotalPages = 2;

  unassignRoute(route: Route): void {
    const index = this.assignedRoutes.findIndex(r => r.id === route.id);
    if (index > -1) {
      this.assignedRoutes.splice(index, 1);
      this.availableRoutes.push({ ...route, isAssigned: false });
      this.formData.assignedRoutes = this.assignedRoutes.map(r => r.id);
    }
  }

  assignRoute(route: Route): void {
    const index = this.availableRoutes.findIndex(r => r.id === route.id);
    if (index > -1) {
      this.availableRoutes.splice(index, 1);
      this.assignedRoutes.push({ ...route, isAssigned: true });
      this.formData.assignedRoutes = this.assignedRoutes.map(r => r.id);
    }
  }

  onSave(): void {
    this.save.emit(this.formData);
  }

  onPrevious(): void {
    this.previous.emit();
  }
}
