import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';
import { ILogin } from '../interfaces/ilogin';
import { IRespuestaLogin } from '../interfaces/irespuesta-login';
import { IUsuario } from '../interfaces/iusuario';
import { IPerfil } from '../interfaces/iperfil';

interface IRespuestaPerfil {
  message: string;
  usuario: IUsuario;
}

@Injectable({
  providedIn: 'root'
})
export class Auth {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = environment.apiUrl;
  private readonly tokenKey = 'token';
  private readonly usuarioKey = 'usuario';

  public Login(datos: ILogin): Observable<IRespuestaLogin> {
    return this.http.post<IRespuestaLogin>(`${this.apiUrl}/login`, datos);
  }

  public Logout(): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/logout`, {});
  }

  public Perfil(): Observable<IUsuario> {
    return this.http.get<IUsuario>(`${this.apiUrl}/perfil`);
  }

  public ActualizarPerfil(datos: IPerfil): Observable<IRespuestaPerfil> {
    return this.http.put<IRespuestaPerfil>(`${this.apiUrl}/perfil`, datos);
  }

  public guardarToken(token: string): void {
    sessionStorage.setItem(this.tokenKey, token);
  }

  public obtenerToken(): string | null {
    return sessionStorage.getItem(this.tokenKey);
  }

  public eliminarToken(): void {
    sessionStorage.removeItem(this.tokenKey);
    sessionStorage.removeItem(this.usuarioKey);

    // Limpia sesiones creadas por versiones anteriores de la aplicación.
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.usuarioKey);
  }

  public guardarUsuario(usuario: IUsuario): void {
    sessionStorage.setItem(this.usuarioKey, JSON.stringify(usuario));
  }

  public obtenerUsuario(): IUsuario | null {
    const contenido = sessionStorage.getItem(this.usuarioKey);

    if (!contenido) {
      return null;
    }

    try {
      const usuario = JSON.parse(contenido) as Partial<IUsuario>;

      if (
        typeof usuario.id_usuario !== 'number'
        || !['Administrador', 'Agricultor'].includes(usuario.rol ?? '')
      ) {
        this.eliminarToken();
        return null;
      }

      return usuario as IUsuario;
    } catch {
      this.eliminarToken();
      return null;
    }
  }

  public estaAutenticado(): boolean {
    return Boolean(this.obtenerToken() && this.obtenerUsuario());
  }

  public obtenerRol(): string {
    return this.obtenerUsuario()?.rol ?? '';
  }

  public esAdministrador(): boolean {
    return this.obtenerRol() === 'Administrador';
  }

  public esAgricultor(): boolean {
    return this.obtenerRol() === 'Agricultor';
  }
}
