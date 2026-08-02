import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ActualizarFertilizanteRegistrado } from './actualizar-fertilizante-registrado';

describe('ActualizarFertilizanteRegistrado', () => {
  let component: ActualizarFertilizanteRegistrado;
  let fixture: ComponentFixture<ActualizarFertilizanteRegistrado>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ActualizarFertilizanteRegistrado],
    }).compileComponents();

    fixture = TestBed.createComponent(ActualizarFertilizanteRegistrado);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
