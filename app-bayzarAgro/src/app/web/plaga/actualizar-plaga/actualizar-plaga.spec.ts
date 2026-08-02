import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ActualizarPlaga } from './actualizar-plaga';

describe('ActualizarPlaga', () => {
  let component: ActualizarPlaga;
  let fixture: ComponentFixture<ActualizarPlaga>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ActualizarPlaga],
    }).compileComponents();

    fixture = TestBed.createComponent(ActualizarPlaga);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
