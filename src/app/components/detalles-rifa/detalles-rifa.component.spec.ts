import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DetallesRifaComponent } from './detalles-rifa.component';

describe('DetallesRifaComponent', () => {
  let component: DetallesRifaComponent;
  let fixture: ComponentFixture<DetallesRifaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DetallesRifaComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DetallesRifaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
