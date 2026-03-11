import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BrandedComponent } from './branded.component';

describe('BrandedComponent', () => {
  let component: BrandedComponent;
  let fixture: ComponentFixture<BrandedComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [BrandedComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(BrandedComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
