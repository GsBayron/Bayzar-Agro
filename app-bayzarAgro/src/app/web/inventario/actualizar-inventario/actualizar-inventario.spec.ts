import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ActualizarInventario } from './actualizar-inventario';

describe('ActualizarInventario', () => {
  let component: ActualizarInventario;
  let fixture: ComponentFixture<ActualizarInventario>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ActualizarInventario],
    }).compileComponents();

    fixture = TestBed.createComponent(ActualizarInventario);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
