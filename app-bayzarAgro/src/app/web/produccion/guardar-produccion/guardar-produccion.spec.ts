import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GuardarProduccion } from './guardar-produccion';

describe('GuardarProduccion', () => {
  let component: GuardarProduccion;
  let fixture: ComponentFixture<GuardarProduccion>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GuardarProduccion],
    }).compileComponents();

    fixture = TestBed.createComponent(GuardarProduccion);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
