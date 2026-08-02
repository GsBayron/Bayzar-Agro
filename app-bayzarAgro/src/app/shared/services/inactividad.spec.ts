import { TestBed } from '@angular/core/testing';

import { Inactividad } from './inactividad';

describe('Inactividad', () => {
  let service: Inactividad;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Inactividad);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
