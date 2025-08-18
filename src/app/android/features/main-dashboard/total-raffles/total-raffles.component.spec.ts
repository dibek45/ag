import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TotalRafflesComponent } from './total-raffles.component';

describe('TotalRafflesComponent', () => {
  let component: TotalRafflesComponent;
  let fixture: ComponentFixture<TotalRafflesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TotalRafflesComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(TotalRafflesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
