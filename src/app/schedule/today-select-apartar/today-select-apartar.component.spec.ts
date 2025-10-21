import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TodaySelectApartarComponent } from './today-select-apartar.component';

describe('TodaySelectApartarComponent', () => {
  let component: TodaySelectApartarComponent;
  let fixture: ComponentFixture<TodaySelectApartarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TodaySelectApartarComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TodaySelectApartarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
