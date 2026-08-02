import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListarAlerta } from './listar-alerta';

describe('ListarAlerta', () => {
  let component: ListarAlerta;
  let fixture: ComponentFixture<ListarAlerta>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ListarAlerta],
    }).compileComponents();

    fixture = TestBed.createComponent(ListarAlerta);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
