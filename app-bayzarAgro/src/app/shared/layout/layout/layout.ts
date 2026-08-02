import { Component, OnInit, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';

import { Header } from '../../components/header/header';
import { Sidebar } from '../../components/sidebar/sidebar';

import { Inactividad } from '../../services/inactividad';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [RouterOutlet, Header, Sidebar],
  templateUrl: './layout.html',
  styleUrl: './layout.scss'
})

export class Layout implements OnInit {

  private inactividad = inject(Inactividad);

  public ngOnInit(): void {
    this.inactividad.iniciar();
  }

}