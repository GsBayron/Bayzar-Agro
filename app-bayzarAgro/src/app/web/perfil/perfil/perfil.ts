import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';

import { MatDialog, MatDialogModule } from '@angular/material/dialog';

import { Auth } from '../../../shared/services/auth';

import { IUsuario } from '../../../shared/interfaces/iusuario';
import { IPerfil } from '../../../shared/interfaces/iperfil';

import { Mensaje } from '../../../shared/components/mensaje/mensaje';

@Component({
  selector: 'app-perfil',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    ReactiveFormsModule,
    MatDialogModule
  ],
  templateUrl: './perfil.html',
  styleUrl: './perfil.scss'
})
export class Perfil implements OnInit {

  private fb = inject(FormBuilder);
  private auth = inject(Auth);
  private dialogo = inject(MatDialog);

  public cargando = false;
  public guardando = false;
  public usuario?: IUsuario;

  public form = this.fb.group({
    nombre: ['', Validators.required],
    apellidos: [''],
    correo: ['', [Validators.required, Validators.email]],
    telefono: [''],
    acceso: ['', Validators.required],
    secreto: [''],
    confirmar_secreto: ['']
  });

  public get f() {
    return this.form.controls;
  }

  public ngOnInit(): void {
    this.cargarPerfil();
  }

  public cargarPerfil(): void {

    this.cargando = true;

    this.auth.Perfil().subscribe({
      next: (resp: IUsuario) => {
        this.usuario = resp;

        this.form.patchValue({
          nombre: resp.nombre || '',
          apellidos: resp.apellidos || '',
          correo: resp.correo || '',
          telefono: resp.telefono || '',
          acceso: resp.acceso || '',
          secreto: '',
          confirmar_secreto: ''
        });

        this.cargando = false;
      },
      error: (err) => {
        console.error(err);

        this.cargando = false;

        this.mostrarMensaje(
          'Error',
          'No se pudo cargar la información del perfil.',
          'error'
        );
      }
    });
  }

  public actualizar(): void {

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const secreto = this.form.value.secreto || '';
    const confirmar = this.form.value.confirmar_secreto || '';

    if (secreto && secreto.length < 6) {
      this.mostrarMensaje(
        'Aviso',
        'La nueva contraseña debe tener al menos 6 caracteres.',
        'error'
      );

      return;
    }

    if (secreto !== confirmar) {
      this.mostrarMensaje(
        'Aviso',
        'La confirmación de contraseña no coincide.',
        'error'
      );

      return;
    }

    const dialogRef = this.dialogo.open(Mensaje, {
      width: '100%',
      maxWidth: '420px',
      disableClose: true,
      data: {
        titulo: 'Confirmación',
        mensaje: '¿Desea actualizar la información de su perfil?',
        confirmacion: true
      }
    });

    dialogRef.afterClosed().subscribe((resultado: boolean) => {

      if (!resultado) {
        return;
      }

      this.guardando = true;

      const datos = this.form.getRawValue();

      const payload: IPerfil = {
        nombre: datos.nombre || '',
        apellidos: datos.apellidos || '',
        correo: datos.correo || '',
        telefono: datos.telefono || '',
        acceso: datos.acceso || '',
        secreto: secreto || ''
      };

      this.auth.ActualizarPerfil(payload).subscribe({
        next: (resp) => {

          if (resp.usuario) {
            this.auth.guardarUsuario(resp.usuario);
            this.usuario = resp.usuario;
          }

          this.form.patchValue({
            secreto: '',
            confirmar_secreto: ''
          });

          this.guardando = false;

          this.mostrarMensaje(
            'Aviso',
            'Perfil actualizado correctamente.',
            'exito'
          );
        },
        error: (err) => {
          console.error(err);

          this.guardando = false;

          let mensaje = 'No se pudo actualizar el perfil.';

          if (err.status === 422) {
            mensaje = 'Revise los datos ingresados. El correo o usuario de acceso podrían estar repetidos.';
          }

          this.mostrarMensaje(
            'Error',
            mensaje,
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