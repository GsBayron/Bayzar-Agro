import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GuardarPlaga } from './guardar-plaga';

describe('GuardarPlaga', () => {
  let component: GuardarPlaga;
  let fixture: ComponentFixture<GuardarPlaga>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GuardarPlaga],
    }).compileComponents();

    fixture = TestBed.createComponent(GuardarPlaga);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
