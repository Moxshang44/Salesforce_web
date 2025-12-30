import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BrandFormStep2Component } from './brand-form-step2.component';

describe('BrandFormStep2Component', () => {
  let component: BrandFormStep2Component;
  let fixture: ComponentFixture<BrandFormStep2Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BrandFormStep2Component]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BrandFormStep2Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

