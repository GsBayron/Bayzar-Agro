import {
  AfterViewInit,
  Component,
  OnInit,
  ViewChild,
  inject
} from '@angular/core';

import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';

import { MatDialog } from '@angular/material/dialog';

import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';

import { Actividad } from '../../../shared/services/actividad';
import { IActividad } from '../../../shared/interfaces/iactividad';
import { Mensaje } from '../../../shared/components/mensaje/mensaje';

@Component({
  selector: 'app-listar-actividad',
  standalone: true,
  imports: [
    RouterLink,
    FormsModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule
  ],
  templateUrl: './listar-actividad.html',
  styleUrl: './listar-actividad.scss'
})
export class ListarActividad implements OnInit, AfterViewInit {

  private servicio = inject(Actividad);
  private dialogo = inject(MatDialog);

  public columnas: string[] = [
    'id_actividad',
    'cultivo',
    'tipo_actividad',
    'fecha_programada',
    'estado_actividad',
    'prioridad',
    'producto',
    'estado',
    'acciones'
  ];

  public datos = new MatTableDataSource<IActividad>();

  @ViewChild(MatPaginator) public paginador!: MatPaginator;
  @ViewChild(MatSort) public ordenador!: MatSort;

  public actividadExpandida: IActividad | null = null;

  public filtroTexto: string = '';
  public filtroTipoActividad: string = '';
  public filtroEstadoActividad: string = '';
  public filtroPrioridad: string = '';
  public filtroVencida: string = '';

  public tiposActividad: string[] = [
    'Siembra',
    'Riego',
    'Fertilización',
    'Control de plagas',
    'Control de malezas',
    'Poda',
    'Limpieza',
    'Cosecha',
    'Mantenimiento',
    'Otra'
  ];

  public estadosActividad: string[] = [
    'Programada',
    'En proceso',
    'Realizada',
    'Cancelada'
  ];

  public prioridades: string[] = [
    'Baja',
    'Media',
    'Alta'
  ];

  public ngOnInit(): void {
    this.configurarFiltros();
    this.listar();
  }

  public ngAfterViewInit(): void {
    this.datos.paginator = this.paginador;
    this.datos.sort = this.ordenador;
  }

  public listar(): void {
    this.servicio.listar().subscribe({
      next: (resp: IActividad[]) => {
        this.datos.data = resp;

        this.datos.paginator = this.paginador;
        this.datos.sort = this.ordenador;

        this.configurarFiltros();
        this.aplicarFiltros();
      },
      error: (err) => {
        console.error(err);
        this.mensajeError('Error al cargar las actividades.');
      }
    });
  }

  public configurarFiltros(): void {
    this.datos.filterPredicate = (item: IActividad, filter: string): boolean => {
      let filtros: any;

      try {
        filtros = JSON.parse(filter);
      } catch {
        filtros = {
          texto: filter,
          tipoActividad: '',
          estadoActividad: '',
          prioridad: '',
          vencida: ''
        };
      }

      const texto = filtros.texto?.toLowerCase() || '';

      const textoActividad = `
        ${item.id_actividad || ''}
        ${item.cultivo?.nombre || ''}
        ${item.tipo_actividad || ''}
        ${item.fecha_programada || ''}
        ${item.estado_actividad || ''}
        ${item.prioridad || ''}
        ${item.responsable || ''}
        ${item.descripcion || ''}
        ${item.observaciones || ''}
        ${this.nombreProductoActividad(item) || ''}
      `.toLowerCase();

      const coincideTexto =
        !texto || textoActividad.includes(texto);

      const coincideTipo =
        !filtros.tipoActividad ||
        item.tipo_actividad === filtros.tipoActividad;

      const coincideEstado =
        !filtros.estadoActividad ||
        item.estado_actividad === filtros.estadoActividad;

      const coincidePrioridad =
        !filtros.prioridad ||
        item.prioridad === filtros.prioridad;

      const estaVencida = this.actividadVencida(item);

      const coincideVencida =
        !filtros.vencida ||
        filtros.vencida === '' ||
        (filtros.vencida === 'si' && estaVencida) ||
        (filtros.vencida === 'no' && !estaVencida);

      return (
        coincideTexto &&
        coincideTipo &&
        coincideEstado &&
        coincidePrioridad &&
        coincideVencida
      );
    };
  }

  public filtrar(event: Event): void {
    const valor = (event.target as HTMLInputElement).value;

    this.filtroTexto = valor.trim().toLowerCase();

    this.aplicarFiltros();
  }

  public aplicarFiltros(): void {
    const filtros = {
      texto: this.filtroTexto,
      tipoActividad: this.filtroTipoActividad,
      estadoActividad: this.filtroEstadoActividad,
      prioridad: this.filtroPrioridad,
      vencida: this.filtroVencida
    };

    this.datos.filter = JSON.stringify(filtros);

    this.actividadExpandida = null;

    if (this.datos.paginator) {
      this.datos.paginator.firstPage();
    }
  }

  public limpiarFiltros(): void {
    this.filtroTexto = '';
    this.filtroTipoActividad = '';
    this.filtroEstadoActividad = '';
    this.filtroPrioridad = '';
    this.filtroVencida = '';

    this.aplicarFiltros();
  }

  public actividadVencida(item: IActividad): boolean {
    if (
      item.estado_actividad === 'Realizada' ||
      item.estado_actividad === 'Cancelada'
    ) {
      return false;
    }

    if (!item.fecha_programada) {
      return false;
    }

    const hoy = new Date();
    const fecha = new Date(item.fecha_programada);

    hoy.setHours(0, 0, 0, 0);
    fecha.setHours(0, 0, 0, 0);

    return fecha < hoy;
  }

  public claseEstadoActividad(estado: string): string {
    if (estado === 'Realizada') return 'badge-agro success';
    if (estado === 'En proceso') return 'badge-agro neutral';
    if (estado === 'Programada') return 'badge-agro info';
    if (estado === 'Pendiente') return 'badge-agro warning';
    if (estado === 'Cancelada') return 'badge-agro danger';

    return 'badge-agro neutral';
  }

  public clasePrioridad(prioridad: string): string {
    if (prioridad === 'Alta') return 'badge-agro danger';
    if (prioridad === 'Media') return 'badge-agro warning';
    if (prioridad === 'Baja') return 'badge-agro success';

    return 'badge-agro neutral';
  }

  public nombreProducto(item: IActividad): string {
    return this.nombreProductoActividad(item);
  }

  public nombreProductoActividad(item: any): string {
    if (!item || !item.inventario) {
      return '-';
    }

    const inventario = item.inventario;

    if (inventario.nombre_manual) {
      return inventario.nombre_manual;
    }

    if (inventario.plaguicida) {
      return inventario.plaguicida.nombre_comercial
        || inventario.plaguicida.nombre
        || 'Plaguicida registrado';
    }

    if (inventario.fertilizante) {
      return inventario.fertilizante.nombre_comercial
        || inventario.fertilizante.nombre
        || 'Fertilizante registrado';
    }

    return '-';
  }

  public alternarDetalle(item: IActividad): void {
    this.actividadExpandida =
      this.actividadExpandida?.id_actividad === item.id_actividad
        ? null
        : item;
  }

  public eliminar(id_actividad: number): void {
    this.dialogo.open(Mensaje, {
      width: '100%',
      maxWidth: '420px',
      disableClose: true,
      data: {
        titulo: 'Confirmación',
        mensaje: '¿Está seguro de eliminar esta actividad?',
        confirmacion: true
      }
    }).afterClosed().subscribe((resultado: boolean) => {

      if (!resultado) return;

      this.servicio.eliminar(id_actividad).subscribe({
        next: () => {
          this.mensajeExito('Actividad eliminada correctamente.');
          this.listar();
        },
        error: (err) => {
          console.error(err);
          this.mensajeError('No se pudo eliminar la actividad.');
        }
      });

    });
  }

  private mensajeExito(texto: string): void {
    this.dialogo.open(Mensaje, {
      width: '100%',
      maxWidth: '420px',
      data: {
        titulo: 'Aviso',
        mensaje: texto,
        tipo: 'exito'
      }
    });
  }

  private mensajeError(texto: string): void {
    this.dialogo.open(Mensaje, {
      width: '100%',
      maxWidth: '420px',
      data: {
        titulo: 'Error',
        mensaje: texto,
        tipo: 'error'
      }
    });
  }
}