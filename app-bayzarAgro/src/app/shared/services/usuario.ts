import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';
import { IUsuario } from '../interfaces/iusuario';

@Injectable({
  providedIn: 'root'
})
export class Usuario {

  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl;

  public Listar(): Observable<IUsuario[]> {
    return this.http.get<IUsuario[]>(`${this.apiUrl}/usuario/listar`);
  }

  public Consultar(id_usuario: number): Observable<IUsuario> {
    return this.http.get<IUsuario>(`${this.apiUrl}/usuario/consultar/${id_usuario}`);
  }

  public Guardar(usuario: IUsuario): Observable<{ message: string; data: IUsuario }> {
    return this.http.post<{ message: string; data: IUsuario }>(`${this.apiUrl}/usuario/guardar`, usuario);
  }

  public Actualizar(usuario: IUsuario): Observable<{ message: string; data: IUsuario }> {
    return this.http.put<{ message: string; data: IUsuario }>(`${this.apiUrl}/usuario/actualizar`, usuario);
  }

  public Eliminar(id_usuario: number): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.apiUrl}/usuario/eliminar/${id_usuario}`);
  }
}
