import {
  Component,
  OnInit,
  ViewChild,
  AfterViewInit,
  inject
} from '@angular/core';

import { CommonModule } from '@angular/common';

import { MatTableModule } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';

import { catchError, finalize, of, timeout } from 'rxjs';

import { Alerta } from '../../../shared/services/alerta';
import { IAlerta } from '../../../shared/interfaces/ialerta';

@Component({
  selector: 'app-listar-alerta',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule
  ],
  templateUrl: './listar-alerta.html',
  styleUrl: './listar-alerta.scss'
})
export class ListarAlerta implements OnInit, AfterViewInit {

  private servicioAlerta = inject(Alerta);

  public cargando = false;
  public alertas: IAlerta[] = [];

  public columnas: string[] = [
    'nivel',
    'tipo',
    'titulo',
    'mensaje',
    'fecha',
    'origen'
  ];

  public dataSource = new MatTableDataSource<IAlerta>([]);

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  public ngOnInit(): void {
    this.listar();
  }

  public ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  public listar(): void {

    this.cargando = true;

    this.servicioAlerta.listar().pipe(
      timeout({
        first: 8000
      }),
      catchError((err) => {
        console.error('Error al cargar alertas:', err);

        this.alertas = [];
        this.dataSource.data = [];

        return of([]);
      }),
      finalize(() => {
        this.cargando = false;
      })
    ).subscribe({
      next: (resp: IAlerta[]) => {

        this.alertas = resp || [];
        this.dataSource.data = this.alertas;

        setTimeout(() => {
          this.dataSource.paginator = this.paginator;
          this.dataSource.sort = this.sort;
        });
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

  public contarPorNivel(nivel: string): number {
    return this.alertas.filter(
      alerta => alerta.nivel === nivel
    ).length;
  }

  public claseNivel(nivel: string): string {

    if (nivel === 'Crítica') {
      return 'bg-danger';
    }

    if (nivel === 'Advertencia') {
      return 'bg-warning text-dark';
    }

    if (nivel === 'Informativa') {
      return 'bg-info text-dark';
    }

    return 'bg-secondary';
  }

  public iconoNivel(nivel: string): string {

    if (nivel === 'Crítica') {
      return 'bi-exclamation-octagon';
    }

    if (nivel === 'Advertencia') {
      return 'bi-exclamation-triangle';
    }

    if (nivel === 'Informativa') {
      return 'bi-info-circle';
    }

    return 'bi-bell';
  }
}