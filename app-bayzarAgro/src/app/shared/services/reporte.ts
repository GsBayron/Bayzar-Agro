import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';

import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';

import {
  IReporteFinanciero,
  IReporteFiltros
} from '../interfaces/ireporte-financiero';

@Injectable({
  providedIn: 'root'
})
export class Reporte {

  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl;

  public financiero(filtros: IReporteFiltros): Observable<IReporteFinanciero> {

    let params = new HttpParams();

    if (filtros.fecha_inicio) {
      params = params.set('fecha_inicio', filtros.fecha_inicio);
    }

    if (filtros.fecha_fin) {
      params = params.set('fecha_fin', filtros.fecha_fin);
    }

    if (filtros.id_usuario) {
      params = params.set('id_usuario', filtros.id_usuario);
    }

    if (filtros.id_finca) {
      params = params.set('id_finca', filtros.id_finca);
    }

    if (filtros.id_cultivo) {
      params = params.set('id_cultivo', filtros.id_cultivo);
    }

    return this.http.get<IReporteFinanciero>(
      `${this.apiUrl}/reportes/financiero`,
      {
        params: params
      }
    );
  }
}