import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TombolaComponent } from './tombola.component';

describe('TombolaComponent', () => {
  let component: TombolaComponent;
  let fixture: ComponentFixture<TombolaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TombolaComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TombolaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
