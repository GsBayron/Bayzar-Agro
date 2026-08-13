import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-terminos-condiciones',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink
  ],
  templateUrl: './terminos-condiciones.html',
  styleUrl: './terminos-condiciones.scss'
})
export class TerminosCondiciones {

  public irASeccion(id: string): void {

    const elemento = document.getElementById(id);

    if (!elemento) {
        return;
    }

    elemento.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
    });
}

}