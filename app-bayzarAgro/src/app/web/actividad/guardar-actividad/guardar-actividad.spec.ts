import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GuardarActividad } from './guardar-actividad';

describe('GuardarActividad', () => {
  let component: GuardarActividad;
  let fixture: ComponentFixture<GuardarActividad>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GuardarActividad],
    }).compileComponents();

    fixture = TestBed.createComponent(GuardarActividad);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
