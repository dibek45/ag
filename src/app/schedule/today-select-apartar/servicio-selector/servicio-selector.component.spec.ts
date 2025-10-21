import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ServicioSelectorComponent } from './servicio-selector.component';

describe('ServicioSelectorComponent', () => {
  let component: ServicioSelectorComponent;
  let fixture: ComponentFixture<ServicioSelectorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ServicioSelectorComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ServicioSelectorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
