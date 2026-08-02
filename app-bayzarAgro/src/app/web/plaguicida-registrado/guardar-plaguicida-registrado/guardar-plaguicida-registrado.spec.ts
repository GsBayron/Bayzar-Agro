import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GuardarPlaguicidaRegistrado } from './guardar-plaguicida-registrado';

describe('GuardarPlaguicidaRegistrado', () => {
  let component: GuardarPlaguicidaRegistrado;
  let fixture: ComponentFixture<GuardarPlaguicidaRegistrado>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GuardarPlaguicidaRegistrado],
    }).compileComponents();

    fixture = TestBed.createComponent(GuardarPlaguicidaRegistrado);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
