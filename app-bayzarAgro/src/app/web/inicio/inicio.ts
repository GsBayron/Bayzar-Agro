import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';

import { Dashboard } from '../../shared/services/dashboard';
import { Auth } from '../../shared/services/auth';
import { FormsModule } from '@angular/forms';

import { IDashboard } from '../../shared/interfaces/idashboard';
import { IInventario } from '../../shared/interfaces/iinventario';
import { IPlagaCultivo } from '../../shared/interfaces/iplaga-cultivo';

import { Finca } from '../../shared/services/finca';
import { Clima } from '../../shared/services/clima';

import { Ifinca } from '../../shared/interfaces/ifinca';
import { IClima } from '../../shared/interfaces/iclima';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-inicio',
  standalone: true,

  imports: [
    CommonModule, RouterLink, FormsModule
  ],

  templateUrl: './inicio.html',
  styleUrl: './inicio.scss'
})
export class Inicio implements OnInit {

  private servicio = inject(Dashboard);
  private cd = inject(ChangeDetectorRef);
  private auth = inject(Auth);
  private servicioFinca = inject(Finca);
  private servicioClima = inject(Clima);

  public datos?: IDashboard;
  public usuario = this.auth.obtenerUsuario();

  public cargando = false;
  public error = '';

  public fincas: Ifinca[] = [];
  public idFincaSeleccionada: number | null = null;
  public clima?: IClima;
  public cargandoClima = false;
  public errorClima = '';

  public ngOnInit(): void {
    this.consultar();
    this.listarFincas();
  }

  public consultar(): void {

    this.cargando = true;
    this.error = '';

    this.servicio.consultar().subscribe({
      next: (resp: IDashboard) => {
        this.datos = {
          ...resp,
          actividades_hoy: Number(resp.actividades_hoy ?? 0),
          actividades_vencidas: Number(resp.actividades_vencidas ?? 0),
          productos_por_vencer: Number(resp.productos_por_vencer ?? 0),
          total_costos: Number(resp.total_costos ?? 0),
          total_ingresos: Number(resp.total_ingresos ?? 0),
          ganancia_estimada: Number(resp.ganancia_estimada ?? 0),
          registros_produccion: Number(resp.registros_produccion ?? 0),
          alertas_criticas: Number(resp.alertas_criticas ?? 0),
          ultimos_costos: Array.isArray(resp.ultimos_costos) ? resp.ultimos_costos : [],
          ultimos_ingresos: Array.isArray(resp.ultimos_ingresos) ? resp.ultimos_ingresos : [],
          ultimas_producciones: Array.isArray(resp.ultimas_producciones) ? resp.ultimas_producciones : [],
          proximas_actividades: Array.isArray(resp.proximas_actividades) ? resp.proximas_actividades : [],
          plagas_criticas: Array.isArray(resp.plagas_criticas) ? resp.plagas_criticas : [],
          productos_vencen_pronto: Array.isArray(resp.productos_vencen_pronto) ? resp.productos_vencen_pronto : [],
          ingresos_por_agricultor: Array.isArray(resp.ingresos_por_agricultor) ? resp.ingresos_por_agricultor : []
        };
        this.cargando = false;

        this.cd.detectChanges();
      },
      error: (err) => {
        console.error('Error dashboard:', err);

        this.error = 'No se pudo cargar la información del dashboard.';
        this.cargando = false;

        this.cd.detectChanges();
      }
    });
  }

  public esAdministrador(): boolean {
    return this.usuario?.rol === 'Administrador';
  }

  public esAgricultor(): boolean {
    return this.usuario?.rol === 'Agricultor';
  }

  public nombreProducto(item: IInventario): string {
    if (item.plaguicida) {
      return item.plaguicida.nombre_comercial;
    }

    if (item.fertilizante) {
      return item.fertilizante.nombre_comercial;
    }

    return item.nombre_manual || 'Producto sin nombre';
  }

  public nombrePlaga(item: IPlagaCultivo): string {
    if (item.plaga) {
      return item.plaga.nombre_cientifico
        ? `${item.plaga.nombre_comun} (${item.plaga.nombre_cientifico})`
        : item.plaga.nombre_comun;
    }

    return item.nombre_manual || 'Plaga sin nombre';
  }

  public clasePrioridad(prioridad: string | null | undefined): string {
    if (prioridad === 'Alta') return 'bg-danger';
    if (prioridad === 'Baja') return 'bg-success';

    return 'bg-warning text-dark';
  }

  public claseEstadoActividad(estado: string | null | undefined): string {
    if (estado === 'Realizada') return 'bg-success';
    if (estado === 'Pendiente') return 'bg-warning text-dark';
    if (estado === 'Cancelada') return 'bg-secondary';

    return 'bg-primary';
  }

  public listarFincas(): void {

    this.servicioFinca.listar().subscribe({
      next: (resp: Ifinca[]) => {
        this.fincas = Array.isArray(resp) ? resp : [];

        if (this.fincas.length > 0) {
          this.idFincaSeleccionada = this.fincas[0].id_finca ?? null;

          if (this.idFincaSeleccionada) {
            this.consultarClima();
          }
        }
      },
      error: (err) => {
        console.error(err);
        this.errorClima = 'No se pudieron cargar las fincas para consultar el clima.';
      }
    });
  }

  public consultarClima(): void {

    if (!this.idFincaSeleccionada) {
      this.clima = undefined;
      this.errorClima = 'Seleccione una finca para consultar el clima.';
      return;
    }

    this.cargandoClima = true;
    this.errorClima = '';

    this.servicioClima.consultarPorFinca(
      this.idFincaSeleccionada
    ).subscribe({
      next: (resp: IClima) => {
        this.clima = resp;
        this.cargandoClima = false;
      },
      error: (err) => {
        console.error(err);

        this.clima = undefined;
        this.cargandoClima = false;

        if (err.status === 422) {
          this.errorClima = 'La finca seleccionada no tiene latitud y longitud registradas.';
          return;
        }

        this.errorClima = 'No se pudo consultar el clima de la finca.';
      }
    });
  }

  public claseClima(): string {

    if (!this.clima) {
      return 'bg-secondary';
    }

    const probabilidad =
      this.clima.clima_actual.probabilidad_lluvia ?? 0;

    const viento =
      this.clima.clima_actual.viento ?? 0;

    const humedad =
      this.clima.clima_actual.humedad ?? 0;

    if (probabilidad >= 60) {
      return 'bg-danger';
    }

    if (viento >= 25 || humedad >= 85) {
      return 'bg-warning text-dark';
    }

    return 'bg-success';
  }

  public formatoMoneda(monto: number | null | undefined): string {

    const valor = Number(monto || 0);

    return valor.toLocaleString('es-CR', {
      style: 'currency',
      currency: 'CRC',
      minimumFractionDigits: 2
    });
  }
}
