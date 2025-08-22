import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SearchNumberComponent } from './search-number.component';

describe('SearchNumberComponent', () => {
  let component: SearchNumberComponent;
  let fixture: ComponentFixture<SearchNumberComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SearchNumberComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(SearchNumberComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
