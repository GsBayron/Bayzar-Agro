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

import { Finca } from '../../../shared/services/finca';
import { Mensaje } from '../../../shared/components/mensaje/mensaje';
import { Ifinca } from '../../../shared/interfaces/ifinca';

import { PROVINCIAS, CANTONES } from '../../../shared/data/costa-rica';
import { UNIDADES_AREA } from '../../../shared/data/unidades-area';

@Component({
  selector: 'app-actualizar-finca',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink
  ],
  templateUrl: './actualizar-finca.html',
  styleUrl: './actualizar-finca.scss'
})
export class ActualizarFinca implements OnInit {

  private fb = inject(FormBuilder);
  private servicio = inject(Finca);
  private router = inject(Router);
  private ruta = inject(ActivatedRoute);
  private dialogo = inject(MatDialog);

  public provincias = PROVINCIAS;
  public cantones: string[] = [];
  public unidadesArea = UNIDADES_AREA;

  public cambiarProvincia(): void {

    const provincia =
      this.form.value.provincia ?? '';

    this.cantones =
      CANTONES[provincia] ?? [];

    this.form.patchValue({
      canton: ''
    });
  }

  public id_finca = 0;

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

  public ngOnInit(): void {

    this.id_finca = Number(
      this.ruta.snapshot.paramMap.get('id')
    );

    this.consultar();
  }

  
  public consultar(): void {

    this.servicio.consultar(this.id_finca)
      .subscribe({

        next: (resp) => {

          this.cantones = CANTONES[resp.provincia ?? ''] ?? [];

          this.form.patchValue({

            nombre: resp.nombre,
            ubicacion: resp.ubicacion,
            provincia: resp.provincia,
            canton: resp.canton,
            distrito: resp.distrito,
            latitud: resp.latitud,
            longitud: resp.longitud,
            area: resp.area,
            unidad_area: resp.unidad_area,
            descripcion: resp.descripcion,
            estado: resp.estado === 1
          });

        },

        error: (err) => {

          console.error(err);

          this.mensajeError(
            'No se pudo consultar la finca.'
          );
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
        mensaje: '¿Desea actualizar la finca?',
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
        longitud: this.form.value.longitud,
        latitud: this.form.value.latitud,
        area: this.form.value.area,
        unidad_area: this.form.value.unidad_area,
        descripcion: this.form.value.descripcion,
        estado: this.form.value.estado ? 1 : 0
      };

      this.servicio.actualizar(
        this.id_finca,
        payload
      ).subscribe({

        next: () => {

          this.mensajeExito(
            'Finca actualizada correctamente.'
          );
        },

        error: (err) => {

          console.error(err);

          if (err.status === 422) {

            this.mensajeError(
              'Datos inválidos.'
            );

            return;
          }

          this.mensajeError(
            'Error interno del servidor.'
          );
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
}
