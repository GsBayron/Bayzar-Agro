import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';

import { MatDialog, MatDialogModule } from '@angular/material/dialog';

import { PlaguicidaRegistrado } from '../../../shared/services/plaguicida-registrado';
import { IPlaguicidaRegistrado } from '../../../shared/interfaces/iplaguicida-registrado';

import { Mensaje } from '../../../shared/components/mensaje/mensaje';

@Component({
  selector: 'app-actualizar-plaguicida-registrado',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    ReactiveFormsModule,
    MatDialogModule
  ],
  templateUrl: './actualizar-plaguicida-registrado.html',
  styleUrl: './actualizar-plaguicida-registrado.scss'
})
export class ActualizarPlaguicidaRegistrado implements OnInit {

  private fb = inject(FormBuilder);
  private servicio = inject(PlaguicidaRegistrado);
  private router = inject(Router);
  private ruta = inject(ActivatedRoute);
  private dialogo = inject(MatDialog);

  public id = 0;
  public cargando = false;

  public form = this.fb.group({
    numero_registro: [''],
    nombre_comercial: ['', Validators.required],
    ingrediente_activo: [''],
    tipo_plaguicida: [''],
    cultivo_autorizado: [''],
    plaga_objetivo: [''],
    titular: [''],
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
      next: (resp: IPlaguicidaRegistrado) => {

        this.form.patchValue({
          numero_registro: resp.numero_registro || '',
          nombre_comercial: resp.nombre_comercial || '',
          ingrediente_activo: resp.ingrediente_activo || '',
          tipo_plaguicida: resp.tipo_plaguicida || '',
          cultivo_autorizado: resp.cultivo_autorizado || '',
          plaga_objetivo: resp.plaga_objetivo || '',
          titular: resp.titular || '',
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
          'No se pudo consultar el plaguicida.',
          'error'
        );

        this.router.navigate(['/app/plaguicidas-registrados']);
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
        mensaje: '¿Desea actualizar el plaguicida registrado?',
        confirmacion: true
      }
    });

    dialogRef.afterClosed().subscribe((resultado: boolean) => {

      if (!resultado) {
        return;
      }

      const datos = this.form.getRawValue();

      const payload: IPlaguicidaRegistrado = {
        numero_registro: datos.numero_registro,
        nombre_comercial: datos.nombre_comercial || '',
        ingrediente_activo: datos.ingrediente_activo,
        tipo_plaguicida: datos.tipo_plaguicida,
        cultivo_autorizado: datos.cultivo_autorizado,
        plaga_objetivo: datos.plaga_objetivo,
        titular: datos.titular,
        estado_registro: datos.estado_registro,
        fuente: datos.fuente,
        estado: datos.estado ? 1 : 0
      };

      this.servicio.actualizar(this.id, payload).subscribe({
        next: () => {
          this.mostrarMensaje(
            'Aviso',
            'Plaguicida actualizado correctamente.',
            'exito'
          );

          this.router.navigate(['/app/plaguicidas-registrados']);
        },
        error: (err) => {
          console.error(err);

          this.mostrarMensaje(
            'Error',
            'No se pudo actualizar el plaguicida.',
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