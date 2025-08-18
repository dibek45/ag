import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RewardedAdComponent } from './rewarded-ad.component';

describe('RewardedAdComponent', () => {
  let component: RewardedAdComponent;
  let fixture: ComponentFixture<RewardedAdComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RewardedAdComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RewardedAdComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
