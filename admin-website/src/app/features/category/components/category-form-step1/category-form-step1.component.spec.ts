import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CategoryFormStep1Component } from './category-form-step1.component';

describe('CategoryFormStep1Component', () => {
  let component: CategoryFormStep1Component;
  let fixture: ComponentFixture<CategoryFormStep1Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CategoryFormStep1Component]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CategoryFormStep1Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
