import { Component, Output, EventEmitter, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ButtonComponent } from '../../../../shared/components/button/button.component';

interface Step4FormData {
  selectCountry: string[];
  selectZone: string[];
  selectAreas: string[];
  channelVisibility: {
    generalTrade: boolean;
    modernTrade: boolean;
    horeca: boolean;
    typeA: boolean;
    typeB: boolean;
    typeC: boolean;
  };
  retailerTypeVisibility: string[];
}

@Component({
  selector: 'app-product-form-step4',
  standalone: true,
  imports: [CommonModule, FormsModule, ButtonComponent],
  templateUrl: './product-form-step4.component.html',
  styleUrl: './product-form-step4.component.scss'
})
export class ProductFormStep4Component {
  @Input() formData: Step4FormData = {
    selectCountry: ['2 Selected'],
    selectZone: ['All Selected'],
    selectAreas: ['Select Areas'],
    channelVisibility: {
      generalTrade: true,
      modernTrade: true,
      horeca: true,
      typeA: true,
      typeB: true,
      typeC: true
    },
    retailerTypeVisibility: []
  };

  @Output() save = new EventEmitter<Step4FormData>();
  @Output() previous = new EventEmitter<void>();

  countries = ['India', 'USA', 'UK', 'Canada', 'Australia'];
  zones = ['North Zone', 'South Zone', 'East Zone', 'West Zone', 'Central Zone'];
  areas = ['Area 1', 'Area 2', 'Area 3', 'Area 4', 'Area 5'];

  onSave() {
    this.save.emit(this.formData);
  }

  onPrevious() {
    this.previous.emit();
  }
}

