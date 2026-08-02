import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListarCosto } from './listar-costo';

describe('ListarCosto', () => {
  let component: ListarCosto;
  let fixture: ComponentFixture<ListarCosto>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ListarCosto],
    }).compileComponents();

    fixture = TestBed.createComponent(ListarCosto);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
