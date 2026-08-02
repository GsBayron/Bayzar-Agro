import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';

import {
  ReactiveFormsModule,
  FormBuilder,
  Validators
} from '@angular/forms';

import {
  ActivatedRoute,
  Router,
  RouterLink
} from '@angular/router';

import { MatDialog } from '@angular/material/dialog';

import { Cultivo } from '../../../shared/services/cultivo';
import { Finca } from '../../../shared/services/finca';

import { Ifinca } from '../../../shared/interfaces/ifinca';
import { ICultivo } from '../../../shared/interfaces/icultivo';

import { Mensaje } from '../../../shared/components/mensaje/mensaje';

import { TIPOS_CULTIVO } from '../../../shared/data/tipos-cultivo';
import { ESTADOS_CULTIVO } from '../../../shared/data/estados-cultivo';
import { UNIDADES_AREA } from '../../../shared/data/unidades-area';

@Component({
  selector: 'app-actualizar-cultivo',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink
  ],
  templateUrl: './actualizar-cultivo.html',
  styleUrl: './actualizar-cultivo.scss'
})
export class ActualizarCultivo implements OnInit {

  private fb = inject(FormBuilder);
  private servicio = inject(Cultivo);
  private servicioFinca = inject(Finca);
  private router = inject(Router);
  private ruta = inject(ActivatedRoute);
  private dialogo = inject(MatDialog);

  public id_cultivo = 0;

  public fincas: Ifinca[] = [];
  public tiposCultivo = TIPOS_CULTIVO;
  public estadosCultivo = ESTADOS_CULTIVO;
  public unidadesArea = UNIDADES_AREA;

  public form = this.fb.group({
    id_finca: [null, Validators.required],
    nombre: ['', [Validators.required, Validators.maxLength(100)]],
    tipo_cultivo: [''],
    variedad: [''],
    fecha_siembra: [''],
    fecha_estimada_cosecha: [''],
    area_sembrada: this.fb.control<number | null>(null, Validators.min(0)),
    cantidad_plantas: this.fb.control<number | null>(null, Validators.min(0)),
    distancia_siembra: ['', Validators.maxLength(80)],
    unidad_area: ['Hectáreas'],
    estado_cultivo: ['Sembrado', Validators.required],
    descripcion: ['', Validators.maxLength(255)],
    estado: [true]
  });

  public ngOnInit(): void {

    this.id_cultivo = Number(
      this.ruta.snapshot.paramMap.get('id')
    );

    this.listarFincas();
    this.consultar();
  }

  public listarFincas(): void {
    this.servicioFinca.listar().subscribe({
      next: (resp: Ifinca[]) => {
        this.fincas = resp;
      },
      error: (err) => {
        console.error(err);
        this.mensajeError('No se pudieron cargar las fincas.');
      }
    });
  }

  public consultar(): void {

    this.servicio.consultar(this.id_cultivo).subscribe({
      next: (resp: ICultivo) => {

        
        this.form.patchValue({
          id_finca: resp.id_finca as any,
          nombre: resp.nombre,
          tipo_cultivo: resp.tipo_cultivo,
          variedad: resp.variedad,
          fecha_siembra: resp.fecha_siembra,
          fecha_estimada_cosecha: resp.fecha_estimada_cosecha,
          area_sembrada: resp.area_sembrada ?? null,
          unidad_area: resp.unidad_area,
          cantidad_plantas: resp.cantidad_plantas ?? null,
          distancia_siembra: resp.distancia_siembra ? String(resp.distancia_siembra) : '',    
          estado_cultivo: resp.estado_cultivo,
          descripcion: resp.descripcion,
          estado: resp.estado === 1
        });

      },
      error: (err) => {        console.error(err);
        this.mensajeError('No se pudo consultar el cultivo.');
      }
    });
  }

  public actualizar(): void {

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.dialogo.open(Mensaje, {
      width: '100%',
      maxWidth: '420px',
      disableClose: true,
      data: {
        titulo: 'Confirmación',
        mensaje: '¿Desea actualizar el cultivo?',
        confirmacion: true
      }
    }).afterClosed().subscribe((resultado: boolean) => {

      if (!resultado) return;

      const payload = {
        id_finca: this.form.value.id_finca,
        nombre: this.form.value.nombre,
        tipo_cultivo: this.form.value.tipo_cultivo,
        variedad: this.form.value.variedad,
        fecha_siembra: this.form.value.fecha_siembra || null,
        fecha_estimada_cosecha: this.form.value.fecha_estimada_cosecha || null,
        area_sembrada: this.form.value.area_sembrada,
        cantidad_plantas: this.form.value.cantidad_plantas,
        distancia_siembra: this.form.value.distancia_siembra,
        unidad_area: this.form.value.unidad_area,
        estado_cultivo: this.form.value.estado_cultivo,
        descripcion: this.form.value.descripcion,
        estado: this.form.value.estado ? 1 : 0
      };

      this.servicio.actualizar(
        this.id_cultivo,
        payload as unknown as ICultivo
      ).subscribe({
        next: () => {
          this.mensajeExito('Cultivo actualizado correctamente.');
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

    this.router.navigate(['/app/cultivos']);
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
