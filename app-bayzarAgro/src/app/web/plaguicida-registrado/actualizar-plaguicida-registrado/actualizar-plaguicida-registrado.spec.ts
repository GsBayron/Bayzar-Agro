import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ActualizarPlaguicidaRegistrado } from './actualizar-plaguicida-registrado';

describe('ActualizarPlaguicidaRegistrado', () => {
  let component: ActualizarPlaguicidaRegistrado;
  let fixture: ComponentFixture<ActualizarPlaguicidaRegistrado>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ActualizarPlaguicidaRegistrado],
    }).compileComponents();

    fixture = TestBed.createComponent(ActualizarPlaguicidaRegistrado);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
