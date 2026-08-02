import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GuardarIngreso } from './guardar-ingreso';

describe('GuardarIngreso', () => {
  let component: GuardarIngreso;
  let fixture: ComponentFixture<GuardarIngreso>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GuardarIngreso],
    }).compileComponents();

    fixture = TestBed.createComponent(GuardarIngreso);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
