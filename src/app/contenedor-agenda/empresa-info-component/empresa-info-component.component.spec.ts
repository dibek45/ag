import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EmpresaInfoComponentComponent } from './empresa-info-component.component';

describe('EmpresaInfoComponentComponent', () => {
  let component: EmpresaInfoComponentComponent;
  let fixture: ComponentFixture<EmpresaInfoComponentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EmpresaInfoComponentComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EmpresaInfoComponentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
