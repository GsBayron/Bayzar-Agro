import { Component, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';

import { Inactividad } from '../../services/inactividad';

import { Auth } from '../../services/auth';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './header.html',
  styleUrl: './header.scss'
})
export class Header {

  private auth = inject(Auth);
  private router = inject(Router);
  private inactividad = inject(Inactividad);

  public usuario = this.auth.obtenerUsuario();

  public menuPerfilAbierto = false;

  public cerrarSesion(): void {

    this.inactividad.detener();

    this.auth.Logout().subscribe({
      next: () => {
        this.auth.eliminarToken();

        this.router.navigate(['/login'], {
          replaceUrl: true
        });
      },
      error: () => {
        this.auth.eliminarToken();

        this.router.navigate(['/login'], {
          replaceUrl: true
        });
      }
    });
  }

  public toggleMenuPerfil(): void {
    this.menuPerfilAbierto = !this.menuPerfilAbierto;
  }

  public cerrarMenuPerfil(): void {
    this.menuPerfilAbierto = false;
  }
}