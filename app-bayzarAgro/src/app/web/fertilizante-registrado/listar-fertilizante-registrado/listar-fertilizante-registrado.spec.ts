import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListarFertilizanteRegistrado } from './listar-fertilizante-registrado';

describe('ListarFertilizanteRegistrado', () => {
  let component: ListarFertilizanteRegistrado;
  let fixture: ComponentFixture<ListarFertilizanteRegistrado>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ListarFertilizanteRegistrado],
    }).compileComponents();

    fixture = TestBed.createComponent(ListarFertilizanteRegistrado);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
