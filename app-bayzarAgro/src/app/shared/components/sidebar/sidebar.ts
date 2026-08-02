import { Component, inject } from '@angular/core';

import {
  RouterLink,
  RouterLinkActive
} from '@angular/router';

import { Auth } from '../../services/auth';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [
    RouterLink,
    RouterLinkActive
  ],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.scss'
})
export class Sidebar {

  private auth = inject(Auth);

  public usuario = this.auth.obtenerUsuario();

  public esAdministrador(): boolean {

    return this.auth.esAdministrador();
  }

  public esAgricultor(): boolean {

    return this.auth.esAgricultor();
  }

  public menuMovilAbierto: boolean = false;

  public abrirMenuMovil(): void {
    this.menuMovilAbierto = true;
  }

  public cerrarMenuMovil(): void {
    this.menuMovilAbierto = false;
  }

  
  
}

