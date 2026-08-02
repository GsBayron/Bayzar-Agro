import { TestBed } from '@angular/core/testing';

import { PlaguicidaRegistrado } from './plaguicida-registrado';

describe('PlaguicidaRegistrado', () => {
  let service: PlaguicidaRegistrado;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PlaguicidaRegistrado);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
