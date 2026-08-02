import { Component, OnInit, ViewChild, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';

import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';

import { PlaguicidaRegistrado } from '../../../shared/services/plaguicida-registrado';
import { IPlaguicidaRegistrado } from '../../../shared/interfaces/iplaguicida-registrado';

import { Mensaje } from '../../../shared/components/mensaje/mensaje';

@Component({
  selector: 'app-listar-plaguicida-registrado',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatDialogModule
  ],
  templateUrl: './listar-plaguicida-registrado.html',
  styleUrl: './listar-plaguicida-registrado.scss'
})
export class ListarPlaguicidaRegistrado implements OnInit {

  private servicio = inject(PlaguicidaRegistrado);
  private router = inject(Router);
  private dialogo = inject(MatDialog);

  public cargando = false;

  public columnas: string[] = [
    'numero_registro',
    'nombre_comercial',
    'ingrediente_activo',
    'tipo_plaguicida',
    'titular',
    'estado_registro',
    'estado',
    'acciones'
  ];

  public dataSource = new MatTableDataSource<IPlaguicidaRegistrado>();

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  public ngOnInit(): void {
    this.listar();
  }

  public listar(): void {

    this.cargando = true;

    this.servicio.listar().subscribe({
      next: (resp: IPlaguicidaRegistrado[]) => {
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
          'No se pudieron cargar los plaguicidas registrados.',
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
      '/app/plaguicidas-registrados/actualizar',
      id
    ]);
  }

  public eliminar(item: IPlaguicidaRegistrado): void {

    const dialogRef = this.dialogo.open(Mensaje, {
      width: '100%',
      maxWidth: '420px',
      disableClose: true,
      data: {
        titulo: 'Confirmación',
        mensaje: `¿Desea eliminar el plaguicida "${item.nombre_comercial}"?`,
        confirmacion: true
      }
    });

    dialogRef.afterClosed().subscribe((resultado: boolean) => {

      if (!resultado || !item.id_plaguicida_registrado) {
        return;
      }

      this.servicio.eliminar(item.id_plaguicida_registrado).subscribe({
        next: () => {
          this.mostrarMensaje(
            'Aviso',
            'Plaguicida eliminado correctamente.',
            'exito'
          );

          this.listar();
        },
        error: (err) => {
          console.error(err);

          this.mostrarMensaje(
            'Error',
            'No se pudo eliminar el plaguicida.',
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