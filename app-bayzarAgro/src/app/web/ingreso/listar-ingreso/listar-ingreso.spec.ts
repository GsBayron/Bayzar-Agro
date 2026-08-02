import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListarIngreso } from './listar-ingreso';

describe('ListarIngreso', () => {
  let component: ListarIngreso;
  let fixture: ComponentFixture<ListarIngreso>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ListarIngreso],
    }).compileComponents();

    fixture = TestBed.createComponent(ListarIngreso);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
