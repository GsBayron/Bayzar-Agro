import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';
import { IAlerta } from '../interfaces/ialerta';

@Injectable({
  providedIn: 'root'
})
export class Alerta {

  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl;

  public listar(): Observable<IAlerta[]> {
    return this.http.get<IAlerta[]>(
      `${this.apiUrl}/alertas`
    );
  }
}