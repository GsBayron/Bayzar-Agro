import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';

import {
  ReactiveFormsModule,
  FormBuilder,
  Validators
} from '@angular/forms';

import {
  Router,
  RouterLink
} from '@angular/router';

import { MatDialog } from '@angular/material/dialog';

import { Finca } from '../../../shared/services/finca';
import { Mensaje } from '../../../shared/components/mensaje/mensaje';
import { Ifinca } from '../../../shared/interfaces/ifinca';

import { PROVINCIAS, CANTONES, DISTRITOS } from '../../../shared/data/costa-rica';
import { UNIDADES_AREA } from '../../../shared/data/unidades-area';

@Component({
  selector: 'app-guardar-finca',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink
  ],
  templateUrl: './guardar-finca.html',
  styleUrl: './guardar-finca.scss'
})
export class GuardarFinca {

  private fb = inject(FormBuilder);
  private servicio = inject(Finca);
  private router = inject(Router);
  private dialogo = inject(MatDialog);

  public obteniendoUbicacion = false;

  public form = this.fb.group({
    nombre: ['', [Validators.required, Validators.maxLength(100)]],
    ubicacion: ['', Validators.maxLength(200)],
    provincia: [''],
    canton: [''],
    distrito: [''],
    latitud: this.fb.control<number | null>(null, [Validators.min(-90), Validators.max(90)]),
    longitud: this.fb.control<number | null>(null, [Validators.min(-180), Validators.max(180)]),
    area: this.fb.control<number | null>(null, Validators.min(0)),
    unidad_area: ['Hectáreas'],
    descripcion: ['', Validators.maxLength(500)],
    estado: [true]
  });

  public provincias = PROVINCIAS;
  public cantones: string[] = [];
  public distritos: string[] = [];
  public unidadesArea = UNIDADES_AREA;

  public cambiarProvincia(): void {
    const provincia = this.form.value.provincia ?? '';

    this.cantones = CANTONES[provincia] ?? [];

    this.form.patchValue({
      canton: '',
      distrito: ''
    });
  }

  public cambiarCanton(): void {
    const provincia = this.form.value.provincia ?? '';
    const canton = this.form.value.canton ?? '';

    this.distritos = DISTRITOS[provincia]?.[canton] ?? [];

    this.form.patchValue({
      distrito: ''
    })
  }


  public guardar(): void {

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
        mensaje: '¿Desea guardar la finca?',
        confirmacion: true
      }
    }).afterClosed().subscribe((resultado: boolean) => {

      if (!resultado) return;

      const payload: Ifinca = {
        nombre: this.form.value.nombre ?? '',
        ubicacion: this.form.value.ubicacion,
        provincia: this.form.value.provincia,
        canton: this.form.value.canton,
        distrito: this.form.value.distrito,
        latitud: this.form.value.latitud,
        longitud: this.form.value.longitud,
        area: this.form.value.area,
        unidad_area: this.form.value.unidad_area,
        descripcion: this.form.value.descripcion,
        estado: this.form.value.estado ? 1 : 0
      };

      this.servicio.guardar(payload).subscribe({
        next: () => {
          this.mensajeExito('Finca guardada correctamente.');
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

  public obtenerUbicacionActual(): void {

    if (!navigator.geolocation) {
      this.mostrarMensaje(
        'Aviso',
        'El navegador no permite obtener la ubicación.',
        'error'
      );

      return;
    }

    this.obteniendoUbicacion = true;

    navigator.geolocation.getCurrentPosition(
      (posicion) => {

        const latitud = posicion.coords.latitude;
        const longitud = posicion.coords.longitude;

        this.form.patchValue({
          latitud: Number(latitud.toFixed(7)),
          longitud: Number(longitud.toFixed(7))
        });

        this.obteniendoUbicacion = false;

        this.mostrarMensaje(
          'Aviso',
          'Coordenadas obtenidas correctamente.',
          'exito'
        );
      },
      () => {

        this.obteniendoUbicacion = false;

        this.mostrarMensaje(
          'Error',
          
          'No se pudo obtener la ubicación. Revise los permisos del navegador.',
          
          'error'
        );
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    );
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

    this.router.navigate(['/app/fincas']);
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

  private mostrarMensaje(
    titulo: string,
    mensaje: string,
    tipo: 'exito' | 'error'
  ): void {

    this.dialogo.open(Mensaje, {
      width: '100%',
      maxWidth: '420px',
      data: {
        titulo,
        mensaje,
        tipo
      }
    });
  }
}
