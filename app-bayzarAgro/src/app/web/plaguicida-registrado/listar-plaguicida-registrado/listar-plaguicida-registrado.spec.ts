import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListarPlaguicidaRegistrado } from './listar-plaguicida-registrado';

describe('ListarPlaguicidaRegistrado', () => {
  let component: ListarPlaguicidaRegistrado;
  let fixture: ComponentFixture<ListarPlaguicidaRegistrado>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ListarPlaguicidaRegistrado],
    }).compileComponents();

    fixture = TestBed.createComponent(ListarPlaguicidaRegistrado);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
