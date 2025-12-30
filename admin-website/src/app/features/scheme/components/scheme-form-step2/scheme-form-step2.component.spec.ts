import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SchemeFormStep2Component } from './scheme-form-step2.component';

describe('SchemeFormStep2Component', () => {
  let component: SchemeFormStep2Component;
  let fixture: ComponentFixture<SchemeFormStep2Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SchemeFormStep2Component]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SchemeFormStep2Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
