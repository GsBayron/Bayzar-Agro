import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListarPlagaRegistrada } from './listar-plaga-registrada';

describe('ListarPlagaRegistrada', () => {
  let component: ListarPlagaRegistrada;
  let fixture: ComponentFixture<ListarPlagaRegistrada>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ListarPlagaRegistrada],
    }).compileComponents();

    fixture = TestBed.createComponent(ListarPlagaRegistrada);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
