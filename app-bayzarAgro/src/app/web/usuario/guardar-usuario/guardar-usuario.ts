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

import { Usuario } from '../../../shared/services/usuario';
import { Mensaje } from '../../../shared/components/mensaje/mensaje';
import { IUsuario } from '../../../shared/interfaces/iusuario';

@Component({
  selector: 'app-guardar-usuario',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink
  ],
  templateUrl: './guardar-usuario.html',
  styleUrl: './guardar-usuario.scss'
})
export class GuardarUsuario {

  // Dependencias
  private fb = inject(FormBuilder);
  private servicio = inject(Usuario);
  private router = inject(Router);
  private dialogo = inject(MatDialog);

  // Formulario
  public form = this.fb.group({

    nombre: ['', Validators.required],

    apellidos: ['', Validators.required],

    correo: ['', [
      Validators.required,
      Validators.email
    ]],

    telefono: [''],

    acceso: ['', Validators.required],

    secreto: ['', [
      Validators.required,
      Validators.minLength(8),
      Validators.maxLength(255)
    ]],

    rol: ['Agricultor', Validators.required],

    estado: [true]
  });

  // Guardar usuario
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
        mensaje: '¿Desea guardar el usuario?',
        confirmacion: true
      }

    }).afterClosed().subscribe((resultado: boolean) => {

      if (!resultado) return;

      const datos = this.form.getRawValue();
      const payload: IUsuario = {

        nombre: datos.nombre ?? '',
        apellidos: datos.apellidos ?? '',
        correo: datos.correo ?? '',
        telefono: datos.telefono ?? '',
        acceso: datos.acceso ?? '',
        secreto: datos.secreto ?? '',
        rol: datos.rol ?? 'Agricultor',
        estado: Boolean(datos.estado)
      };

      this.servicio.Guardar(payload)
        .subscribe({

          next: () => {


            this.mensajeExito(
              'Usuario guardado correctamente.'
            );
          },

          error: (err) => {

            console.error(err);

            if (err.status === 422) {

              this.mensajeError(
                'Datos inválidos o usuario ya registrado.'
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

  // Mensaje éxito
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

    this.router.navigate(['/app/usuarios']);
  }

  // Mensaje error
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

  // Getter formulario
  public get f() {

    return this.form.controls;
  }
}
