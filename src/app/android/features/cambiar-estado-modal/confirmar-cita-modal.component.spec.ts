import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CambiarEstadoModalComponent } from './confirmar-cita-modal.component';

describe('CambiarEstadoModalComponent', () => {
  let component: CambiarEstadoModalComponent;
  let fixture: ComponentFixture<CambiarEstadoModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CambiarEstadoModalComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(CambiarEstadoModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
