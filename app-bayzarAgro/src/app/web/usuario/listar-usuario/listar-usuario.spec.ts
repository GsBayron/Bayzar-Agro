import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListarUsuario } from './listar-usuario';

describe('ListarUsuario', () => {
  let component: ListarUsuario;
  let fixture: ComponentFixture<ListarUsuario>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ListarUsuario],
    }).compileComponents();

    fixture = TestBed.createComponent(ListarUsuario);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
