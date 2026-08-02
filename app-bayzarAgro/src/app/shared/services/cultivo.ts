import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';

import { ICultivo } from '../interfaces/icultivo';

@Injectable({
  providedIn: 'root'
})
export class Cultivo {

  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl;

  public listar(): Observable<ICultivo[]> {
    return this.http.get<ICultivo[]>(`${this.apiUrl}/cultivos`);
  }

  public consultar(id: number): Observable<ICultivo> {
    return this.http.get<ICultivo>(`${this.apiUrl}/cultivos/${id}`);
  }

  public guardar(datos: ICultivo): Observable<any> {
    return this.http.post(`${this.apiUrl}/cultivos`, datos);
  }

  public actualizar(id: number, datos: ICultivo): Observable<any> {
    return this.http.put(`${this.apiUrl}/cultivos/${id}`, datos);
  }

  public eliminar(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/cultivos/${id}`);
  }
}