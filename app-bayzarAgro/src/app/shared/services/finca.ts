import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { Observable } from 'rxjs';
import { Ifinca } from '../interfaces/ifinca';

@Injectable({
  providedIn: 'root',
})
export class Finca {

  private http = inject(HttpClient);

  private apiUrl = environment.apiUrl;

  // LISTAR
  public listar(): Observable<Ifinca[]> {
    return this.http.get<Ifinca[]>(`${this.apiUrl}/fincas`);
  }

  // CONSULTAR
  public consultar(id: number): Observable<Ifinca> {
      return this.http.get<Ifinca>(`${this.apiUrl}/fincas/${id}`);
  }

  // GUARDAR
  public guardar(datos: Ifinca): Observable<any> {
return this.http.post(`${this.apiUrl}/fincas`,datos);
  }

  // ACTUALIZAR
  public actualizar(id: number, datos: Ifinca): Observable<any> {
return this.http.put(`${this.apiUrl}/fincas/${id}`,datos);
  }

  // ELIMINAR
  public eliminar(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/fincas/${id}`);
  }
}
