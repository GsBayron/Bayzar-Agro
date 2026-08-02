import { TestBed } from '@angular/core/testing';

import { FertilizanteRegistrado } from './fertilizante-registrado';

describe('FertilizanteRegistrado', () => {
  let service: FertilizanteRegistrado;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(FertilizanteRegistrado);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
