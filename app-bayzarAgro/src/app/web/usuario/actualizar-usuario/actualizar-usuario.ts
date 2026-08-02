import { Component, inject, OnInit } from '@angular/core';
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

import { Usuario } from '../../../shared/services/usuario';
import { Mensaje } from '../../../shared/components/mensaje/mensaje';
import { IUsuario } from '../../../shared/interfaces/iusuario';

@Component({
  selector: 'app-actualizar-usuario',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink
  ],
  templateUrl: './actualizar-usuario.html',
  styleUrl: './actualizar-usuario.scss'
})
export class ActualizarUsuario implements OnInit {

  // Dependencias
  private fb = inject(FormBuilder);
  private servicio = inject(Usuario);
  private router = inject(Router);
  private ruta = inject(ActivatedRoute);
  private dialogo = inject(MatDialog);

  // ID usuario
  public id_usuario = 0;

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

    secreto: ['', [Validators.minLength(8), Validators.maxLength(255)]],

    rol: ['Agricultor', Validators.required],

    estado: [true]
  });

  // Inicio componente
  public ngOnInit(): void {

    this.id_usuario = Number(
      this.ruta.snapshot.paramMap.get('id')
    );

    this.consultar();
  }

  // Consultar usuario
  public consultar(): void {

    this.servicio.Consultar(this.id_usuario)
      .subscribe({

        next: (resp: IUsuario) => {


          this.form.patchValue({

            nombre: resp.nombre,
            apellidos: resp.apellidos,
            correo: resp.correo,
            telefono: resp.telefono,
            acceso: resp.acceso,
            rol: resp.rol,
            estado: Boolean(resp.estado)
          });
        },

        error: (err) => {

          console.error(err);

          this.mensajeError(
            'No se pudo consultar el usuario.'
          );
        }
      });
  }

  // Actualizar usuario
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
        mensaje: '¿Desea actualizar el usuario?',
        confirmacion: true
      }

    }).afterClosed().subscribe((resultado: boolean) => {

      if (!resultado) return;

      const datos = this.form.getRawValue();
      const payload: IUsuario = {

        id_usuario: this.id_usuario,

        nombre: datos.nombre ?? '',
        apellidos: datos.apellidos ?? '',
        correo: datos.correo ?? '',
        telefono: datos.telefono ?? '',
        acceso: datos.acceso ?? '',
        secreto: datos.secreto || undefined,
        rol: datos.rol ?? 'Agricultor',
        estado: Boolean(datos.estado)
      };


      this.servicio.Actualizar(payload)
        .subscribe({

          next: () => {


            this.mensajeExito(
              'Usuario actualizado correctamente.'
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
