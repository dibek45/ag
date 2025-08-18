import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BonosComponent } from './bonos.component';

describe('BonosComponent', () => {
  let component: BonosComponent;
  let fixture: ComponentFixture<BonosComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BonosComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BonosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
