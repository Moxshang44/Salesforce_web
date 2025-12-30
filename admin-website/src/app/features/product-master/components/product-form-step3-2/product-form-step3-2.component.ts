import { Component, Output, EventEmitter, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ButtonComponent } from '../../../../shared/components/button/button.component';

interface TerritoryPricing {
  id: string;
  label: string;
  selectedCountries: string[];
  selectedZones: string[];
  selectedRegions: string[];
  mrp: string;
  levels: {
    superStockist: { margin: string; purchasePrice: string; sellingPrice: string; };
    distributor: { margin: string; purchasePrice: string; sellingPrice: string; };
    retailer: { margin: string; purchasePrice: string; sellingPrice: string; };
  };
}

interface Step3_2FormData {
  territoryPricings: TerritoryPricing[];
}

@Component({
  selector: 'app-product-form-step3-2',
  standalone: true,
  imports: [CommonModule, FormsModule, ButtonComponent],
  templateUrl: './product-form-step3-2.component.html',
  styleUrl: './product-form-step3-2.component.scss'
})
export class ProductFormStep3_2Component {
  @Input() formData: Step3_2FormData = {
    territoryPricings: [
      {
        id: '1',
        label: 'North Zone Pricing',
        selectedCountries: ['2 Selected'],
        selectedZones: ['All Selected'],
        selectedRegions: ['All Selected'],
        mrp: '1000',
        levels: {
          superStockist: { margin: '10', purchasePrice: '400', sellingPrice: '650' },
          distributor: { margin: '8', purchasePrice: '650', sellingPrice: '750' },
          retailer: { margin: '25', purchasePrice: '750', sellingPrice: '1000' }
        }
      }
    ]
  };

  @Output() save = new EventEmitter<Step3_2FormData>();
  @Output() previous = new EventEmitter<void>();

  countries = ['India', 'USA', 'UK', 'Canada', 'Australia'];
  zones = ['North Zone', 'South Zone', 'East Zone', 'West Zone', 'Central Zone'];
  regions = ['Region 1', 'Region 2', 'Region 3', 'Region 4', 'Region 5'];
  priceTypes = ['Markdown', 'Markup'];

  addTerritoryPricing() {
    this.formData.territoryPricings.push({
      id: Date.now().toString(),
      label: '',
      selectedCountries: [],
      selectedZones: [],
      selectedRegions: [],
      mrp: '',
      levels: {
        superStockist: { margin: '', purchasePrice: '', sellingPrice: '' },
        distributor: { margin: '', purchasePrice: '', sellingPrice: '' },
        retailer: { margin: '', purchasePrice: '', sellingPrice: '' }
      }
    });
  }

  removeTerritoryPricing(index: number) {
    this.formData.territoryPricings.splice(index, 1);
  }

  onSave() {
    this.save.emit(this.formData);
  }

  onPrevious() {
    this.previous.emit();
  }
}

