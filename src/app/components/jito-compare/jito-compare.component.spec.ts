import { ComponentFixture, TestBed } from '@angular/core/testing';

import { JitoCompareComponent } from './jito-compare.component';

describe('JitoCompareComponent', () => {
  let component: JitoCompareComponent;
  let fixture: ComponentFixture<JitoCompareComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [JitoCompareComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(JitoCompareComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
