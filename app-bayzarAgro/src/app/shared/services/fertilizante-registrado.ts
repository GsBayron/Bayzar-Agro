import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';
import { IFertilizanteRegistrado } from '../interfaces/ifertilizante-registrado';

@Injectable({
  providedIn: 'root'
})
export class FertilizanteRegistrado {

  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl;

  public listar(): Observable<IFertilizanteRegistrado[]> {
    return this.http.get<IFertilizanteRegistrado[]>(
      `${this.apiUrl}/fertilizantes-registrados`
    );
  }

  public consultar(id: number): Observable<IFertilizanteRegistrado> {
    return this.http.get<IFertilizanteRegistrado>(
      `${this.apiUrl}/fertilizantes-registrados/${id}`
    );
  }

  public guardar(datos: IFertilizanteRegistrado): Observable<any> {
    return this.http.post(
      `${this.apiUrl}/fertilizantes-registrados`,
      datos
    );
  }

  public actualizar(
    id: number,
    datos: IFertilizanteRegistrado
  ): Observable<any> {
    return this.http.put(
      `${this.apiUrl}/fertilizantes-registrados/${id}`,
      datos
    );
  }

  public eliminar(id: number): Observable<any> {
    return this.http.delete(
      `${this.apiUrl}/fertilizantes-registrados/${id}`
    );
  }
}