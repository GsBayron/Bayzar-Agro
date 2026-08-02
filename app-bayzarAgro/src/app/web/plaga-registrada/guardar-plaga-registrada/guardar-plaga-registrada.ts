import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';

import { MatDialog, MatDialogModule } from '@angular/material/dialog';

import { PlagaRegistrada } from '../../../shared/services/plaga-registrada';
import { IPlagaRegistrada } from '../../../shared/interfaces/iplaga-registrada';

import { Mensaje } from '../../../shared/components/mensaje/mensaje';

@Component({
  selector: 'app-guardar-plaga-registrada',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    ReactiveFormsModule,
    MatDialogModule
  ],
  templateUrl: './guardar-plaga-registrada.html',
  styleUrl: './guardar-plaga-registrada.scss'
})
export class GuardarPlagaRegistrada {

  private fb = inject(FormBuilder);
  private servicio = inject(PlagaRegistrada);
  private router = inject(Router);
  private dialogo = inject(MatDialog);

  public tiposPlaga: string[] = [
    'Insecto',
    'Hongo',
    'Bacteria',
    'Virus',
    'Ácaro',
    'Nematodo',
    'Maleza',
    'Otro'
  ];

  public form = this.fb.group({
    nombre_comun: ['', Validators.required],
    nombre_cientifico: [''],
    tipo_plaga: [''],
    descripcion: [''],
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
        mensaje: '¿Desea guardar la plaga registrada?',
        confirmacion: true
      }
    });

    dialogRef.afterClosed().subscribe((resultado: boolean) => {

      if (!resultado) {
        return;
      }

      const datos = this.form.getRawValue();

      const payload: IPlagaRegistrada = {
        nombre_comun: datos.nombre_comun || '',
        nombre_cientifico: datos.nombre_cientifico,
        tipo_plaga: datos.tipo_plaga,
        descripcion: datos.descripcion,
        fuente: datos.fuente,
        estado: datos.estado ? 1 : 0
      };

      this.servicio.guardar(payload).subscribe({
        next: () => {
          this.mostrarMensaje(
            'Aviso',
            'Plaga guardada correctamente.',
            'exito'
          );

          this.router.navigate(['/app/plagas-registradas']);
        },
        error: (err) => {
          console.error(err);

          this.mostrarMensaje(
            'Error',
            'No se pudo guardar la plaga.',
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