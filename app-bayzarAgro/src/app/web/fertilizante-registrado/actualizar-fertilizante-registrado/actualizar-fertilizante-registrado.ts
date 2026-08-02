import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';

import { MatDialog, MatDialogModule } from '@angular/material/dialog';

import { FertilizanteRegistrado } from '../../../shared/services/fertilizante-registrado';
import { IFertilizanteRegistrado } from '../../../shared/interfaces/ifertilizante-registrado';

import { Mensaje } from '../../../shared/components/mensaje/mensaje';

@Component({
  selector: 'app-actualizar-fertilizante-registrado',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    ReactiveFormsModule,
    MatDialogModule
  ],
  templateUrl: './actualizar-fertilizante-registrado.html',
  styleUrl: './actualizar-fertilizante-registrado.scss'
})
export class ActualizarFertilizanteRegistrado implements OnInit {

  private fb = inject(FormBuilder);
  private servicio = inject(FertilizanteRegistrado);
  private router = inject(Router);
  private ruta = inject(ActivatedRoute);
  private dialogo = inject(MatDialog);

  public id = 0;
  public cargando = false;

  public form = this.fb.group({
    numero_registro: [''],
    nombre_comercial: ['', Validators.required],
    composicion: [''],
    tipo_fertilizante: [''],
    fabricante: [''],
    estado_registro: ['Vigente'],
    fuente: [''],
    estado: [true]
  });

  public get f() {
    return this.form.controls;
  }

  public ngOnInit(): void {

    this.id = Number(
      this.ruta.snapshot.paramMap.get('id')
    );

    this.consultar();
  }

  public consultar(): void {

    this.cargando = true;

    this.servicio.consultar(this.id).subscribe({
      next: (resp: IFertilizanteRegistrado) => {

        this.form.patchValue({
          numero_registro: resp.numero_registro || '',
          nombre_comercial: resp.nombre_comercial || '',
          composicion: resp.composicion || '',
          tipo_fertilizante: resp.tipo_fertilizante || '',
          fabricante: resp.fabricante || '',
          estado_registro: resp.estado_registro || 'Vigente',
          fuente: resp.fuente || '',
          estado: resp.estado === 1
        });

        this.cargando = false;
      },
      error: (err) => {
        console.error(err);
        this.cargando = false;

        this.mostrarMensaje(
          'Error',
          'No se pudo consultar el fertilizante.',
          'error'
        );

        this.router.navigate(['/app/fertilizantes-registrados']);
      }
    });
  }

  public actualizar(): void {

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const dialogRef = this.dialogo.open(Mensaje, {
      width: '100%',
      maxWidth: '420px',
      disableClose: true,
      data: {
        titulo: 'Confirmación',
        mensaje: '¿Desea actualizar el fertilizante registrado?',
        confirmacion: true
      }
    });

    dialogRef.afterClosed().subscribe((resultado: boolean) => {

      if (!resultado) {
        return;
      }

      const datos = this.form.getRawValue();

      const payload: IFertilizanteRegistrado = {
        numero_registro: datos.numero_registro,
        nombre_comercial: datos.nombre_comercial || '',
        composicion: datos.composicion,
        tipo_fertilizante: datos.tipo_fertilizante,
        fabricante: datos.fabricante,
        estado_registro: datos.estado_registro,
        fuente: datos.fuente,
        estado: datos.estado ? 1 : 0
      };

      this.servicio.actualizar(this.id, payload).subscribe({
        next: () => {
          this.mostrarMensaje(
            'Aviso',
            'Fertilizante actualizado correctamente.',
            'exito'
          );

          this.router.navigate(['/app/fertilizantes-registrados']);
        },
        error: (err) => {
          console.error(err);

          this.mostrarMensaje(
            'Error',
            'No se pudo actualizar el fertilizante.',
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