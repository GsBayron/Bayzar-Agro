import { Component, OnInit, ViewChild, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';

import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';

import { Produccion } from '../../../shared/services/produccion';
import { IProduccion } from '../../../shared/interfaces/iproduccion';

import { Mensaje } from '../../../shared/components/mensaje/mensaje';

@Component({
  selector: 'app-listar-produccion',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatDialogModule
  ],
  templateUrl: './listar-produccion.html',
  styleUrl: './listar-produccion.scss'
})
export class ListarProduccion implements OnInit {

  private servicio = inject(Produccion);
  private router = inject(Router);
  private dialogo = inject(MatDialog);

  public cargando = false;

  public columnas: string[] = [
    'fecha',
    'finca',
    'cultivo',
    'cantidad',
    'cantidad_plantas',
    'calidad',
    'destino',
    'estado',
    'acciones'
  ];

  public dataSource = new MatTableDataSource<IProduccion>();

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  public ngOnInit(): void {
    this.listar();
  }

  public listar(): void {

    this.cargando = true;

    this.servicio.listar().subscribe({
      next: (resp: IProduccion[]) => {
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
          'No se pudo cargar la producción registrada.',
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

  public rendimientoPorPlanta(item: IProduccion): string {

    const plantas = Number(item.cantidad_plantas || 0);
    const cantidad = Number(item.cantidad || 0);

    if (plantas <= 0) {
      return '-';
    }

    return (cantidad / plantas).toFixed(2);
  }

  public actualizar(id: number | undefined): void {

    if (!id) {
      return;
    }

    this.router.navigate([
      '/app/produccion/actualizar',
      id
    ]);
  }

  public eliminar(item: IProduccion): void {

    const dialogRef = this.dialogo.open(Mensaje, {
      width: '100%',
      maxWidth: '420px',
      disableClose: true,
      data: {
        titulo: 'Confirmación',
        mensaje: `¿Desea eliminar la producción del cultivo "${item.cultivo?.nombre || 'seleccionado'}"?`,
        confirmacion: true
      }
    });

    dialogRef.afterClosed().subscribe((resultado: boolean) => {

      if (!resultado || !item.id_produccion) {
        return;
      }

      this.servicio.eliminar(item.id_produccion).subscribe({
        next: () => {
          this.mostrarMensaje(
            'Aviso',
            'Producción eliminada correctamente.',
            'exito'
          );

          this.listar();
        },
        error: (err) => {
          console.error(err);

          this.mostrarMensaje(
            'Error',
            'No se pudo eliminar la producción.',
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