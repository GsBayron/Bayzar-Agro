import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';

import { MatDialog, MatDialogModule } from '@angular/material/dialog';

import { FertilizanteRegistrado } from '../../../shared/services/fertilizante-registrado';
import { IFertilizanteRegistrado } from '../../../shared/interfaces/ifertilizante-registrado';

import { Mensaje } from '../../../shared/components/mensaje/mensaje';

@Component({
  selector: 'app-guardar-fertilizante-registrado',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    ReactiveFormsModule,
    MatDialogModule
  ],
  templateUrl: './guardar-fertilizante-registrado.html',
  styleUrl: './guardar-fertilizante-registrado.scss'
})
export class GuardarFertilizanteRegistrado {

  private fb = inject(FormBuilder);
  private servicio = inject(FertilizanteRegistrado);
  private router = inject(Router);
  private dialogo = inject(MatDialog);

  public form = this.fb.group({
    numero_registro: [''],
    nombre_comercial: ['', Validators.required],
    composicion: [''],
    tipo_fertilizante: [''],
    fabricante: [''],
    estado_registro: ['Vigente'],
    fuente: ['Registro manual'],
    estado: [true]
  });

  public get f() {
    return this.form.controls;
  }

  public guardar(): void {

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const dialogRef = this.dialogo.open(Mensaje, {
      width: '100%',
      maxWidth: '420px',
      disableClose: true,
      data: {
        titulo: 'Confirmación',
        mensaje: '¿Desea guardar el fertilizante registrado?',
        confirmacion: true
      }
    });

    dialogRef.afterClosed().subscribe((resultado: boolean) => {

      if (!resultado) {
        return;
      }

      const datos = this.form.getRawValue();

      const payload: IFertilizanteRegistrado = {
        numero_registro: datos.numero_registro,
        nombre_comercial: datos.nombre_comercial || '',
        composicion: datos.composicion,
        tipo_fertilizante: datos.tipo_fertilizante,
        fabricante: datos.fabricante,
        estado_registro: datos.estado_registro,
        fuente: datos.fuente,
        estado: datos.estado ? 1 : 0
      };

      this.servicio.guardar(payload).subscribe({
        next: () => {
          this.mostrarMensaje(
            'Aviso',
            'Fertilizante guardado correctamente.',
            'exito'
          );

          this.router.navigate(['/app/fertilizantes-registrados']);
        },
        error: (err) => {
          console.error(err);

          this.mostrarMensaje(
            'Error',
            'No se pudo guardar el fertilizante.',
            'error'
          );
        }
      });
    });
  }

  private mostrarMensaje(
    titulo: string,
    mensaje: string,
    tipo: string
  ): void {

    this.dialogo.open(Mensaje, {
      width: '100%',
      maxWidth: '420px',
      data: {
        titulo: titulo,
        mensaje: mensaje,
        tipo: tipo
      }
    });
  }
}