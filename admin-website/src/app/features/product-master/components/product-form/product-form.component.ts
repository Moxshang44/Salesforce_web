import { Component, Output, EventEmitter, Input, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { ButtonComponent } from '../../../../shared/components/button/button.component';
import { ApiService } from '../../../../core/services/api.service';

export interface ProductFormStep1Data {
  brand_id: number | null;
  brand_category_id: number | null;
  brand_subcategory_id: number | null;
  name: string;
  code: string;
  gst_category: string;
  gst_rate: number | null;
  description: string | null;
  barcode: string | null;
  hsn_code: string | null;
}

interface Brand {
  id: number;
  name: string;
  code: string;
}

interface Category {
  id: number;
  name: string;
  code: string;
}

@Component({
  selector: 'app-product-form',
  standalone: true,
  imports: [CommonModule, FormsModule, ButtonComponent],
  templateUrl: './product-form.component.html',
  styleUrl: './product-form.component.scss'
})
export class ProductFormComponent implements OnInit, OnChanges {
  @Input() selectedCompanyId: string = '';
  @Input() productData: any = null; // Product data for editing
  @Input() isEditMode: boolean = false; // Flag to indicate edit mode
  @Output() save = new EventEmitter<ProductFormStep1Data>();
  @Output() cancel = new EventEmitter<void>();

  formData: ProductFormStep1Data = {
    brand_id: null,
    brand_category_id: null,
    brand_subcategory_id: null,
    name: '',
    code: '',
    gst_category: '',
    gst_rate: null,
    description: null,
    barcode: null,
    hsn_code: null
  };

  brands: Brand[] = [];
  categories: Category[] = [];
  
  // Keep subcategories as static for now (not in API spec)
  subcategories: Array<{id: number, name: string}> = [
    { id: 1, name: 'Subcategory 1' },
    { id: 2, name: 'Subcategory 2' },
    { id: 3, name: 'Subcategory 3' }
  ];

  isLoadingBrands = false;
  isLoadingCategories = false;
  brandsError = '';
  categoriesError = '';

  constructor(
    private http: HttpClient,
    private apiService: ApiService
  ) {}

  ngOnInit(): void {
    if (this.selectedCompanyId) {
      this.loadBrands();
      this.loadCategories();
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['selectedCompanyId'] && this.selectedCompanyId) {
      this.loadBrands();
      this.loadCategories();
    }
    if (changes['productData'] && this.isEditMode && this.productData) {
      this.populateFormForEdit();
    }
  }

  loadBrands(): void {
    if (!this.selectedCompanyId) {
      return;
    }

    this.isLoadingBrands = true;
    this.brandsError = '';
    
    const url = this.apiService.getApiUrl(`companies/${this.selectedCompanyId}/brands`);
    const headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });
    const params = new HttpParams()
      .set('is_active', 'true')
      .set('limit', '100')
      .set('offset', '0');

    this.http.get<any>(url, { headers, params }).subscribe({
      next: (response) => {
        this.isLoadingBrands = false;
        
        if (response.data && Array.isArray(response.data)) {
          this.brands = response.data.map((brand: any) => ({
            id: brand.id,
            name: brand.name,
            code: brand.code
          }));
        } else {
          this.brands = [];
        }
      },
      error: (error) => {
        this.isLoadingBrands = false;
        console.error('Error loading brands:', error);
        this.brandsError = 'Failed to load brands';
        this.brands = [];
      }
    });
  }

  loadCategories(): void {
    if (!this.selectedCompanyId) {
      return;
    }

    this.isLoadingCategories = true;
    this.categoriesError = '';
    
    const url = this.apiService.getApiUrl(`companies/${this.selectedCompanyId}/brand-categories`);
    const headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });

    this.http.get<any>(url, { headers }).subscribe({
      next: (response) => {
        this.isLoadingCategories = false;
        
        if (response.data && Array.isArray(response.data)) {
          this.categories = response.data.map((category: any) => ({
            id: category.id,
            name: category.name,
            code: category.code
          }));
        } else {
          this.categories = [];
        }
      },
      error: (error) => {
        this.isLoadingCategories = false;
        console.error('Error loading categories:', error);
        this.categoriesError = 'Failed to load categories';
        this.categories = [];
      }
    });
  }

  onBrandChange(): void {
    // Reset category when brand changes (optional - implement if needed)
    // this.formData.brand_category_id = null;
    this.clearError('brand_id');
  }

  onCategoryChange(): void {
    this.clearError('brand_category_id');
  }

  gstCategories = ['GST_5', 'GST_12', 'GST_18', 'GST_28'];
  gstRates = [0, 5, 12, 18, 28];

  errors: { [key: string]: string } = {};

  onSave() {
    this.errors = {};
    let hasErrors = false;

    if (!this.formData.brand_id) {
      this.errors['brand_id'] = 'Brand is required';
      hasErrors = true;
    }

    if (!this.formData.brand_category_id) {
      this.errors['brand_category_id'] = 'Category is required';
      hasErrors = true;
    }

    if (!this.formData.name || this.formData.name.trim() === '') {
      this.errors['name'] = 'Product name is required';
      hasErrors = true;
    }

    if (!this.formData.code || this.formData.code.trim() === '') {
      this.errors['code'] = 'Product code is required';
      hasErrors = true;
    }

    if (!this.formData.gst_category || this.formData.gst_category.trim() === '') {
      this.errors['gst_category'] = 'GST category is required';
      hasErrors = true;
    }

    if (this.formData.gst_rate === null || this.formData.gst_rate === undefined) {
      this.errors['gst_rate'] = 'GST rate is required';
      hasErrors = true;
    }

    if (hasErrors) {
      setTimeout(() => {
        const firstError = document.querySelector('.error');
        if (firstError) {
          firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 100);
      return;
    }

    this.save.emit(this.formData);
  }

  clearError(field: string): void {
    if (this.errors[field]) {
      delete this.errors[field];
    }
  }

  onCancel() {
    this.cancel.emit();
  }

  populateFormForEdit(): void {
    if (!this.productData) {
      return;
    }

    this.formData = {
      brand_id: this.productData.brand_id || null,
      brand_category_id: this.productData.brand_category_id || null,
      brand_subcategory_id: this.productData.brand_subcategory_id || null,
      name: this.productData.name || '',
      code: this.productData.code || '',
      gst_category: this.productData.gst_category || '',
      gst_rate: this.productData.gst_rate !== null && this.productData.gst_rate !== undefined ? this.productData.gst_rate : null,
      description: this.productData.description || null,
      barcode: this.productData.barcode || null,
      hsn_code: this.productData.hsn_code || null
    };
  }
}
