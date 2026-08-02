import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';
import { IPlagaRegistrada } from '../interfaces/iplaga-registrada';

@Injectable({
  providedIn: 'root'
})
export class PlagaRegistrada {

  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl;

  public listar(): Observable<IPlagaRegistrada[]> {
    return this.http.get<IPlagaRegistrada[]>(
      `${this.apiUrl}/plagas-registradas`
    );
  }

  public consultar(id: number): Observable<IPlagaRegistrada> {
    return this.http.get<IPlagaRegistrada>(
      `${this.apiUrl}/plagas-registradas/${id}`
    );
  }

  public guardar(datos: IPlagaRegistrada): Observable<any> {
    return this.http.post(
      `${this.apiUrl}/plagas-registradas`,
      datos
    );
  }

  public actualizar(
    id: number,
    datos: IPlagaRegistrada
  ): Observable<any> {
    return this.http.put(
      `${this.apiUrl}/plagas-registradas/${id}`,
      datos
    );
  }

  public eliminar(id: number): Observable<any> {
    return this.http.delete(
      `${this.apiUrl}/plagas-registradas/${id}`
    );
  }
}