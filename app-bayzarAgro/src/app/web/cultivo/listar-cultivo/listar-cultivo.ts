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

import { Cultivo } from '../../../shared/services/cultivo';
import { ICultivo } from '../../../shared/interfaces/icultivo';
import { Mensaje } from '../../../shared/components/mensaje/mensaje';

@Component({
  selector: 'app-listar-cultivo',
  standalone: true,
  imports: [
    RouterLink,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule
  ],
  templateUrl: './listar-cultivo.html',
  styleUrl: './listar-cultivo.scss'
})
export class ListarCultivo implements OnInit, AfterViewInit {

  private servicio = inject(Cultivo);
  private dialogo = inject(MatDialog);

  public columnas: string[] = [
    'id_cultivo',
    'finca',
    'nombre',
    'tipo_cultivo',
    'fecha_siembra',
    'area_sembrada',
    'estado_cultivo',
    'estado',
    'acciones'
  ];

  public datos = new MatTableDataSource<ICultivo>();

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
      next: (resp: ICultivo[]) => {
        this.datos.data = resp;
      },
      error: (err) => {
        console.error(err);
        this.mensajeError('Error al cargar los cultivos.');
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

  public eliminar(id_cultivo: number): void {

    this.dialogo.open(Mensaje, {
      width: '100%',
      maxWidth: '420px',
      disableClose: true,
      data: {
        titulo: 'Confirmación',
        mensaje: '¿Está seguro de eliminar este cultivo?',
        confirmacion: true
      }
    }).afterClosed().subscribe((resultado: boolean) => {

      if (!resultado) {
        return;
      }

      this.servicio.eliminar(id_cultivo).subscribe({
        next: () => {
          this.mensajeExito('Se eliminó correctamente el cultivo.');
          this.listar();
        },
        error: (err) => {
          console.error(err);
          this.mensajeError('No se pudo eliminar el cultivo.');
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