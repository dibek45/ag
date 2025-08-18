import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PrizeInfoComponent } from '../prize-info/prize-info.component';

describe('PrizeInfoComponent', () => {
  let component: PrizeInfoComponent;
  let fixture: ComponentFixture<PrizeInfoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PrizeInfoComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PrizeInfoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
