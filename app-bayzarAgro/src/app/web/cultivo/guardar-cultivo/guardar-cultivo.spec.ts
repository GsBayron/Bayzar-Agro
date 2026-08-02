import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GuardarCultivo } from './guardar-cultivo';

describe('GuardarCultivo', () => {
  let component: GuardarCultivo;
  let fixture: ComponentFixture<GuardarCultivo>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GuardarCultivo],
    }).compileComponents();

    fixture = TestBed.createComponent(GuardarCultivo);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
