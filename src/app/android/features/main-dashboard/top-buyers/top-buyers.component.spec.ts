import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TopBuyersComponent } from './top-buyers.component';

describe('TopBuyersComponent', () => {
  let component: TopBuyersComponent;
  let fixture: ComponentFixture<TopBuyersComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TopBuyersComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(TopBuyersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
