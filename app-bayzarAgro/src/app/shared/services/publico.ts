import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';

import { IPlan } from '../interfaces/iplan';
import {
  IRegistro,
  IRespuestaRegistro
} from '../interfaces/iregistro';

@Injectable({
  providedIn: 'root'
})
export class Publico {

  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl;

  public listarPlanes(): Observable<IPlan[]> {
    return this.http.get<IPlan[]>(
      `${this.apiUrl}/public/planes`
    );
  }

  public registrar(datos: IRegistro): Observable<IRespuestaRegistro> {
    return this.http.post<IRespuestaRegistro>(
      `${this.apiUrl}/registro`,
      datos
    );
  }
}