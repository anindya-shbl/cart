import { ComponentFixture, TestBed } from '@angular/core/testing';

import { JitoSearchComponent } from './jito-search.component';

describe('JitoSearchComponent', () => {
  let component: JitoSearchComponent;
  let fixture: ComponentFixture<JitoSearchComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [JitoSearchComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(JitoSearchComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
