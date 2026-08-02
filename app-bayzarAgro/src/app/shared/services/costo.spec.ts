import { TestBed } from '@angular/core/testing';

import { Costo } from './costo';

describe('Costo', () => {
  let service: Costo;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Costo);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
