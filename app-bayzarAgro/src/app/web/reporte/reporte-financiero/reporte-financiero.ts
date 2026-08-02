import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  AbstractControl,
  ReactiveFormsModule,
  FormBuilder,
  ValidationErrors,
  ValidatorFn
} from '@angular/forms';

import { forkJoin } from 'rxjs';

import { Reporte } from '../../../shared/services/reporte';
import { Finca } from '../../../shared/services/finca';
import { Cultivo } from '../../../shared/services/cultivo';
import { Usuario } from '../../../shared/services/usuario';
import { Auth } from '../../../shared/services/auth';

import {
  IReporteFinanciero,
  IReporteFiltros
} from '../../../shared/interfaces/ireporte-financiero';

import { Ifinca } from '../../../shared/interfaces/ifinca';
import { ICultivo } from '../../../shared/interfaces/icultivo';
import { IUsuario } from '../../../shared/interfaces/iusuario';

const rangoFechasValidator: ValidatorFn = (
  control: AbstractControl
): ValidationErrors | null => {
  const inicio = control.get('fecha_inicio')?.value;
  const fin = control.get('fecha_fin')?.value;

  if (!inicio || !fin) {
    return null;
  }

  return fin < inicio
    ? { rangoFechasInvalido: true }
    : null;
};

@Component({
  selector: 'app-reporte-financiero',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule
  ],
  templateUrl: './reporte-financiero.html',
  styleUrl: './reporte-financiero.scss'
})
export class ReporteFinanciero implements OnInit {

  private fb = inject(FormBuilder);
  private servicio = inject(Reporte);
  private servicioFinca = inject(Finca);
  private servicioCultivo = inject(Cultivo);
  private servicioUsuario = inject(Usuario);
  private auth = inject(Auth);

  public cargando = false;
  public error = '';

  public datos?: IReporteFinanciero;

  public fincas: Ifinca[] = [];
  public cultivos: ICultivo[] = [];
  public cultivosFiltrados: ICultivo[] = [];
  public usuarios: IUsuario[] = [];

  public form = this.fb.group(
    {
      fecha_inicio: [''],
      fecha_fin: [''],
      id_usuario: this.fb.control<number | null>(null),
      id_finca: this.fb.control<number | null>(null),
      id_cultivo: this.fb.control<number | null>(null)
    },
    {
      validators: rangoFechasValidator
    }
  );

  public ngOnInit(): void {
    this.cargarDatosIniciales();
  }

  public esAdministrador(): boolean {
    return this.auth.esAdministrador();
  }

  public cargarDatosIniciales(): void {

    this.cargando = true;
    this.error = '';

    if (this.esAdministrador()) {

      forkJoin({
        fincas: this.servicioFinca.listar(),
        cultivos: this.servicioCultivo.listar(),
        usuarios: this.servicioUsuario.Listar()
      }).subscribe({
        next: (resp) => {
          this.fincas = resp.fincas;
          this.cultivos = resp.cultivos;

          this.usuarios = resp.usuarios.filter(usuario => usuario.rol === 'Agricultor');

          this.consultar();
        },
        error: (err) => {
          console.error(err);
          this.cargando = false;
          this.error = 'No se pudieron cargar los filtros del reporte.';
        }
      });

      return;
    }

    forkJoin({
      fincas: this.servicioFinca.listar(),
      cultivos: this.servicioCultivo.listar()
    }).subscribe({
      next: (resp) => {
        this.fincas = resp.fincas;
        this.cultivos = resp.cultivos;
        this.consultar();
      },
      error: (err) => {
        console.error(err);
        this.cargando = false;
        this.error = 'No se pudieron cargar los filtros del reporte.';
      }
    });
  }

  public cambiarFinca(): void {

    const idFinca = Number(this.form.value.id_finca || 0);

    if (idFinca > 0) {
      this.cultivosFiltrados = this.cultivos.filter(
        cultivo => cultivo.id_finca === idFinca
      );
    } else {
      this.cultivosFiltrados = [];
    }

    this.form.patchValue({
      id_cultivo: null
    });
  }

  public consultar(): void {

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.cargando = true;
    this.error = '';

    const valores = this.form.getRawValue();

    const filtros: IReporteFiltros = {
      fecha_inicio: valores.fecha_inicio || null,
      fecha_fin: valores.fecha_fin || null,
      id_usuario: valores.id_usuario,
      id_finca: valores.id_finca,
      id_cultivo: valores.id_cultivo
    };

    this.servicio.financiero(filtros).subscribe({
      next: (resp: IReporteFinanciero) => {
        this.datos = {
          ...resp,
          resumen: {
            total_ingresos: Number(resp.resumen?.total_ingresos ?? 0),
            total_costos: Number(resp.resumen?.total_costos ?? 0),
            ganancia_estimada: Number(resp.resumen?.ganancia_estimada ?? 0),
            margen_ganancia: Number(resp.resumen?.margen_ganancia ?? 0),
            cantidad_ingresos: Number(resp.resumen?.cantidad_ingresos ?? 0),
            cantidad_costos: Number(resp.resumen?.cantidad_costos ?? 0),
            cantidad_producciones: Number(resp.resumen?.cantidad_producciones ?? 0)
          },
          ingresos_por_cultivo: Array.isArray(resp.ingresos_por_cultivo) ? resp.ingresos_por_cultivo : [],
          costos_por_cultivo: Array.isArray(resp.costos_por_cultivo) ? resp.costos_por_cultivo : [],
          costos_por_tipo: Array.isArray(resp.costos_por_tipo) ? resp.costos_por_tipo : [],
          produccion_por_cultivo: Array.isArray(resp.produccion_por_cultivo) ? resp.produccion_por_cultivo : [],
          ultimos_ingresos: Array.isArray(resp.ultimos_ingresos) ? resp.ultimos_ingresos : [],
          ultimos_costos: Array.isArray(resp.ultimos_costos) ? resp.ultimos_costos : [],
          ultimas_producciones: Array.isArray(resp.ultimas_producciones) ? resp.ultimas_producciones : []
        };
        this.cargando = false;
      },
      error: (err) => {
        console.error(err);
        this.cargando = false;
        this.error = 'No se pudo generar el reporte financiero.';
      }
    });
  }

  public limpiarFiltros(): void {

    this.form.reset({
      fecha_inicio: '',
      fecha_fin: '',
      id_usuario: null,
      id_finca: null,
      id_cultivo: null
    });

    this.cultivosFiltrados = [];

    this.consultar();
  }

  public formatoMoneda(monto: number | string | null | undefined): string {

    const valor = Number(monto || 0);

    return valor.toLocaleString('es-CR', {
      style: 'currency',
      currency: 'CRC',
      minimumFractionDigits: 2
    });
  }

  public formatoNumero(valor: number | string | null | undefined): string {

    return Number(valor || 0).toLocaleString('es-CR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  }

  public claseGanancia(): string {

    const ganancia = Number(this.datos?.resumen.ganancia_estimada || 0);

    if (ganancia > 0) {
      return 'text-success';
    }

    if (ganancia < 0) {
      return 'text-danger';
    }

    return 'text-muted';
  }

  public exportarPDF(): void {

    setTimeout(() => {
      window.print();
    }, 300);
  }

  public exportarCSV(): void {

    if (!this.datos) {
      return;
    }

    const filas: string[][] = [];

    filas.push([
      'REPORTE FINANCIERO BAYZARAGRO'
    ]);

    filas.push([]);

    filas.push([
      'Resumen general'
    ]);

    filas.push([
      'Total ingresos',
      String(this.datos.resumen.total_ingresos)
    ]);

    filas.push([
      'Total costos',
      String(this.datos.resumen.total_costos)
    ]);

    filas.push([
      'Ganancia estimada',
      String(this.datos.resumen.ganancia_estimada)
    ]);

    filas.push([
      'Margen ganancia (%)',
      String(this.datos.resumen.margen_ganancia)
    ]);

    filas.push([]);

    filas.push([
      'INGRESOS POR CULTIVO'
    ]);

    filas.push([
      'Cultivo',
      'Finca',
      'Cantidad ingresos',
      'Total ingresos'
    ]);

    this.datos.ingresos_por_cultivo.forEach(item => {
      filas.push([
        item.cultivo || 'Sin cultivo',
        item.finca || 'Sin finca',
        String(item.cantidad_ingresos),
        String(item.total_ingresos)
      ]);
    });

    filas.push([]);

    filas.push([
      'COSTOS POR CULTIVO'
    ]);

    filas.push([
      'Cultivo',
      'Finca',
      'Cantidad costos',
      'Total costos'
    ]);

    this.datos.costos_por_cultivo.forEach(item => {
      filas.push([
        item.cultivo || 'Sin cultivo',
        item.finca || 'Sin finca',
        String(item.cantidad_costos),
        String(item.total_costos)
      ]);
    });

    filas.push([]);

    filas.push([
      'COSTOS POR TIPO'
    ]);

    filas.push([
      'Tipo costo',
      'Cantidad costos',
      'Total costos'
    ]);

    this.datos.costos_por_tipo.forEach(item => {
      filas.push([
        item.tipo_costo || 'Sin tipo',
        String(item.cantidad_costos),
        String(item.total_costos)
      ]);
    });

    filas.push([]);

    filas.push([
      'PRODUCCIÓN POR CULTIVO'
    ]);

    filas.push([
      'Cultivo',
      'Finca',
      'Total producido',
      'Unidad',
      'Registros'
    ]);

    this.datos.produccion_por_cultivo.forEach(item => {
      filas.push([
        item.cultivo || 'Sin cultivo',
        item.finca || 'Sin finca',
        String(item.total_producido),
        item.unidad_medida || '',
        String(item.cantidad_registros)
      ]);
    });

    const contenido = filas
      .map(fila =>
        fila
          .map(valor => `"${String(valor).replace(/"/g, '""')}"`)
          .join(',')
      )
      .join('\n');

    const blob = new Blob(
      ['\ufeff' + contenido],
      {
        type: 'text/csv;charset=utf-8;'
      }
    );

    const url = window.URL.createObjectURL(blob);

    const enlace = document.createElement('a');

    enlace.href = url;
    enlace.download = 'reporte-financiero-bayzaragro.csv';
    enlace.click();

    window.URL.revokeObjectURL(url);
  }

}
