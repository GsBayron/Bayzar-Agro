import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ActualizarProduccion } from './actualizar-produccion';

describe('ActualizarProduccion', () => {
  let component: ActualizarProduccion;
  let fixture: ComponentFixture<ActualizarProduccion>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ActualizarProduccion],
    }).compileComponents();

    fixture = TestBed.createComponent(ActualizarProduccion);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
