import { TestBed } from '@angular/core/testing';

import { BranchService } from './branch.service';

describe('BranchService', () => {
  let service: TenantService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(BranchService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
