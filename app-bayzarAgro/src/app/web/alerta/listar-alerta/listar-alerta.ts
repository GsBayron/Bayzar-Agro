import { Component, OnInit, ViewChild, inject } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';

import { Alerta } from '../../../shared/services/alerta';
import { IAlerta } from '../../../shared/interfaces/ialerta';

import { Mensaje } from '../../../shared/components/mensaje/mensaje';

@Component({
  selector: 'app-listar-alerta',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatDialogModule
  ],
  templateUrl: './listar-alerta.html',
  styleUrl: './listar-alerta.scss'
})
export class ListarAlerta implements OnInit {

  private servicio = inject(Alerta);
  private dialogo = inject(MatDialog);

  public cargando = false;

  public columnas: string[] = [
    'nivel',
    'tipo',
    'titulo',
    'mensaje',
    'fecha',
    'origen'
  ];

  public dataSource = new MatTableDataSource<IAlerta>();

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  public ngOnInit(): void {
    this.listar();
  }

  public listar(): void {

    this.cargando = true;

    this.servicio.listar().subscribe({
      next: (resp: IAlerta[]) => {
        this.dataSource = new MatTableDataSource(resp);

        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort;

        this.dataSource.filterPredicate = (
          item: IAlerta,
          filtro: string
        ) => {

          const texto = `
            ${item.tipo}
            ${item.titulo}
            ${item.mensaje}
            ${item.nivel}
            ${item.origen}
            ${item.fecha || ''}
          `.toLowerCase();

          return texto.includes(filtro);
        };

        this.cargando = false;
      },
      error: (err) => {
        console.error(err);

        this.cargando = false;

        this.mostrarMensaje(
          'Error',
          'No se pudieron cargar las alertas.',
          'error'
        );
      }
    });
  }

  public aplicarFiltro(event: Event): void {

    const valor = (event.target as HTMLInputElement).value;

    this.dataSource.filter = valor.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  public claseNivel(nivel: string): string {

    if (nivel === 'Crítica') {
      return 'bg-danger';
    }

    if (nivel === 'Advertencia') {
      return 'bg-warning text-dark';
    }

    return 'bg-info text-dark';
  }

  public iconoNivel(nivel: string): string {

    if (nivel === 'Crítica') {
      return 'bi-exclamation-octagon';
    }

    if (nivel === 'Advertencia') {
      return 'bi-exclamation-triangle';
    }

    return 'bi-info-circle';
  }

  public contarPorNivel(nivel: string): number {
    return this.dataSource.data.filter(
      item => item.nivel === nivel
    ).length;
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
