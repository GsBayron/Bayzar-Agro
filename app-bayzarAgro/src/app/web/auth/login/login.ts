import { Component, OnInit, inject, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';

import { Auth } from '../../../shared/services/auth';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    CommonModule,
    RouterLink
  ],
  templateUrl: './login.html',
  styleUrl: './login.scss'
})
export class Login implements OnInit {

  private servicio = inject(Auth);
  private router = inject(Router);
  private ruta = inject(ActivatedRoute);

  public cargando = signal(false);
  public error = signal('');
  public mensajeSesion = '';

  public formulario = new FormGroup({
    acceso: new FormControl('', [
      Validators.required,
      Validators.maxLength(150)
    ]),

    secreto: new FormControl('', [
      Validators.required,
      Validators.maxLength(255)
    ])
  });

  public ngOnInit(): void {

    const sesion = this.ruta.snapshot.queryParamMap.get('sesion');

    if (sesion === 'expirada') {
      this.mensajeSesion = 'La sesión se cerró por inactividad.';
    }
  }

  public ingresar(): void {

    if (this.formulario.invalid) {
      this.formulario.markAllAsTouched();
      return;
    }

    this.cargando.set(true);
    this.error.set('');

    this.servicio.Login({
      acceso: this.formulario.value.acceso!,
      secreto: this.formulario.value.secreto!
    }).subscribe({

      next: (resp) => {

        this.servicio.guardarToken(resp.token);
        this.servicio.guardarUsuario(resp.usuario);

        this.cargando.set(false);

        this.router.navigate(['/app/inicio'], {
          replaceUrl: true
        });
      },

      error: (err) => {

        console.error(err);

        this.cargando.set(false);

        if (err.status === 403 && err.error?.motivo === 'cuenta_inactiva') {
          this.error.set(
            err.error.message || 'Su cuenta está pendiente de activación por pago.'
          );
          return;
        }

        if (err.status === 403) {
          this.error.set('Su cuenta está inactiva. Contacte al administrador.');
          return;
        }

        if (err.status === 401) {
          this.error.set('Usuario o contraseña incorrectos.');
          return;
        }

        this.error.set('No se pudo iniciar sesión. Inténtelo nuevamente.');
      }
    });
  }
}
