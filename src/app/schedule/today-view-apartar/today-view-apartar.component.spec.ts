import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TodayViewApartarComponent } from './today-view-apartar.component';

describe('TodayViewApartarComponent', () => {
  let component: TodayViewApartarComponent;
  let fixture: ComponentFixture<TodayViewApartarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TodayViewApartarComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TodayViewApartarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
