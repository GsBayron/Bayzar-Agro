import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';

import { MatDialog, MatDialogModule } from '@angular/material/dialog';

import { Produccion } from '../../../shared/services/produccion';
import { Finca } from '../../../shared/services/finca';
import { Cultivo } from '../../../shared/services/cultivo';

import { IProduccion } from '../../../shared/interfaces/iproduccion';
import { Ifinca } from '../../../shared/interfaces/ifinca';
import { ICultivo } from '../../../shared/interfaces/icultivo';

import { UNIDADES_MEDIDA_COSECHAS } from '../../../shared/data/unidades-medida-cosechas';

import { Mensaje } from '../../../shared/components/mensaje/mensaje';

@Component({
  selector: 'app-guardar-produccion',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    ReactiveFormsModule,
    MatDialogModule
  ],
  templateUrl: './guardar-produccion.html',
  styleUrl: './guardar-produccion.scss'
})
export class GuardarProduccion implements OnInit {

  private fb = inject(FormBuilder);
  private servicio = inject(Produccion);
  private servicioFinca = inject(Finca);
  private servicioCultivo = inject(Cultivo);
  private router = inject(Router);
  private dialogo = inject(MatDialog);

  public fincas: Ifinca[] = [];
  public cultivos: ICultivo[] = [];
  public cultivosFiltrados: ICultivo[] = [];

  public unidadesMedida = UNIDADES_MEDIDA_COSECHAS;

  public calidades: string[] = [
    'Primera',
    'Segunda',
    'Tercera',
    'Mixta'
  ];

  public destinos: string[] = [
    'Venta',
    'Consumo propio',
    'Semilla',
    'Donación',
    'Pérdida',
    'Otro'
  ];

  public form = this.fb.group({
    id_finca: this.fb.control<number | null>(null, Validators.required),
    id_cultivo: this.fb.control<number | null>(null, Validators.required),

    fecha: ['', Validators.required],

    cantidad: this.fb.control<number | null>(null, [
      Validators.required,
      Validators.min(0.01)
    ]),
    unidad_medida: ['', [Validators.required, Validators.maxLength(50)]],

    cantidad_plantas: this.fb.control<number | null>(null, Validators.min(0)),

    calidad: [''],
    destino: [''],

    observaciones: ['', Validators.maxLength(1000)],
    estado: [true]
  });

  public get f() {
    return this.form.controls;
  }

  public ngOnInit(): void {
    this.listarFincas();
    this.listarCultivos();
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

  public cambiarFinca(): void {

    const idFinca = Number(this.form.value.id_finca || 0);

    this.cultivosFiltrados = this.cultivos.filter(
      cultivo => cultivo.id_finca === idFinca
    );

    this.form.patchValue({
      id_cultivo: null,
      cantidad_plantas: null
    });
  }

  public cambiarCultivo(): void {

    const idCultivo = Number(this.form.value.id_cultivo || 0);

    const cultivo = this.cultivos.find(
      item => item.id_cultivo === idCultivo
    );

    this.form.patchValue({
      cantidad_plantas: cultivo?.cantidad_plantas ?? null
    });
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
        mensaje: '¿Desea guardar el registro de producción?',
        confirmacion: true
      }
    });

    dialogRef.afterClosed().subscribe((resultado: boolean) => {

      if (!resultado) {
        return;
      }

      const datos = this.form.getRawValue();

      const payload: IProduccion = {
        id_finca: Number(datos.id_finca),
        id_cultivo: Number(datos.id_cultivo),

        fecha: datos.fecha || '',

        cantidad: Number(datos.cantidad || 0),
        unidad_medida: datos.unidad_medida || '',

        cantidad_plantas: datos.cantidad_plantas,

        calidad: datos.calidad,
        destino: datos.destino,

        observaciones: datos.observaciones,
        estado: datos.estado ? 1 : 0
      };

      this.servicio.guardar(payload).subscribe({
        next: () => {
          this.mostrarMensaje(
            'Aviso',
            'Producción guardada correctamente.',
            'exito'
          );

          this.router.navigate(['/app/produccion']);
        },
        error: (err) => {
          console.error(err);

          this.mostrarMensaje(
            'Error',
            'No se pudo guardar la producción.',
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
