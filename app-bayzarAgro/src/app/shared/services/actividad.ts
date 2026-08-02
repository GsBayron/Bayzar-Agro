import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';
import { IActividad } from '../interfaces/iactividad';

@Injectable({
  providedIn: 'root'
})
export class Actividad {

  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl;

  public listar(): Observable<IActividad[]> {
    return this.http.get<IActividad[]>(`${this.apiUrl}/actividades`);
  }

  public consultar(id: number): Observable<IActividad> {
    return this.http.get<IActividad>(`${this.apiUrl}/actividades/${id}`);
  }

  public guardar(datos: IActividad): Observable<any> {
    return this.http.post(`${this.apiUrl}/actividades`, datos);
  }

  public actualizar(id: number, datos: IActividad): Observable<any> {
    return this.http.put(`${this.apiUrl}/actividades/${id}`, datos);
  }

  public eliminar(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/actividades/${id}`);
  }
}