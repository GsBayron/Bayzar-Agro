import { AfterViewInit, Component,OnInit,ViewChild,inject } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { RouterLink } from '@angular/router';

import { Finca } from '../../../shared/services/finca';
import { Ifinca } from '../../../shared/interfaces/ifinca';
import { Mensaje } from '../../../shared/components/mensaje/mensaje';

@Component({
  selector: 'app-listar-finca',
  standalone: true,
  imports: [RouterLink, MatTableModule, MatPaginatorModule, MatSortModule],
  templateUrl: './listar-finca.html',
  styleUrl: './listar-finca.scss',
})
export class ListarFinca implements OnInit, AfterViewInit {

    // INYECCIONES
    private servicio = inject(Finca);
    private dialogo = inject(MatDialog); 
    
    // COLUMNAS
    public columnas: string[] = [
    'id_finca',
    'nombre',
    'ubicacion',
    'provincia',
    'area',
    'estado',
    'acciones'
    ];

    // DATOS
    public datos = new MatTableDataSource<Ifinca>();
    
    //PAGINADOR
    @ViewChild(MatPaginator)
    public paginador!: MatPaginator;

    //ORDENADOR
    @ViewChild(MatSort)
    public ordenador!: MatSort;

    // INT
    public ngOnInit(): void {
      this.listar();
    }

    // AFTER VIEW
    public ngAfterViewInit(): void {
      this.datos.paginator = this.paginador;
      this.datos.sort = this.ordenador;
    }

    // LISTAR
    public listar(): void {
      this.servicio.listar().subscribe({
        next: (resp: Ifinca[]) => {
          this.datos.data = resp; 
        },
        error: (err) => {
          console.error(err);
        }
      });
    }

    // FILTRAR
    public filtrar(event: Event): void {
      const valor = (
        event.target as HTMLInputElement
      ).value;

      this.datos.filter = valor.trim().toLocaleLowerCase();

      if (this.datos.paginator) {
        this.datos.paginator.firstPage();
      }
    }

    // ELIMINAR
  public eliminar(id_finca: number): void {

    this.dialogo.open(Mensaje, {
      width: '100%',
      maxWidth: '420px',
      disableClose: true,
      data: {
        titulo: 'Confirmación',
        mensaje: '¿Está seguro de eliminar esta finca?',
        confirmacion: true
      }
    }).afterClosed().subscribe((resultado: boolean) => {

      if (!resultado) {
        return;
      }

      this.servicio.eliminar(id_finca).subscribe({
        next: () => {
          this.mensajeExito('Se eliminó correctamente la finca.');
          this.listar();
        },
        error: (err) => {
          console.error(err);
          this.mensajeError('No se pudo eliminar la finca.');
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

