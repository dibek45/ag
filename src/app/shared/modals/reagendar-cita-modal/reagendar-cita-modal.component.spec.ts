import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReagendarCitaModalComponent } from './reagendar-cita-modal.component';

describe('ReagendarCitaModalComponent', () => {
  let component: ReagendarCitaModalComponent;
  let fixture: ComponentFixture<ReagendarCitaModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReagendarCitaModalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ReagendarCitaModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
