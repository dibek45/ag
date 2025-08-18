import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SolicitarModalComponent } from './solicitar-modal.component';

describe('SolicitarModalComponent', () => {
  let component: SolicitarModalComponent;
  let fixture: ComponentFixture<SolicitarModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SolicitarModalComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(SolicitarModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
