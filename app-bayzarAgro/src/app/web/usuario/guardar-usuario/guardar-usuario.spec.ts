import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GuardarUsuario } from './guardar-usuario';

describe('GuardarUsuario', () => {
  let component: GuardarUsuario;
  let fixture: ComponentFixture<GuardarUsuario>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GuardarUsuario],
    }).compileComponents();

    fixture = TestBed.createComponent(GuardarUsuario);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
