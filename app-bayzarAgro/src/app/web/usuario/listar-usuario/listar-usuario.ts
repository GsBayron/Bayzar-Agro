import { AfterViewInit, Component, OnInit, ViewChild, inject } from '@angular/core';
import { RouterLink } from '@angular/router';

import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';

import { Usuario } from '../../../shared/services/usuario';
import { IUsuario } from '../../../shared/interfaces/iusuario';

@Component({
  selector: 'app-listar-usuario',
  standalone: true,
  imports: [
    RouterLink,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule
  ],
  templateUrl: './listar-usuario.html',
  styleUrl: './listar-usuario.scss'
})

export class ListarUsuario implements OnInit, AfterViewInit {

  private servicio = inject(Usuario);

  public columnas: string[] = [
    'id_usuario',
    'nombre',
    'correo',
    'acceso',
    'rol',
    'estado',
    'acciones'
  ];

  public datos = new MatTableDataSource<IUsuario>();

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
    this.servicio.Listar().subscribe({
      next: (resp: IUsuario[]) => {
        this.datos.data = resp;
      },
      error: (err) => {
        console.error(err);
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

  public eliminar(id_usuario: number): void {

    const confirmar = confirm('¿Está seguro de eliminar este usuario?');

    if (!confirmar) {
      return;
    }

    this.servicio.Eliminar(id_usuario).subscribe({
      next: () => this.listar(),
      error: (err) => {
        console.error(err);
      }
    });
  }
}
