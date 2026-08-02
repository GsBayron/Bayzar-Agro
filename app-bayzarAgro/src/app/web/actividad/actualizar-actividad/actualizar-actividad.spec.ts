import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ActualizarActividad } from './actualizar-actividad';

describe('ActualizarActividad', () => {
  let component: ActualizarActividad;
  let fixture: ComponentFixture<ActualizarActividad>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ActualizarActividad],
    }).compileComponents();

    fixture = TestBed.createComponent(ActualizarActividad);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
