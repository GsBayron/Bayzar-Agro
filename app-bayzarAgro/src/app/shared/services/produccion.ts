import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';
import { IProduccion } from '../interfaces/iproduccion';

@Injectable({
  providedIn: 'root'
})
export class Produccion {

  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl;

  public listar(): Observable<IProduccion[]> {
    return this.http.get<IProduccion[]>(
      `${this.apiUrl}/produccion`
    );
  }

  public consultar(id: number): Observable<IProduccion> {
    return this.http.get<IProduccion>(
      `${this.apiUrl}/produccion/${id}`
    );
  }

  public guardar(datos: IProduccion): Observable<any> {
    return this.http.post(
      `${this.apiUrl}/produccion`,
      datos
    );
  }

  public actualizar(id: number, datos: IProduccion): Observable<any> {
    return this.http.put(
      `${this.apiUrl}/produccion/${id}`,
      datos
    );
  }

  public eliminar(id: number): Observable<any> {
    return this.http.delete(
      `${this.apiUrl}/produccion/${id}`
    );
  }
}