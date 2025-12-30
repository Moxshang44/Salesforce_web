import { Component, Output, EventEmitter, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ButtonComponent } from '../../../../shared/components/button/button.component';

interface PricingLevel {
  level: string;
  priceType: string;
  margin: string;
  purchasePrice: string;
  sellingPrice: string;
}

interface RegionPricing {
  id: string;
  labelRuleName: string;
  mrp: string;
  stockistPercent: string;
  distributorPercent: string;
  retailerPercent: string;
}

interface Step3FormData {
  mrp: string;
  gstPercent: string;
  gstCategory: string;
  pricingLevels: PricingLevel[];
  superStockistMOQ: string;
  distributorMOQ: string;
  retailerMOQ: string;
  enableRegionPricing: boolean;
  regionPricings: RegionPricing[];
}

@Component({
  selector: 'app-product-form-step3',
  standalone: true,
  imports: [CommonModule, FormsModule, ButtonComponent],
  templateUrl: './product-form-step3.component.html',
  styleUrl: './product-form-step3.component.scss'
})
export class ProductFormStep3Component {
  @Input() formData: Step3FormData = {
    mrp: '1000',
    gstPercent: '18%',
    gstCategory: 'Food',
    pricingLevels: [
      { level: 'Super Stockiest', priceType: 'Markdown', margin: '0', purchasePrice: '650', sellingPrice: '850' },
      { level: 'Distributor', priceType: 'Markdown', margin: '0', purchasePrice: '850', sellingPrice: '750' },
      { level: 'Retailer', priceType: 'Markup', margin: '15', purchasePrice: '750', sellingPrice: '1000' }
    ],
    superStockistMOQ: '1000',
    distributorMOQ: '500',
    retailerMOQ: '100',
    enableRegionPricing: true,
    regionPricings: [
      {
        id: '1',
        labelRuleName: 'North Zone Pricing',
        mrp: '10,000',
        stockistPercent: '8%',
        distributorPercent: '12%',
        retailerPercent: '16%'
      }
    ]
  };

  @Output() save = new EventEmitter<Step3FormData>();
  @Output() previous = new EventEmitter<void>();

  gstPercentages = ['0%', '5%', '12%', '18%', '28%'];
  gstCategories = ['Food', 'Beverages', 'Pharmaceuticals', 'Consumer Goods', 'Electronics'];
  priceTypes = ['Markdown', 'Markup'];

  addRegionPricing() {
    this.formData.regionPricings.push({
      id: Date.now().toString(),
      labelRuleName: '',
      mrp: '',
      stockistPercent: '',
      distributorPercent: '',
      retailerPercent: ''
    });
  }

  removeRegionPricing(index: number) {
    this.formData.regionPricings.splice(index, 1);
  }

  onSave() {
    this.save.emit(this.formData);
  }

  onPrevious() {
    this.previous.emit();
  }
}
