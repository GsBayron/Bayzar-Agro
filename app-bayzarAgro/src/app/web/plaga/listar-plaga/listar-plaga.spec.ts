import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListarPlaga } from './listar-plaga';

describe('ListarPlaga', () => {
  let component: ListarPlaga;
  let fixture: ComponentFixture<ListarPlaga>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ListarPlaga],
    }).compileComponents();

    fixture = TestBed.createComponent(ListarPlaga);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
