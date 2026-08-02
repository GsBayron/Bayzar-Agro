import { TestBed } from '@angular/core/testing';

import { Cultivo } from './cultivo';

describe('Cultivo', () => {
  let service: Cultivo;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Cultivo);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
