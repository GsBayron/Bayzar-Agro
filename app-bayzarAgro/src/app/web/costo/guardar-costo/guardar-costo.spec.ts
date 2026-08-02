import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GuardarCosto } from './guardar-costo';

describe('GuardarCosto', () => {
  let component: GuardarCosto;
  let fixture: ComponentFixture<GuardarCosto>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GuardarCosto],
    }).compileComponents();

    fixture = TestBed.createComponent(GuardarCosto);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
