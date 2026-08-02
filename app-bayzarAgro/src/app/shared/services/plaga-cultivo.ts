import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { Observable } from 'rxjs';
import { IPlagaCultivo } from '../interfaces/iplaga-cultivo';

@Injectable({
  providedIn: 'root'
})
export class PlagaCultivo {

  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl;

  public listar(): Observable<IPlagaCultivo[]> {

    return this.http.get<IPlagaCultivo[]>(`${this.apiUrl}/plagas-cultivo`);
  }

  public consultar(id: number): Observable<IPlagaCultivo> {

    return this.http.get<IPlagaCultivo>(`${this.apiUrl}/plagas-cultivo/${id}`);
  }

  public guardar(datos: IPlagaCultivo): Observable<any> {

    return this.http.post(`${this.apiUrl}/plagas-cultivo`, datos);
  }

  public actualizar(id: number, datos: IPlagaCultivo): Observable<any> {

    return this.http.put(`${this.apiUrl}/plagas-cultivo/${id}`, datos);
  }

  public eliminar(id: number): Observable<any> {

    return this.http.delete(`${this.apiUrl}/plagas-cultivo/${id}`);
  }
}
