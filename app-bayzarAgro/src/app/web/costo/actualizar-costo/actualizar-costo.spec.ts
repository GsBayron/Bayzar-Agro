import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ActualizarCosto } from './actualizar-costo';

describe('ActualizarCosto', () => {
  let component: ActualizarCosto;
  let fixture: ComponentFixture<ActualizarCosto>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ActualizarCosto],
    }).compileComponents();

    fixture = TestBed.createComponent(ActualizarCosto);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
