import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { Observable, of, tap } from 'rxjs';

import { environment } from '../../../environments/environment';
import { IDashboard } from '../interfaces/idashboard';

@Injectable({
  providedIn: 'root'
})
export class Dashboard {

  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl;

  private cache?: IDashboard;

  public consultar(forzar: boolean = false): Observable<IDashboard> {

    if (this.cache && !forzar) {
      return of(this.cache);
    }

    return this.http.get<IDashboard>(
      `${this.apiUrl}/dashboard`
    ).pipe(
      tap((resp: IDashboard) => {
        this.cache = resp;
      })
    );
  }

  public limpiarCache(): void {
    this.cache = undefined;
  }
}