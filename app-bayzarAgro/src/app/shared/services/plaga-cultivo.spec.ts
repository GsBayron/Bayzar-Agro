import { TestBed } from '@angular/core/testing';

import { PlagaCultivo } from './plaga-cultivo';

describe('PlagaCultivo', () => {
  let service: PlagaCultivo;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PlagaCultivo);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
