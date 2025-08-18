import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DibekInformationComponent } from './dibek-information.component';

describe('DibekInformationComponent', () => {
  let component: DibekInformationComponent;
  let fixture: ComponentFixture<DibekInformationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DibekInformationComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(DibekInformationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
