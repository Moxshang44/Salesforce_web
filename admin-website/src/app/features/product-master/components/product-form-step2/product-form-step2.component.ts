import { Component, Output, EventEmitter, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ButtonComponent } from '../../../../shared/components/button/button.component';

interface UDMItem {
  level: number;
  parentUOM: string;
  uomName: string;
  contains: string;
  totalBaseUnit: number;
  default: boolean;
  action: string;
}

interface Step2FormData {
  packagingType: string;
  netWeight: string;
  weightUnit: string;
  measureType: string;
  grossWeight: string;
  grossWeightUnit: string;
  shelfLife: string;
  shelfLifeUnit: string;
  selectParentUOM: string;
  uomName: string;
  quantity: string;
  price: string;
  udmItems: UDMItem[];
}

@Component({
  selector: 'app-product-form-step2',
  standalone: true,
  imports: [CommonModule, FormsModule, ButtonComponent],
  templateUrl: './product-form-step2.component.html',
  styleUrl: './product-form-step2.component.scss'
})
export class ProductFormStep2Component {
  @Input() formData: Step2FormData = {
    packagingType: 'Packet',
    netWeight: '600',
    weightUnit: 'g',
    measureType: 'Weight',
    grossWeight: '860',
    grossWeightUnit: 'g',
    shelfLife: '',
    shelfLifeUnit: 'Select Units',
    selectParentUOM: 'Packet',
    uomName: 'Box',
    quantity: '',
    price: '480',
    udmItems: [
      { level: 1, parentUOM: 'Packet', uomName: '', contains: '', totalBaseUnit: 0, default: true, action: '' },
      { level: 2, parentUOM: 'Box', uomName: '24 Packets', contains: '50', totalBaseUnit: 0, default: false, action: '' },
      { level: 3, parentUOM: 'Container', uomName: '700 Boxes', contains: '16000', totalBaseUnit: 0, default: false, action: '' }
    ]
  };

  @Output() save = new EventEmitter<Step2FormData>();
  @Output() previous = new EventEmitter<void>();

  packagingTypes = ['Packet', 'Box', 'Container', 'Bottle', 'Jar', 'Pouch'];
  measureTypes = ['Weight', 'Volume', 'Count'];
  weightUnits = ['g', 'kg', 'mg', 'oz', 'lb'];
  shelfLifeUnits = ['Select Units', 'Days', 'Months', 'Years'];

  addUDMItem() {
    this.formData.udmItems.push({
      level: this.formData.udmItems.length + 1,
      parentUOM: '',
      uomName: '',
      contains: '',
      totalBaseUnit: 0,
      default: false,
      action: ''
    });
  }

  removeUDMItem(index: number) {
    this.formData.udmItems.splice(index, 1);
    // Re-number levels
    this.formData.udmItems.forEach((item, i) => {
      item.level = i + 1;
    });
  }

  onSaveAndNext() {
    this.save.emit(this.formData);
  }

  onPrevious() {
    this.previous.emit();
  }
}

