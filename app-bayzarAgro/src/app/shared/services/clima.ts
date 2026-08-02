import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';
import { IClima } from '../interfaces/iclima';

@Injectable({
  providedIn: 'root'
})
export class Clima {

  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl;

  public consultarPorFinca(id_finca: number): Observable<IClima> {
    return this.http.get<IClima>(
      `${this.apiUrl}/clima/finca/${id_finca}`
    );
  }
}