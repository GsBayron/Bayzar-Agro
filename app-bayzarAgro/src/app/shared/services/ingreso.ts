import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';
import { IIngreso } from '../interfaces/iingreso';

@Injectable({
  providedIn: 'root'
})
export class Ingreso {

  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl;

  public listar(): Observable<IIngreso[]> {
    return this.http.get<IIngreso[]>(
      `${this.apiUrl}/ingresos`
    );
  }

  public consultar(id: number): Observable<IIngreso> {
    return this.http.get<IIngreso>(
      `${this.apiUrl}/ingresos/${id}`
    );
  }

  public guardar(datos: IIngreso): Observable<any> {
    return this.http.post(
      `${this.apiUrl}/ingresos`,
      datos
    );
  }

  public actualizar(id: number, datos: IIngreso): Observable<any> {
    return this.http.put(
      `${this.apiUrl}/ingresos/${id}`,
      datos
    );
  }

  public eliminar(id: number): Observable<any> {
    return this.http.delete(
      `${this.apiUrl}/ingresos/${id}`
    );
  }
}