import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SchemeFormStep1Component } from './scheme-form-step1.component';

describe('SchemeFormStep1Component', () => {
  let component: SchemeFormStep1Component;
  let fixture: ComponentFixture<SchemeFormStep1Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SchemeFormStep1Component]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SchemeFormStep1Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
