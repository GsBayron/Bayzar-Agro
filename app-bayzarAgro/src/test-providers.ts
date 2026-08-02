import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

export default [
  provideRouter([]),
  provideHttpClient(),
  provideHttpClientTesting(),
  {
    provide: MAT_DIALOG_DATA,
    useValue: {}
  },
  {
    provide: MatDialogRef,
    useValue: {
      close: () => undefined
    }
  }
];
