import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListarCultivo } from './listar-cultivo';

describe('ListarCultivo', () => {
  let component: ListarCultivo;
  let fixture: ComponentFixture<ListarCultivo>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ListarCultivo],
    }).compileComponents();

    fixture = TestBed.createComponent(ListarCultivo);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
