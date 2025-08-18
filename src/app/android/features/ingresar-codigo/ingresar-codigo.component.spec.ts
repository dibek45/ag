import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IngresarCodigoComponent } from './ingresar-codigo.component';

describe('IngresarCodigoComponent', () => {
  let component: IngresarCodigoComponent;
  let fixture: ComponentFixture<IngresarCodigoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [IngresarCodigoComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(IngresarCodigoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
