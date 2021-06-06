import { TestBed } from '@angular/core/testing';

import { AngularQueryService } from './angular-query.service';

describe('AngularQueryService', () => {
  let service: AngularQueryService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AngularQueryService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
