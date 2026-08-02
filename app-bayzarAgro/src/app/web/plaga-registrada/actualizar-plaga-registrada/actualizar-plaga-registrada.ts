import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';

import { MatDialog, MatDialogModule } from '@angular/material/dialog';

import { PlagaRegistrada } from '../../../shared/services/plaga-registrada';
import { IPlagaRegistrada } from '../../../shared/interfaces/iplaga-registrada';

import { Mensaje } from '../../../shared/components/mensaje/mensaje';

@Component({
  selector: 'app-actualizar-plaga-registrada',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    ReactiveFormsModule,
    MatDialogModule
  ],
  templateUrl: './actualizar-plaga-registrada.html',
  styleUrl: './actualizar-plaga-registrada.scss'
})
export class ActualizarPlagaRegistrada implements OnInit {

  private fb = inject(FormBuilder);
  private servicio = inject(PlagaRegistrada);
  private router = inject(Router);
  private ruta = inject(ActivatedRoute);
  private dialogo = inject(MatDialog);

  public id = 0;
  public cargando = false;

  public tiposPlaga: string[] = [
    'Insecto',
    'Hongo',
    'Bacteria',
    'Virus',
    'Ácaro',
    'Nematodo',
    'Maleza',
    'Otro'
  ];

  public form = this.fb.group({
    nombre_comun: ['', Validators.required],
    nombre_cientifico: [''],
    tipo_plaga: [''],
    descripcion: [''],
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
      next: (resp: IPlagaRegistrada) => {

        this.form.patchValue({
          nombre_comun: resp.nombre_comun || '',
          nombre_cientifico: resp.nombre_cientifico || '',
          tipo_plaga: resp.tipo_plaga || '',
          descripcion: resp.descripcion || '',
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
          'No se pudo consultar la plaga.',
          'error'
        );

        this.router.navigate(['/app/plagas-registradas']);
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
        mensaje: '¿Desea actualizar la plaga registrada?',
        confirmacion: true
      }
    });

    dialogRef.afterClosed().subscribe((resultado: boolean) => {

      if (!resultado) {
        return;
      }

      const datos = this.form.getRawValue();

      const payload: IPlagaRegistrada = {
        nombre_comun: datos.nombre_comun || '',
        nombre_cientifico: datos.nombre_cientifico,
        tipo_plaga: datos.tipo_plaga,
        descripcion: datos.descripcion,
        fuente: datos.fuente,
        estado: datos.estado ? 1 : 0
      };

      this.servicio.actualizar(this.id, payload).subscribe({
        next: () => {
          this.mostrarMensaje(
            'Aviso',
            'Plaga actualizada correctamente.',
            'exito'
          );

          this.router.navigate(['/app/plagas-registradas']);
        },
        error: (err) => {
          console.error(err);

          this.mostrarMensaje(
            'Error',
            'No se pudo actualizar la plaga.',
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