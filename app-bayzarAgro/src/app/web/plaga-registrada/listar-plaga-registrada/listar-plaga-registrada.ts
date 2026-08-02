import { Component, OnInit, ViewChild, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';

import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';

import { PlagaRegistrada } from '../../../shared/services/plaga-registrada';
import { IPlagaRegistrada } from '../../../shared/interfaces/iplaga-registrada';

import { Mensaje } from '../../../shared/components/mensaje/mensaje';

@Component({
  selector: 'app-listar-plaga-registrada',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatDialogModule
  ],
  templateUrl: './listar-plaga-registrada.html',
  styleUrl: './listar-plaga-registrada.scss'
})
export class ListarPlagaRegistrada implements OnInit {

  private servicio = inject(PlagaRegistrada);
  private router = inject(Router);
  private dialogo = inject(MatDialog);

  public cargando = false;

  public columnas: string[] = [
    'nombre_comun',
    'nombre_cientifico',
    'tipo_plaga',
    'fuente',
    'estado',
    'acciones'
  ];

  public dataSource = new MatTableDataSource<IPlagaRegistrada>();

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  public ngOnInit(): void {
    this.listar();
  }

  public listar(): void {

    this.cargando = true;

    this.servicio.listar().subscribe({
      next: (resp: IPlagaRegistrada[]) => {
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
          'No se pudieron cargar las plagas registradas.',
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
      '/app/plagas-registradas/actualizar',
      id
    ]);
  }

  public eliminar(item: IPlagaRegistrada): void {

    const dialogRef = this.dialogo.open(Mensaje, {
      width: '100%',
      maxWidth: '420px',
      disableClose: true,
      data: {
        titulo: 'Confirmación',
        mensaje: `¿Desea eliminar la plaga "${item.nombre_comun}"?`,
        confirmacion: true
      }
    });

    dialogRef.afterClosed().subscribe((resultado: boolean) => {

      if (!resultado || !item.id_plaga_registrada) {
        return;
      }

      this.servicio.eliminar(item.id_plaga_registrada).subscribe({
        next: () => {
          this.mostrarMensaje(
            'Aviso',
            'Plaga eliminada correctamente.',
            'exito'
          );

          this.listar();
        },
        error: (err) => {
          console.error(err);

          this.mostrarMensaje(
            'Error',
            'No se pudo eliminar la plaga.',
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