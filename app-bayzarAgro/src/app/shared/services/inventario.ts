import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';
import { IInventario } from '../interfaces/iinventario';

@Injectable({
  providedIn: 'root'
})
export class Inventario {

  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl;

  public listar(): Observable<IInventario[]> {
    return this.http.get<IInventario[]>(`${this.apiUrl}/inventario`);
  }

  public consultar(id: number): Observable<IInventario> {
    return this.http.get<IInventario>(`${this.apiUrl}/inventario/${id}`);
  }

  public guardar(datos: IInventario): Observable<any> {
    return this.http.post(`${this.apiUrl}/inventario`, datos);
  }

  public actualizar(id: number, datos: IInventario): Observable<any> {
    return this.http.put(`${this.apiUrl}/inventario/${id}`, datos);
  }

  public eliminar(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/inventario/${id}`);
  }

  public guardarLote(productos: IInventario[]): Observable<any> {
    return this.http.post(`${this.apiUrl}/inventario/lote`, {
      productos
    });
  }
}