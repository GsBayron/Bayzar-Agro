import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GuardarPlagaRegistrada } from './guardar-plaga-registrada';

describe('GuardarPlagaRegistrada', () => {
  let component: GuardarPlagaRegistrada;
  let fixture: ComponentFixture<GuardarPlagaRegistrada>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GuardarPlagaRegistrada],
    }).compileComponents();

    fixture = TestBed.createComponent(GuardarPlagaRegistrada);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
