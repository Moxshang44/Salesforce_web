import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BrandFormStep1Component } from './brand-form-step1.component';

describe('BrandFormStep1Component', () => {
  let component: BrandFormStep1Component;
  let fixture: ComponentFixture<BrandFormStep1Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BrandFormStep1Component]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BrandFormStep1Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

