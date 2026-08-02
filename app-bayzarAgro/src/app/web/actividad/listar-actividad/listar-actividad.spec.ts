import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListarActividad } from './listar-actividad';

describe('ListarActividad', () => {
  let component: ListarActividad;
  let fixture: ComponentFixture<ListarActividad>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ListarActividad],
    }).compileComponents();

    fixture = TestBed.createComponent(ListarActividad);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
