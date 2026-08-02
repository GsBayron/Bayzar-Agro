import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';
import { IPlaguicidaRegistrado } from '../interfaces/iplaguicida-registrado';

@Injectable({
  providedIn: 'root'
})
export class PlaguicidaRegistrado {

  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl;

  public listar(): Observable<IPlaguicidaRegistrado[]> {
    return this.http.get<IPlaguicidaRegistrado[]>(
      `${this.apiUrl}/plaguicidas-registrados`
    );
  }

  public consultar(id: number): Observable<IPlaguicidaRegistrado> {
    return this.http.get<IPlaguicidaRegistrado>(
      `${this.apiUrl}/plaguicidas-registrados/${id}`
    );
  }

  public guardar(datos: IPlaguicidaRegistrado): Observable<any> {
    return this.http.post(
      `${this.apiUrl}/plaguicidas-registrados`,
      datos
    );
  }

  public actualizar(
    id: number,
    datos: IPlaguicidaRegistrado
  ): Observable<any> {
    return this.http.put(
      `${this.apiUrl}/plaguicidas-registrados/${id}`,
      datos
    );
  }

  public eliminar(id: number): Observable<any> {
    return this.http.delete(
      `${this.apiUrl}/plaguicidas-registrados/${id}`
    );
  }
}