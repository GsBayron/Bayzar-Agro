import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';

@Component({
  selector: 'app-bienvenida',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink
  ],
  templateUrl: './bienvenida.html',
  styleUrl: './bienvenida.scss'
})
export class Bienvenida implements OnInit {

  private ruta = inject(ActivatedRoute);

  public tipo = 'gratuito';

  public ngOnInit(): void {
    this.tipo = this.ruta.snapshot.queryParamMap.get('tipo') || 'gratuito';
  }

  public esPagoPendiente(): boolean {
    return this.tipo === 'pago-pendiente';
  }
}