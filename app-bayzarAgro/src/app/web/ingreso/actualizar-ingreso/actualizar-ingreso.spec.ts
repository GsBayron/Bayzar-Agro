import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ActualizarIngreso } from './actualizar-ingreso';

describe('ActualizarIngreso', () => {
  let component: ActualizarIngreso;
  let fixture: ComponentFixture<ActualizarIngreso>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ActualizarIngreso],
    }).compileComponents();

    fixture = TestBed.createComponent(ActualizarIngreso);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
