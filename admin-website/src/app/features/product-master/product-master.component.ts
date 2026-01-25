import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { SidebarComponent } from '../../core/layout/sidebar/sidebar.component';
import { HeaderComponent } from '../../core/layout/header/header.component';
import { ButtonComponent } from '../../shared/components/button/button.component';
import { ModalComponent } from '../../shared/components/modal/modal.component';
import { ProductFormComponent, ProductFormStep1Data } from './components/product-form/product-form.component';
import { ProductFormStep2Component, ProductFormStep2Data } from './components/product-form-step2/product-form-step2.component';
import { ProductFormStep3Component, ProductFormStep3Data } from './components/product-form-step3/product-form-step3.component';
import { ProductFormStep4Component, ProductFormStep4Data } from './components/product-form-step4/product-form-step4.component';
import { AuthService } from '../../core/services/auth.service';
import { ApiService } from '../../core/services/api.service';

interface Product {
  id: string;
  brand: string;
  typeCode: string;
  name: string;
  category: string;
  subcategory: string;
  active: boolean;
}

interface Company {
  id: string;
  name: string;
}

@Component({
  selector: 'app-product-master',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    SidebarComponent, 
    HeaderComponent, 
    ButtonComponent, 
    ModalComponent, 
    ProductFormComponent, 
    ProductFormStep2Component, 
    ProductFormStep3Component, 
    ProductFormStep4Component
  ],
  templateUrl: './product-master.component.html',
  styleUrl: './product-master.component.scss'
})
export class ProductMasterComponent implements OnInit {
  currentPage = 1;
  totalPages = 2;
  isAddModalOpen = false;
  currentStep: number = 1; // Always start at step 1 (no company selection needed)
  
  // Form data storage
  step1Data: ProductFormStep1Data | null = null;
  step2Data: ProductFormStep2Data | null = null;
  step3Data: ProductFormStep3Data | null = null;
  step4Data: ProductFormStep4Data | null = null;

  // Company selection - using logged-in company
  selectedCompanyId: string = '';
  isLoadingProduct = false;
  
  // Loading state
  isLoadingProducts = false;
  productsError = '';
  
  // Products data
  products: Product[] = [];
  recordsPerPage = 20;
  totalCount = 0;

  // View product
  isViewModalOpen = false;
  viewingProduct: any = null;
  viewErrorMessage = '';
  isLoadingView = false;

  // Edit product
  editingProductId: string | null = null;
  isEditMode = false;
  productDataForEdit: any = null;

  constructor(
    private http: HttpClient,
    private authService: AuthService,
    private apiService: ApiService
  ) {}

  ngOnInit(): void {
    // Get logged-in company from AuthService
    const companyInfo = this.authService.getCompanyInfo();
    if (companyInfo && companyInfo.company_id) {
      this.selectedCompanyId = companyInfo.company_id;
      this.loadProducts();
    } else {
      console.error('No company information found. Please login again.');
      this.productsError = 'No company information found. Please login again.';
    }
  }

  loadProducts(page: number = 1): void {
    if (!this.selectedCompanyId) {
      this.productsError = 'Please select a company first.';
      return;
    }

    this.isLoadingProducts = true;
    this.productsError = '';
    const url = this.apiService.getApiUrl(`companies/${this.selectedCompanyId}/products`);
    const headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });

    // Calculate offset from page number
    const offset = (page - 1) * this.recordsPerPage;
    const params = new HttpParams()
      .set('limit', this.recordsPerPage.toString())
      .set('offset', offset.toString());

    this.http.get<any>(url, { headers, params }).subscribe({
      next: (response) => {
        this.isLoadingProducts = false;
        console.log('Products API response:', response);
        
        // Handle response format
        let productsData: any[] = [];
        if (response.data && Array.isArray(response.data)) {
          productsData = response.data;
        } else if (Array.isArray(response)) {
          productsData = response;
        }

        // Map to Product interface
        this.products = productsData.map((product: any) => {
          return {
            id: product.id?.toString() || '',
            brand: product.brand_name || product.brand || 'N/A',
            typeCode: product.code || product.type_code || '#N/A',
            name: product.name || 'N/A',
            category: product.category_name || product.category || 'N/A',
            subcategory: product.subcategory_name || product.subcategory || '',
            active: product.is_active !== undefined ? product.is_active : true
          };
        });

        // Update pagination
        if (response.total_count !== undefined) {
          this.totalCount = response.total_count;
          this.totalPages = Math.ceil(this.totalCount / this.recordsPerPage);
        } else if (response.records_per_page && response.total_count) {
          this.totalCount = response.total_count;
          this.totalPages = Math.ceil(this.totalCount / response.records_per_page);
        } else {
          // Fallback: use products length
          this.totalCount = this.products.length;
          this.totalPages = Math.max(1, Math.ceil(this.totalCount / this.recordsPerPage));
        }

        this.currentPage = page;
      },
      error: (error) => {
        this.isLoadingProducts = false;
        console.error('Error loading products:', error);
        
        if (error.error) {
          if (error.error.message) {
            this.productsError = error.error.message;
          } else if (error.error.detail) {
            this.productsError = error.error.detail;
          } else if (typeof error.error === 'string') {
            this.productsError = error.error;
          } else {
            this.productsError = 'Failed to load products. Please try again.';
          }
        } else {
          this.productsError = `Failed to load products. Status: ${error.status || 'Unknown'}.`;
        }
        
        this.products = [];
      }
    });
  }

  onEdit(product: Product): void {
    if (!product.id) {
      alert('Product ID is missing. Cannot edit product.');
      return;
    }

    this.editingProductId = product.id;
    this.isEditMode = true;
    
    // Use logged-in company ID
    const companyInfo = this.authService.getCompanyInfo();
    const companyId = companyInfo?.company_id || this.selectedCompanyId || '';
    
    if (!companyId) {
      alert('No company information found. Please login again.');
      return;
    }

    // Reset form data
    this.step1Data = null;
    this.step2Data = null;
    this.step3Data = null;
    this.step4Data = null;
    this.currentStep = 1;
    this.isAddModalOpen = true;

    this.loadProductForEdit(product.id, companyId);
  }

  loadProductForEdit(productId: string, companyId: string): void {
    const url = this.apiService.getApiUrl(`companies/${companyId}/products/${productId}`);
    const headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });

    this.http.get<any>(url, { headers }).subscribe({
      next: (response) => {
        const productData = response.data || response;
        this.productDataForEdit = productData;
        this.selectedCompanyId = companyId;
        this.currentStep = 1;
        
        // Populate form data from API response
        this.populateFormDataFromProduct(productData);
      },
      error: (error) => {
        console.error('Error loading product for edit:', error);
        alert('Failed to load product details. Please try again.');
        this.isAddModalOpen = false;
        this.isEditMode = false;
        this.editingProductId = null;
      }
    });
  }

  populateFormDataFromProduct(productData: any): void {
    // Populate Step 1 data
    this.step1Data = {
      brand_id: productData.brand_id || null,
      brand_category_id: productData.brand_category_id || null,
      brand_subcategory_id: productData.brand_subcategory_id || null,
      name: productData.name || '',
      code: productData.code || '',
      gst_category: productData.gst_category || '',
      gst_rate: productData.gst_rate !== null && productData.gst_rate !== undefined ? productData.gst_rate : null,
      description: productData.description || null,
      barcode: productData.barcode || null,
      hsn_code: productData.hsn_code || null
    };

    // Populate Step 2 data
    if (productData.packaging_type || productData.packaging_details || productData.dimensions || productData.measurement_details || productData.compliance) {
      this.step2Data = {
        packaging_type: productData.packaging_type || '',
        packaging_details: productData.packaging_details ? [...productData.packaging_details] : [],
        dimensions: productData.dimensions ? { ...productData.dimensions } : null,
        measurement_details: productData.measurement_details ? { ...productData.measurement_details } : null,
        compliance: productData.compliance || null
      };
    }

    // Populate Step 3 data
    if (productData.prices && productData.prices.length > 0) {
      this.step3Data = {
        prices: productData.prices.map((price: any) => ({
          area_id: price.area_id || null,
          mrp: price.mrp || 0,
          margins: price.margins ? {
            super_stockist: {
              type: price.margins.super_stockist?.type || 'MARKUP',
              value: price.margins.super_stockist?.value || 0
            },
            distributor: {
              type: price.margins.distributor?.type || 'MARKUP',
              value: price.margins.distributor?.value || 0
            },
            retailer: {
              type: price.margins.retailer?.type || 'MARKUP',
              value: price.margins.retailer?.value || 0
            }
          } : null,
          min_order_quantity: price.min_order_quantity ? { ...price.min_order_quantity } : null
        }))
      };
    }

    // Populate Step 4 data
    if (productData.visibility || productData.images) {
      this.step4Data = {
        visibility: productData.visibility ? [...productData.visibility] : [],
        images: productData.images ? [...productData.images] : []
      };
    }
  }

  onView(product: Product): void {
    if (!product.id) {
      alert('Product ID is missing. Cannot view details.');
      return;
    }

    // Use logged-in company ID
    const companyInfo = this.authService.getCompanyInfo();
    const companyId = companyInfo?.company_id || this.selectedCompanyId || '';
    
    if (!companyId) {
      alert('No company information found. Please login again.');
      return;
    }

    this.viewingProduct = null;
    this.viewErrorMessage = '';
    this.isViewModalOpen = true;
    this.isLoadingView = true;

    this.loadProductForView(product.id, companyId);
  }

  loadProductForView(productId: string, companyId: string): void {
    const viewUrl = this.apiService.getApiUrl(`companies/${companyId}/products/${productId}`);
    const headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });

    console.log('Fetching product details:', productId);
    console.log('View URL:', viewUrl);

    this.http.get<any>(viewUrl, { headers }).subscribe({
      next: (response: any) => {
        console.log('View success response:', response);
        this.isLoadingView = false;
        // Handle different response formats
        if (response.data) {
          this.viewingProduct = response.data;
        } else {
          this.viewingProduct = response;
        }
      },
      error: (error: any) => {
        console.error('Error fetching product details:', error);
        console.error('Error status:', error.status);
        console.error('Error body:', error.error);
        
        this.isLoadingView = false;
        if (error.error) {
          if (error.error.message) {
            this.viewErrorMessage = error.error.message;
          } else if (error.error.detail) {
            this.viewErrorMessage = error.error.detail;
          } else if (typeof error.error === 'string') {
            this.viewErrorMessage = error.error;
          } else {
            this.viewErrorMessage = JSON.stringify(error.error);
          }
        } else if (error.message) {
          this.viewErrorMessage = error.message;
        } else {
          this.viewErrorMessage = `Failed to load product details. Status: ${error.status || 'Unknown'}. Please check the console for more details.`;
        }
      }
    });
  }

  closeViewModal(): void {
    this.isViewModalOpen = false;
    this.viewingProduct = null;
    this.viewErrorMessage = '';
    this.isLoadingView = false;
  }

  onDelete(product: Product): void {
    if (confirm(`Are you sure you want to delete product "${product.name}"? This action cannot be undone.`)) {
      if (!product.id) {
        alert('Product ID is missing. Cannot delete.');
        return;
      }

      // Use logged-in company ID
      const companyInfo = this.authService.getCompanyInfo();
      const companyId = companyInfo?.company_id || this.selectedCompanyId || '';
      
      if (!companyId) {
        alert('No company information found. Please login again.');
        return;
      }

      this.deleteProduct(product, companyId);
    }
  }

  deleteProduct(product: Product, companyId: string): void {
    const deleteUrl = this.apiService.getApiUrl(`companies/${companyId}/products/${product.id}`);
    const headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });

    console.log('Deleting product:', product.name);
    console.log('Delete URL:', deleteUrl);

    this.http.delete(deleteUrl, { headers }).subscribe({
      next: (response: any) => {
        console.log('Delete success response:', response);
        alert(`Product "${product.name}" deleted successfully!`);
        // Reload products list
        this.loadProducts(this.currentPage);
      },
      error: (error: any) => {
        console.error('Error deleting product:', error);
        console.error('Error status:', error.status);
        console.error('Error body:', error.error);
        
        let errorMessage = 'Failed to delete product. Please try again.';
        if (error.error) {
          if (error.error.message) {
            errorMessage = error.error.message;
          } else if (error.error.detail) {
            errorMessage = error.error.detail;
          } else if (typeof error.error === 'string') {
            errorMessage = error.error;
          } else if (error.error.errors && Array.isArray(error.error.errors) && error.error.errors.length > 0) {
            errorMessage = error.error.errors[0].message || errorMessage;
          }
        } else if (error.message) {
          errorMessage = error.message;
        }
        
        alert(`Error: ${errorMessage}`);
      }
    });
  }

  onToggleActive(product: Product) {
    product.active = !product.active;
  }

  onBulkUpload() {
    console.log('Bulk upload');
  }

  onExport() {
    console.log('Export to Excel');
  }

  onAdd() {
    // Get logged-in company ID
    const companyInfo = this.authService.getCompanyInfo();
    if (!companyInfo || !companyInfo.company_id) {
      alert('No company information found. Please login again.');
      return;
    }
    // Reset form data
    this.step1Data = null;
    this.step2Data = null;
    this.step3Data = null;
    this.step4Data = null;
    // Reset edit mode
    this.isEditMode = false;
    this.editingProductId = null;
    this.productDataForEdit = null;
    this.selectedCompanyId = companyInfo.company_id;
    this.currentStep = 1; // Start directly at step 1 (no company selection)
    this.isAddModalOpen = true;
  }

  closeAddModal() {
    this.isAddModalOpen = false;
    this.currentStep = 1;
    // Keep selectedCompanyId as it's the logged-in company
    // Reset form data
    this.step1Data = null;
    this.step2Data = null;
    this.step3Data = null;
    this.step4Data = null;
    // Reset edit mode
    this.isEditMode = false;
    this.editingProductId = null;
    this.productDataForEdit = null;
  }

  onSaveStep1(data: ProductFormStep1Data) {
    console.log('Save step 1:', data);
    this.step1Data = data;
    this.currentStep = 2;
  }

  onSaveStep2(data: ProductFormStep2Data) {
    console.log('Save step 2:', data);
    this.step2Data = data;
    this.currentStep = 3;
  }

  onSaveStep3(data: ProductFormStep3Data) {
    console.log('Save step 3:', data);
    this.step3Data = data;
    this.currentStep = 4;
  }

  onSaveStep4(data: ProductFormStep4Data) {
    console.log('Save step 4:', data);
    this.step4Data = data;
    
    // Combine all step data and submit to API
    // Company ID is already set from logged-in user
    this.submitProduct();
  }

  submitProduct() {
    // Validate required fields
    if (!this.step1Data) {
      alert('Please complete all required steps');
      return;
    }
    
    // Company ID is already set from logged-in user
    if (!this.selectedCompanyId) {
      alert('No company information found. Please login again.');
      return;
    }

    // Validate required fields from step 1
    if (!this.step1Data.brand_id || !this.step1Data.brand_category_id || !this.step1Data.code || 
        !this.step1Data.gst_category || this.step1Data.gst_rate === null || !this.step1Data.name) {
      alert('Please complete all required fields in Step 1');
      return;
    }

    // Validate required fields from step 2
    if (!this.step2Data || !this.step2Data.packaging_type || 
        !this.step2Data.packaging_details || this.step2Data.packaging_details.length === 0) {
      alert('Packaging type and at least one packaging detail are required in Step 2');
      return;
    }

    // For edit mode (PATCH), prices and visibility are not required in the payload
    // For create mode (POST), they are required
    if (!this.isEditMode) {
      // Validate required fields from step 3
      if (!this.step3Data || !this.step3Data.prices || this.step3Data.prices.length === 0) {
        alert('At least one price entry is required in Step 3');
        return;
      }

      // Validate required fields from step 4
      if (!this.step4Data || !this.step4Data.visibility || this.step4Data.visibility.length === 0) {
        alert('At least one visibility entry is required in Step 4');
        return;
      }
    }

    this.isLoadingProduct = true;

    // Build the request payload according to API structure
    const payload: any = {
      brand_id: this.step1Data.brand_id,
      brand_category_id: this.step1Data.brand_category_id,
      code: this.step1Data.code,
      gst_category: this.step1Data.gst_category,
      gst_rate: this.step1Data.gst_rate,
      name: this.step1Data.name,
      packaging_type: this.step2Data.packaging_type,
      packaging_details: this.step2Data.packaging_details.map((pd: any) => ({
        name: pd.name,
        qty: pd.qty,
        parent: pd.parent,
        base_qty: pd.base_qty,
        base_unit: pd.base_unit,
        is_default: pd.is_default
      }))
    };

    // For POST (create mode), include prices and visibility
    // For PATCH (edit mode), according to API spec, prices and visibility are not included
    if (!this.isEditMode && this.step3Data && this.step3Data.prices) {
      payload.prices = this.step3Data.prices.map((price: any) => {
        const priceEntry: any = {
          mrp: price.mrp,
          area_id: price.area_id || null
        };
        
        // Add margins if present (nullable)
        if (price.margins) {
          priceEntry.margins = {
            distributor: {
              type: price.margins.distributor.type,
              value: price.margins.distributor.value
            },
            retailer: {
              type: price.margins.retailer.type,
              value: price.margins.retailer.value
            },
            super_stockist: {
              type: price.margins.super_stockist.type,
              value: price.margins.super_stockist.value
            }
          };
        }
        
        // Add min_order_quantity if present (nullable)
        if (price.min_order_quantity) {
          priceEntry.min_order_quantity = {
            distributor: price.min_order_quantity.distributor,
            retailer: price.min_order_quantity.retailer,
            super_stockist: price.min_order_quantity.super_stockist
          };
        }
        
        return priceEntry;
      });

      if (this.step4Data && this.step4Data.visibility) {
        payload.visibility = this.step4Data.visibility.map((vis: any) => ({
        area_id: vis.area_id || null,
        for_general: vis.for_general || false,
        for_horeca: vis.for_horeca || false,
        for_modern: vis.for_modern || false,
        for_type_a: vis.for_type_a || false,
        for_type_b: vis.for_type_b || false,
        for_type_c: vis.for_type_c || false
        }));
      }
    }

    // Add optional fields from step 1
    if (this.step1Data.brand_subcategory_id) {
      payload.brand_subcategory_id = this.step1Data.brand_subcategory_id;
    }
    if (this.step1Data.description) {
      payload.description = this.step1Data.description;
    }
    if (this.step1Data.barcode) {
      payload.barcode = this.step1Data.barcode;
    }
    if (this.step1Data.hsn_code) {
      payload.hsn_code = this.step1Data.hsn_code;
    }

    // Add optional fields from step 2
    if (this.step2Data.dimensions && (
      this.step2Data.dimensions.length !== null ||
      this.step2Data.dimensions.width !== null ||
      this.step2Data.dimensions.height !== null ||
      this.step2Data.dimensions.weight !== null
    )) {
      payload.dimensions = {
        length: this.step2Data.dimensions.length,
        width: this.step2Data.dimensions.width,
        height: this.step2Data.dimensions.height,
        weight: this.step2Data.dimensions.weight,
        unit: this.step2Data.dimensions.unit
      };
    }
    if (this.step2Data.measurement_details && this.step2Data.measurement_details.type) {
      payload.measurement_details = {
        type: this.step2Data.measurement_details.type,
        net: this.step2Data.measurement_details.net,
        net_unit: this.step2Data.measurement_details.net_unit,
        gross: this.step2Data.measurement_details.gross,
        gross_unit: this.step2Data.measurement_details.gross_unit
      };
    }
    if (this.step2Data.compliance) {
      payload.compliance = this.step2Data.compliance;
    }

    // Add optional images from step 4
    if (this.step4Data && this.step4Data.images && this.step4Data.images.length > 0) {
      payload.images = this.step4Data.images;
    }

    const url = this.isEditMode && this.editingProductId
      ? this.apiService.getApiUrl(`companies/${this.selectedCompanyId}/products/${this.editingProductId}`)
      : this.apiService.getApiUrl(`companies/${this.selectedCompanyId}/products`);
    const headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });

    console.log('Submitting product payload:', JSON.stringify(payload, null, 2));
    console.log('Is Edit Mode:', this.isEditMode);
    console.log('URL:', url);
    
    const httpMethod = this.isEditMode && this.editingProductId ? 'patch' : 'post';
    
    (this.http as any)[httpMethod](url, payload, { headers }).subscribe({
      next: (response: any) => {
        console.log(`Product ${this.isEditMode ? 'updated' : 'created'} successfully:`, response);
        alert(`Product ${this.isEditMode ? 'updated' : 'created'} successfully!`);
        this.isLoadingProduct = false;
        this.closeAddModal();
        // Reload products list
        this.loadProducts(this.currentPage);
      },
      error: (error: any) => {
        console.error(`Error ${this.isEditMode ? 'updating' : 'creating'} product:`, error);
        console.error('Error details:', error.error);
        console.error('Error status:', error.status);
        
        let errorMessage = `Error ${this.isEditMode ? 'updating' : 'creating'} product. `;
        if (error.error) {
          if (error.error.message) {
            errorMessage += error.error.message;
          } else if (error.error.detail) {
            errorMessage += error.error.detail;
          } else if (typeof error.error === 'string') {
            errorMessage += error.error;
          } else if (error.error.errors && Array.isArray(error.error.errors)) {
            const errorDetails = error.error.errors.map((e: any) => e.message || e).join(', ');
            errorMessage += errorDetails;
          } else {
            errorMessage += JSON.stringify(error.error);
          }
        } else {
          errorMessage += 'Please check the console for details.';
        }
        
        alert(errorMessage);
        this.isLoadingProduct = false;
      }
    });
  }

  onPreviousStep() {
    if (this.currentStep > 1) {
      this.currentStep--;
    }
  }

  getModalTitle(): string {
    const prefix = this.isEditMode ? 'Edit Product' : 'Add Product';
    switch(this.currentStep) {
      case 1:
        return `${prefix} — Step 1: Basic Product Information`;
      case 2:
        return `${prefix} — Step 2: Physical & Technical Details`;
      case 3:
        return `${prefix} — Step 3: Pricing & Margins`;
      case 4:
        return `${prefix} — Step 4: Images & Visibility`;
      default:
        return prefix;
    }
  }

  onFilter() {
    console.log('Filter');
  }

  onSearch(event: Event) {
    const input = event.target as HTMLInputElement;
    console.log('Search:', input.value);
  }

  goToPage(page: number) {
    if (page >= 1 && page <= this.totalPages) {
      this.loadProducts(page);
    }
  }

  previousPage() {
    if (this.currentPage > 1) {
      this.loadProducts(this.currentPage - 1);
    }
  }

  nextPage() {
    if (this.currentPage < this.totalPages) {
      this.loadProducts(this.currentPage + 1);
    }
  }
}
