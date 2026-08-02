import { AfterViewInit, Component, OnInit, ViewChild, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';

import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';

import { Inventario } from '../../../shared/services/inventario';
import { IInventario } from '../../../shared/interfaces/iinventario';
import { Mensaje } from '../../../shared/components/mensaje/mensaje';

@Component({
  selector: 'app-listar-inventario',
  standalone: true,
  imports: [
    RouterLink,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule
  ],
  templateUrl: './listar-inventario.html',
  styleUrl: './listar-inventario.scss'
})
export class ListarInventario implements OnInit, AfterViewInit {

  private servicio = inject(Inventario);
  private dialogo = inject(MatDialog);

  public columnas: string[] = [
    'id_inventario',
    'producto',
    'tipo_producto',
    'finca',
    'cantidad',
    'fecha_vencimiento',
    'estado',
    'acciones'
  ];

  public datos = new MatTableDataSource<IInventario>();

  @ViewChild(MatPaginator) public paginador!: MatPaginator;
  @ViewChild(MatSort) public ordenador!: MatSort;

  public ngOnInit(): void {
    this.listar();
  }

  public ngAfterViewInit(): void {
    this.datos.paginator = this.paginador;
    this.datos.sort = this.ordenador;
  }

  public listar(): void {
    this.servicio.listar().subscribe({
      next: (resp: IInventario[]) => {
        this.datos.data = resp;
      },
      error: (err) => {
        console.error(err);
        this.mensajeError('Error al cargar el inventario.');
      }
    });
  }

  public filtrar(event: Event): void {
    const valor = (event.target as HTMLInputElement).value;

    this.datos.filter = valor.trim().toLowerCase();

    if (this.datos.paginator) {
      this.datos.paginator.firstPage();
    }
  }

  public eliminar(id_inventario: number): void {

    this.dialogo.open(Mensaje, {
      width: '100%',
      maxWidth: '420px',
      disableClose: true,
      data: {
        titulo: 'Confirmación',
        mensaje: '¿Está seguro de eliminar este producto del inventario?',
        confirmacion: true
      }
    }).afterClosed().subscribe((resultado: boolean) => {

      if (!resultado) return;

      this.servicio.eliminar(id_inventario).subscribe({
        next: () => {
          this.mensajeExito('Se eliminó correctamente el producto.');
          this.listar();
        },
        error: (err) => {
          console.error(err);
          this.mensajeError('No se pudo eliminar el producto.');
        }
      });

    });
  }

  public obtenerEstadoVencimiento(
    fecha: string | null | undefined
  ): string {

    if (!fecha) {
      return 'SIN_FECHA';
    }

    const hoy = new Date();

    const vencimiento =
      new Date(fecha);

    const diferencia =
      Math.ceil(

        (
          vencimiento.getTime()
          -
          hoy.getTime()
        )

        /

        (1000 * 60 * 60 * 24)

      );

    if (diferencia < 0) {
      return 'VENCIDO';
    }

    if (diferencia <= 30) {
      return 'POR_VENCER';
    }

    return 'VIGENTE';
  }

  private mensajeExito(texto: string): void {
    this.dialogo.open(Mensaje, {
      width: '100%',
      maxWidth: '420px',
      data: {
        titulo: 'Aviso',
        mensaje: texto,
        tipo: 'exito'
      }
    });
  }

  private mensajeError(texto: string): void {
    this.dialogo.open(Mensaje, {
      width: '100%',
      maxWidth: '420px',
      data: {
        titulo: 'Error',
        mensaje: texto,
        tipo: 'error'
      }
    });
  }
}