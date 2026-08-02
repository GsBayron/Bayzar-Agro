import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';
import { ICosto } from '../interfaces/icosto';

@Injectable({
  providedIn: 'root'
})
export class Costo {

  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl;

  public listar(): Observable<ICosto[]> {
    return this.http.get<ICosto[]>(
      `${this.apiUrl}/costos`
    );
  }

  public consultar(id: number): Observable<ICosto> {
    return this.http.get<ICosto>(
      `${this.apiUrl}/costos/${id}`
    );
  }

  public guardar(datos: ICosto): Observable<any> {
    return this.http.post(
      `${this.apiUrl}/costos`,
      datos
    );
  }

  public actualizar(id: number, datos: ICosto): Observable<any> {
    return this.http.put(
      `${this.apiUrl}/costos/${id}`,
      datos
    );
  }

  public eliminar(id: number): Observable<any> {
    return this.http.delete(
      `${this.apiUrl}/costos/${id}`
    );
  }
}