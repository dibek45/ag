import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NextRaffleComponent } from './next-raffle.component';

describe('NextRaffleComponent', () => {
  let component: NextRaffleComponent;
  let fixture: ComponentFixture<NextRaffleComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NextRaffleComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(NextRaffleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
