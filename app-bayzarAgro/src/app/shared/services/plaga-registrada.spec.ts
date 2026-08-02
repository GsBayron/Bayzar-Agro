import { TestBed } from '@angular/core/testing';

import { PlagaRegistrada } from './plaga-registrada';

describe('PlagaRegistrada', () => {
  let service: PlagaRegistrada;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PlagaRegistrada);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
