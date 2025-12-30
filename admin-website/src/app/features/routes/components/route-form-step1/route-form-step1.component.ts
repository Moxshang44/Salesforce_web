import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface RouteFormData {
  routeName: string;
  routeCode: string;
  selectedCountry: string;
  selectedZone: string;
  selectedRegion: string;
  selectedArea: string;
  selectedDistributor: string;
  channelType: string;
  newCountry: string;
  newZone: string;
  newRegion: string;
  newArea: string;
}

@Component({
  selector: 'app-route-form-step1',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './route-form-step1.component.html',
  styleUrl: './route-form-step1.component.scss'
})
export class RouteFormStep1Component {
  @Output() save = new EventEmitter<RouteFormData>();
  @Output() cancel = new EventEmitter<void>();

  formData: RouteFormData = {
    routeName: '',
    routeCode: '',
    selectedCountry: 'India',
    selectedZone: 'North-East',
    selectedRegion: '',
    selectedArea: '',
    selectedDistributor: '',
    channelType: 'General Trade',
    newCountry: '',
    newZone: '',
    newRegion: '',
    newArea: ''
  };

  // Dropdown options
  countryOptions = ['India', 'USA', 'UK', 'Germany', 'Japan', 'China', 'Australia', 'Canada'];
  zoneOptions = ['North', 'South', 'East', 'West', 'North-East', 'Central'];
  regionOptions = ['Region 1', 'Region 2', 'Region 3', 'Region 4'];
  areaOptions = ['Area A', 'Area B', 'Area C', 'Area D'];
  distributorOptions = ['Distributor 1', 'Distributor 2', 'Distributor 3'];

  // Auto-generate route code
  generateRouteCode(): void {
    if (this.formData.routeName) {
      const prefix = this.formData.routeName.substring(0, 2).toUpperCase();
      const suffix = Math.random().toString(36).substring(2, 8).toUpperCase();
      this.formData.routeCode = `RT-${prefix}-${suffix}`;
    }
  }

  // Add new options
  addCountry(): void {
    if (this.formData.newCountry && !this.countryOptions.includes(this.formData.newCountry)) {
      this.countryOptions.push(this.formData.newCountry);
      this.formData.selectedCountry = this.formData.newCountry;
      this.formData.newCountry = '';
    }
  }

  addZone(): void {
    if (this.formData.newZone && !this.zoneOptions.includes(this.formData.newZone)) {
      this.zoneOptions.push(this.formData.newZone);
      this.formData.selectedZone = this.formData.newZone;
      this.formData.newZone = '';
    }
  }

  addRegion(): void {
    if (this.formData.newRegion && !this.regionOptions.includes(this.formData.newRegion)) {
      this.regionOptions.push(this.formData.newRegion);
      this.formData.selectedRegion = this.formData.newRegion;
      this.formData.newRegion = '';
    }
  }

  addArea(): void {
    if (this.formData.newArea && !this.areaOptions.includes(this.formData.newArea)) {
      this.areaOptions.push(this.formData.newArea);
      this.formData.selectedArea = this.formData.newArea;
      this.formData.newArea = '';
    }
  }

  onSaveAndNext(): void {
    // Basic validation
    if (!this.formData.routeName) {
      alert('Please enter route name');
      return;
    }
    if (!this.formData.routeCode) {
      alert('Please enter route code');
      return;
    }
    this.save.emit(this.formData);
  }

  onCancel(): void {
    this.cancel.emit();
  }
}
