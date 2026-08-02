import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ActualizarPlagaRegistrada } from './actualizar-plaga-registrada';

describe('ActualizarPlagaRegistrada', () => {
  let component: ActualizarPlagaRegistrada;
  let fixture: ComponentFixture<ActualizarPlagaRegistrada>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ActualizarPlagaRegistrada],
    }).compileComponents();

    fixture = TestBed.createComponent(ActualizarPlagaRegistrada);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
