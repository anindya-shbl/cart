import { TestBed } from '@angular/core/testing';

import { WebEngageService } from './webengage.service';

describe('WebengageService', () => {
  let service: WebEngageService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(WebEngageService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
