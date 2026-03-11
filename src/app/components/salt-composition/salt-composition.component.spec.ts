import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SaltCompositionComponent } from './salt-composition.component';

describe('SaltCompositionComponent', () => {
  let component: SaltCompositionComponent;
  let fixture: ComponentFixture<SaltCompositionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [SaltCompositionComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(SaltCompositionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
