import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';

import { MatDialog, MatDialogModule } from '@angular/material/dialog';

import { PlaguicidaRegistrado } from '../../../shared/services/plaguicida-registrado';
import { IPlaguicidaRegistrado } from '../../../shared/interfaces/iplaguicida-registrado';

import { Mensaje } from '../../../shared/components/mensaje/mensaje';

@Component({
  selector: 'app-guardar-plaguicida-registrado',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    ReactiveFormsModule,
    MatDialogModule
  ],
  templateUrl: './guardar-plaguicida-registrado.html',
  styleUrl: './guardar-plaguicida-registrado.scss'
})
export class GuardarPlaguicidaRegistrado {

  private fb = inject(FormBuilder);
  private servicio = inject(PlaguicidaRegistrado);
  private router = inject(Router);
  private dialogo = inject(MatDialog);

  public form = this.fb.group({
    numero_registro: [''],
    nombre_comercial: ['', Validators.required],
    ingrediente_activo: [''],
    tipo_plaguicida: [''],
    cultivo_autorizado: [''],
    plaga_objetivo: [''],
    titular: [''],
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
        mensaje: '¿Desea guardar el plaguicida registrado?',
        confirmacion: true
      }
    });

    dialogRef.afterClosed().subscribe((resultado: boolean) => {

      if (!resultado) {
        return;
      }

      const datos = this.form.getRawValue();

      const payload: IPlaguicidaRegistrado = {
        numero_registro: datos.numero_registro,
        nombre_comercial: datos.nombre_comercial || '',
        ingrediente_activo: datos.ingrediente_activo,
        tipo_plaguicida: datos.tipo_plaguicida,
        cultivo_autorizado: datos.cultivo_autorizado,
        plaga_objetivo: datos.plaga_objetivo,
        titular: datos.titular,
        estado_registro: datos.estado_registro,
        fuente: datos.fuente,
        estado: datos.estado ? 1 : 0
      };

      this.servicio.guardar(payload).subscribe({
        next: () => {
          this.mostrarMensaje(
            'Aviso',
            'Plaguicida guardado correctamente.',
            'exito'
          );

          this.router.navigate(['/app/plaguicidas-registrados']);
        },
        error: (err) => {
          console.error(err);

          this.mostrarMensaje(
            'Error',
            'No se pudo guardar el plaguicida.',
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