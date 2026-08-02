import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ActualizarCultivo } from './actualizar-cultivo';

describe('ActualizarCultivo', () => {
  let component: ActualizarCultivo;
  let fixture: ComponentFixture<ActualizarCultivo>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ActualizarCultivo],
    }).compileComponents();

    fixture = TestBed.createComponent(ActualizarCultivo);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
