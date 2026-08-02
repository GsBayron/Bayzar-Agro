import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListarProduccion } from './listar-produccion';

describe('ListarProduccion', () => {
  let component: ListarProduccion;
  let fixture: ComponentFixture<ListarProduccion>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ListarProduccion],
    }).compileComponents();

    fixture = TestBed.createComponent(ListarProduccion);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
