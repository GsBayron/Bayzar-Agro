import { Injectable, inject } from '@angular/core';
import { Router } from '@angular/router';

import { Auth } from './auth';

@Injectable({
  providedIn: 'root'
})
export class Inactividad {

  private auth = inject(Auth);
  private router = inject(Router);

  private tiempoLimite = 10 * 60 * 1000; // 10 minutos
  private temporizador: any;
  private activo = false;

  private eventos: string[] = [
    'mousemove',
    'keydown',
    'click',
    'scroll',
    'touchstart'
  ];

  private reiniciarTemporizador = (): void => {

    if (!this.auth.estaAutenticado()) {
      return;
    }

    clearTimeout(this.temporizador);

    this.temporizador = setTimeout(() => {
      this.cerrarSesionPorInactividad();
    }, this.tiempoLimite);
  };

  public iniciar(): void {

    if (this.activo) {
      return;
    }

    if (!this.auth.estaAutenticado()) {
      return;
    }

    this.activo = true;

    this.eventos.forEach(evento => {
      window.addEventListener(evento, this.reiniciarTemporizador);
    });

    this.reiniciarTemporizador();
  }

  public detener(): void {

    this.activo = false;

    clearTimeout(this.temporizador);

    this.eventos.forEach(evento => {
      window.removeEventListener(evento, this.reiniciarTemporizador);
    });
  }

  private cerrarSesionPorInactividad(): void {

    this.detener();

    this.auth.Logout().subscribe({
      next: () => {
        this.finalizarSesion();
      },
      error: () => {
        this.finalizarSesion();
      }
    });
  }

  private finalizarSesion(): void {

    this.auth.eliminarToken();

    this.router.navigate(['/login'], {
      replaceUrl: true,
      queryParams: {
        sesion: 'expirada'
      }
    });
  }
}