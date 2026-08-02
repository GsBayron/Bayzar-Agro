import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GuardarInventario } from './guardar-inventario';

describe('GuardarInventario', () => {
  let component: GuardarInventario;
  let fixture: ComponentFixture<GuardarInventario>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GuardarInventario],
    }).compileComponents();

    fixture = TestBed.createComponent(GuardarInventario);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
