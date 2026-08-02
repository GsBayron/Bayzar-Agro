import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';

import {
  ReactiveFormsModule,
  FormBuilder,
  Validators
} from '@angular/forms';

import { Router, RouterLink } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';

import { Actividad } from '../../../shared/services/actividad';
import { Cultivo } from '../../../shared/services/cultivo';
import { Inventario } from '../../../shared/services/inventario';

import { IActividad } from '../../../shared/interfaces/iactividad';
import { ICultivo } from '../../../shared/interfaces/icultivo';
import { IInventario } from '../../../shared/interfaces/iinventario';

import { Mensaje } from '../../../shared/components/mensaje/mensaje';

import { TIPOS_ACTIVIDAD } from '../../../shared/data/tipos-actividad';
import { ESTADOS_ACTIVIDAD } from '../../../shared/data/estados-actividad';
import { PRIORIDADES } from '../../../shared/data/prioridades';
import { UNIDADES_MEDIDA } from '../../../shared/data/unidades-medida';

@Component({
  selector: 'app-guardar-actividad',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink
  ],
  templateUrl: './guardar-actividad.html',
  styleUrl: './guardar-actividad.scss'
})
export class GuardarActividad implements OnInit {

  private fb = inject(FormBuilder);
  private servicio = inject(Actividad);
  private servicioCultivo = inject(Cultivo);
  private servicioInventario = inject(Inventario);
  private router = inject(Router);
  private dialogo = inject(MatDialog);

  public cultivos: ICultivo[] = [];
  public inventarios: IInventario[] = [];

  public tiposActividad = TIPOS_ACTIVIDAD;
  public estadosActividad = ESTADOS_ACTIVIDAD;
  public prioridades = PRIORIDADES;
  public unidadesMedida = UNIDADES_MEDIDA;

  public form = this.fb.group({
    id_cultivo: [null, Validators.required],
    id_inventario: [null],

    tipo_actividad: ['', Validators.required],

    fecha_programada: ['', Validators.required],
    fecha_realizacion: [''],

    estado_actividad: ['Programada', Validators.required],
    prioridad: ['Media', Validators.required],

    descripcion: [''],

    cantidad_producto: this.fb.control<number | null>(null),
    unidad_producto: [''],

    responsable: [''],
    observaciones: [''],

    estado: [true]
  });

  public ngOnInit(): void {
    this.listarCultivos();
    this.listarInventario();
  }

  public listarCultivos(): void {
    this.servicioCultivo.listar().subscribe({
      next: (resp: ICultivo[]) => {
        this.cultivos = resp;
      },
      error: (err) => {
        console.error(err);
        this.mensajeError('No se pudieron cargar los cultivos.');
      }
    });
  }

  public listarInventario(): void {
    this.servicioInventario.listar().subscribe({
      next: (resp: IInventario[]) => {
        this.inventarios = resp;
      },
      error: (err) => {
        console.error(err);
        this.mensajeError('No se pudo cargar el inventario.');
      }
    });
  }

  public mostrarProducto(): boolean {
    const tipo = this.form.value.tipo_actividad;

    return tipo === 'Fertilización'
      || tipo === 'Aplicación de plaguicida'
      || tipo === 'Control de malezas';
  }

  public mostrarFechaRealizacion(): boolean {
    return this.form.value.estado_actividad === 'Realizada';
  }

  public mostrarDescripcion(): boolean {
    const tipo = this.form.value.tipo_actividad;

    return tipo === 'Monitoreo'
      || tipo === 'Mantenimiento'
      || tipo === 'Otro'
      || tipo === 'Cosecha'
      || tipo === 'Siembra'
      || tipo === 'Poda';
  }

  public cambiarTipoActividad(): void {
    if (!this.mostrarProducto()) {
      this.form.patchValue({
        id_inventario: null,
        cantidad_producto: null,
        unidad_producto: ''
      });
    }
  }

  public cambiarEstadoActividad(): void {
    if (!this.mostrarFechaRealizacion()) {
      this.form.patchValue({
        fecha_realizacion: ''
      });
    }
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

  public guardar(): void {

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    if (
      this.mostrarProducto()
      &&
      !this.form.value.id_inventario
    ) {
      this.mensajeError('Debe seleccionar un producto del inventario.');
      return;
    }

    if (
      this.form.value.estado_actividad === 'Realizada'
      &&
      !this.form.value.fecha_realizacion
    ) {
      this.mensajeError('Debe ingresar la fecha de realización.');
      return;
    }

    this.dialogo.open(Mensaje, {
      width: '100%',
      maxWidth: '420px',
      disableClose: true,
      data: {
        titulo: 'Confirmación',
        mensaje: '¿Desea guardar la actividad?',
        confirmacion: true
      }
    }).afterClosed().subscribe((resultado: boolean) => {

      if (!resultado) return;

      const payload = {
        id_cultivo: this.form.value.id_cultivo,
        id_inventario: this.mostrarProducto()
          ? this.form.value.id_inventario
          : null,

        tipo_actividad: this.form.value.tipo_actividad,

        fecha_programada: this.form.value.fecha_programada,
        fecha_realizacion: this.form.value.fecha_realizacion || null,

        estado_actividad: this.form.value.estado_actividad,
        prioridad: this.form.value.prioridad,

        descripcion: this.form.value.descripcion,

        cantidad_producto: this.mostrarProducto()
          ? this.form.value.cantidad_producto
          : null,

        unidad_producto: this.mostrarProducto()
          ? this.form.value.unidad_producto
          : null,

        responsable: this.form.value.responsable,
        observaciones: this.form.value.observaciones,

        estado: this.form.value.estado ? 1 : 0
      };

      this.servicio.guardar(payload as unknown as IActividad).subscribe({
        next: () => {
          this.mensajeExito('Actividad guardada correctamente.');
        },
        error: (err) => {
          console.error(err);

          if (err.status === 422) {
            this.mensajeError('Datos inválidos. Revise los campos requeridos.');
            return;
          }

          this.mensajeError('Error interno del servidor.');
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

    this.router.navigate(['/app/actividades']);
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

  public get f() {
    return this.form.controls;
  }
}