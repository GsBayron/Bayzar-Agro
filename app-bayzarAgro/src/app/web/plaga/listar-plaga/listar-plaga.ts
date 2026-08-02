import {
  AfterViewInit,
  Component,
  OnInit,
  ViewChild,
  inject
} from '@angular/core';

import { RouterLink } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';

import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';

import { PlagaCultivo } from '../../../shared/services/plaga-cultivo';
import { IPlagaCultivo } from '../../../shared/interfaces/iplaga-cultivo';
import { Mensaje } from '../../../shared/components/mensaje/mensaje';

@Component({
  selector: 'app-listar-plaga',
  standalone: true,
  imports: [
    RouterLink,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule
  ],
  templateUrl: './listar-plaga.html',
  styleUrl: './listar-plaga.scss'
})
export class ListarPlaga implements OnInit, AfterViewInit {

  private servicio = inject(PlagaCultivo);
  private dialogo = inject(MatDialog);

  public columnas: string[] = [
    'id_plaga_cultivo',
    'cultivo',
    'plaga',
    'fecha_deteccion',
    'nivel_riesgo',
    'estado_plaga',
    'estado',
    'acciones'
  ];

  public datos = new MatTableDataSource<IPlagaCultivo>();

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
      next: (resp: IPlagaCultivo[]) => {
        this.datos.data = resp;
      },
      error: (err) => {
        console.error(err);
        this.mensajeError('Error al cargar las plagas.');
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

  public obtenerNombrePlaga(item: IPlagaCultivo): string {
    if (item.plaga) {
      return item.plaga.nombre_cientifico
        ? `${item.plaga.nombre_comun} (${item.plaga.nombre_cientifico})`
        : item.plaga.nombre_comun;
    }

    return item.nombre_manual || '-';
  }

  public eliminar(id_plaga_cultivo: number): void {

    this.dialogo.open(Mensaje, {
      width: '100%',
      maxWidth: '420px',
      disableClose: true,
      data: {
        titulo: 'Confirmación',
        mensaje: '¿Está seguro de eliminar este registro de plaga?',
        confirmacion: true
      }
    }).afterClosed().subscribe((resultado: boolean) => {

      if (!resultado) return;

      this.servicio.eliminar(id_plaga_cultivo).subscribe({
        next: () => {
          this.mensajeExito('Registro eliminado correctamente.');
          this.listar();
        },
        error: (err) => {
          console.error(err);
          this.mensajeError('No se pudo eliminar el registro.');
        }
      });

    });
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