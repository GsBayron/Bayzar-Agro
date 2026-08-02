import { Component, OnInit, ViewChild, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';

import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';

import { Costo } from '../../../shared/services/costo';
import { ICosto } from '../../../shared/interfaces/icosto';

import { Mensaje } from '../../../shared/components/mensaje/mensaje';

@Component({
  selector: 'app-listar-costo',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatDialogModule
  ],
  templateUrl: './listar-costo.html',
  styleUrl: './listar-costo.scss'
})
export class ListarCosto implements OnInit {

  private servicio = inject(Costo);
  private router = inject(Router);
  private dialogo = inject(MatDialog);

  public cargando = false;

  public columnas: string[] = [
    'fecha',
    'tipo_costo',
    'descripcion',
    'finca',
    'cultivo',
    'monto',
    'estado',
    'acciones'
  ];

  public dataSource = new MatTableDataSource<ICosto>();

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  public ngOnInit(): void {
    this.listar();
  }

  public listar(): void {

    this.cargando = true;

    this.servicio.listar().subscribe({
      next: (resp: ICosto[]) => {
        this.dataSource = new MatTableDataSource(resp);
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort;
        this.cargando = false;
      },
      error: (err) => {
        console.error(err);
        this.cargando = false;

        this.mostrarMensaje(
          'Error',
          'No se pudieron cargar los costos registrados.',
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

  public actualizar(id: number | undefined): void {

    if (!id) {
      return;
    }

    this.router.navigate([
      '/app/costos/actualizar',
      id
    ]);
  }

  public eliminar(item: ICosto): void {

    const dialogRef = this.dialogo.open(Mensaje, {
      width: '100%',
      maxWidth: '420px',
      disableClose: true,
      data: {
        titulo: 'Confirmación',
        mensaje: `¿Desea eliminar el costo "${item.descripcion}"?`,
        confirmacion: true
      }
    });

    dialogRef.afterClosed().subscribe((resultado: boolean) => {

      if (!resultado || !item.id_costo) {
        return;
      }

      this.servicio.eliminar(item.id_costo).subscribe({
        next: () => {
          this.mostrarMensaje(
            'Aviso',
            'Costo eliminado correctamente.',
            'exito'
          );

          this.listar();
        },
        error: (err) => {
          console.error(err);

          this.mostrarMensaje(
            'Error',
            'No se pudo eliminar el costo.',
            'error'
          );
        }
      });
    });
  }

  public formatoMoneda(monto: number | null | undefined): string {

    const valor = Number(monto || 0);

    return valor.toLocaleString('es-CR', {
      style: 'currency',
      currency: 'CRC',
      minimumFractionDigits: 2
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