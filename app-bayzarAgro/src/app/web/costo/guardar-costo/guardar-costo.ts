import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';

import { MatDialog, MatDialogModule } from '@angular/material/dialog';

import { Costo } from '../../../shared/services/costo';
import { Finca } from '../../../shared/services/finca';
import { Cultivo } from '../../../shared/services/cultivo';
import { Actividad } from '../../../shared/services/actividad';

import { ICosto } from '../../../shared/interfaces/icosto';
import { Ifinca } from '../../../shared/interfaces/ifinca';
import { ICultivo } from '../../../shared/interfaces/icultivo';
import { IActividad } from '../../../shared/interfaces/iactividad';

import { TIPOS_COSTO } from '../../../shared/data/tipos-costos';

import { Mensaje } from '../../../shared/components/mensaje/mensaje';

@Component({
  selector: 'app-guardar-costo',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    ReactiveFormsModule,
    MatDialogModule
  ],
  templateUrl: './guardar-costo.html',
  styleUrl: './guardar-costo.scss'
})
export class GuardarCosto implements OnInit {

  private fb = inject(FormBuilder);
  private servicio = inject(Costo);
  private servicioFinca = inject(Finca);
  private servicioCultivo = inject(Cultivo);
  private servicioActividad = inject(Actividad);
  private router = inject(Router);
  private dialogo = inject(MatDialog);

  public tiposCosto = TIPOS_COSTO;

  public fincas: Ifinca[] = [];
  public cultivos: ICultivo[] = [];
  public actividades: IActividad[] = [];

  public form = this.fb.group({
    id_finca: this.fb.control<number | null>(null),
    id_cultivo: this.fb.control<number | null>(null),
    id_actividad: this.fb.control<number | null>(null),

    tipo_costo: ['', [Validators.required, Validators.maxLength(80)]],
    descripcion: ['', [Validators.required, Validators.maxLength(255)]],

    cantidad_personas: this.fb.control<number | null>(null, Validators.min(0)),
    horas_trabajadas: this.fb.control<number | null>(null, Validators.min(0)),
    costo_por_hora: this.fb.control<number | null>(null, Validators.min(0)),

    monto: this.fb.control<number | null>(null, [
      Validators.required,
      Validators.min(0)
    ]),
    fecha: ['', Validators.required],
    observaciones: [''],
    estado: [true]
  });

  public get f() {
    return this.form.controls;
  }

  public ngOnInit(): void {
    this.listarFincas();
    this.listarCultivos();
    this.listarActividades();

    this.form.valueChanges.subscribe(() => {
      this.calcularMontoManoObra();
    });
  }

  public listarFincas(): void {
    this.servicioFinca.listar().subscribe({
      next: (resp: Ifinca[]) => {
        this.fincas = resp;
      },
      error: (err) => {
        console.error(err);
      }
    });
  }

  public listarCultivos(): void {
    this.servicioCultivo.listar().subscribe({
      next: (resp: ICultivo[]) => {
        this.cultivos = resp;
      },
      error: (err) => {
        console.error(err);
      }
    });
  }

  public listarActividades(): void {
    this.servicioActividad.listar().subscribe({
      next: (resp: IActividad[]) => {
        this.actividades = resp;
      },
      error: (err) => {
        console.error(err);
      }
    });
  }

  public esManoObra(): boolean {
    return this.form.value.tipo_costo === 'Mano de obra';
  }

  private calcularMontoManoObra(): void {

    if (!this.esManoObra()) {
      return;
    }

    const personas = Number(this.form.value.cantidad_personas || 0);
    const horas = Number(this.form.value.horas_trabajadas || 0);
    const costoHora = Number(this.form.value.costo_por_hora || 0);

    const total = personas * horas * costoHora;

    if (Number(this.form.value.monto || 0) !== total) {
      this.form.patchValue(
        {
          monto: total
        },
        {
          emitEvent: false
        }
      );
    }
  }

  public guardar(): void {

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
        mensaje: '¿Desea guardar el costo registrado?',
        confirmacion: true
      }
    });

    dialogRef.afterClosed().subscribe((resultado: boolean) => {

      if (!resultado) {
        return;
      }

      const datos = this.form.getRawValue();

      const payload: ICosto = {
        id_finca: datos.id_finca,
        id_cultivo: datos.id_cultivo,
        id_actividad: datos.id_actividad,

        tipo_costo: datos.tipo_costo || '',
        descripcion: datos.descripcion || '',

        cantidad_personas: this.esManoObra()
          ? datos.cantidad_personas
          : null,

        horas_trabajadas: this.esManoObra()
          ? datos.horas_trabajadas
          : null,

        costo_por_hora: this.esManoObra()
          ? datos.costo_por_hora
          : null,

        monto: Number(datos.monto || 0),
        fecha: datos.fecha || '',
        observaciones: datos.observaciones,
        estado: datos.estado ? 1 : 0
      };

      this.servicio.guardar(payload).subscribe({
        next: () => {
          this.mostrarMensaje(
            'Aviso',
            'Costo guardado correctamente.',
            'exito'
          );

          this.router.navigate(['/app/costos']);
        },
        error: (err) => {
          console.error(err);

          this.mostrarMensaje(
            'Error',
            'No se pudo guardar el costo.',
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
