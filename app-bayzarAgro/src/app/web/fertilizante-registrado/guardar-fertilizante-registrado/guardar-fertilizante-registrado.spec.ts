import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GuardarFertilizanteRegistrado } from './guardar-fertilizante-registrado';

describe('GuardarFertilizanteRegistrado', () => {
  let component: GuardarFertilizanteRegistrado;
  let fixture: ComponentFixture<GuardarFertilizanteRegistrado>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GuardarFertilizanteRegistrado],
    }).compileComponents();

    fixture = TestBed.createComponent(GuardarFertilizanteRegistrado);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
