import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';

import {
  ReactiveFormsModule,
  FormBuilder,
  Validators
} from '@angular/forms';

import { Router, RouterLink } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';

import { Cultivo } from '../../../shared/services/cultivo';
import { PlagaRegistrada } from '../../../shared/services/plaga-registrada';
import { PlagaCultivo } from '../../../shared/services/plaga-cultivo';

import { ICultivo } from '../../../shared/interfaces/icultivo';
import { IPlagaRegistrada } from '../../../shared/interfaces/iplaga-registrada';
import { IPlagaCultivo } from '../../../shared/interfaces/iplaga-cultivo';

import { Mensaje } from '../../../shared/components/mensaje/mensaje';

import { NIVELES_RIESGO } from '../../../shared/data/niveles-riesgo';

@Component({
  selector: 'app-guardar-plaga',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink
  ],
  templateUrl: './guardar-plaga.html',
  styleUrl: './guardar-plaga.scss'
})
export class GuardarPlaga implements OnInit {

  private fb = inject(FormBuilder);
  private servicio = inject(PlagaCultivo);
  private servicioCultivo = inject(Cultivo);
  private servicioPlaga = inject(PlagaRegistrada);
  private router = inject(Router);
  private dialogo = inject(MatDialog);

  public cultivos: ICultivo[] = [];
  public plagasRegistradas: IPlagaRegistrada[] = [];

  public nivelesRiesgo = NIVELES_RIESGO;

  public origenPlaga: string[] = [
    'Plaga registrada',
    'Plaga manual'
  ];

  public estadosPlaga: string[] = [
    'Detectada',
    'En tratamiento',
    'Controlada',
    'Eliminada'
  ];

  public tiposPlagaManual: string[] = [
    'Insecto',
    'Hongo',
    'Bacteria',
    'Virus',
    'Maleza',
    'Ácaro',
    'Otro'
  ];

  public form = this.fb.group({
    id_cultivo: [null, Validators.required],
    origen_plaga: ['', Validators.required],
    id_plaga_registrada: [null],
    nombre_manual: [''],
    tipo_plaga_manual: [''],
    fecha_deteccion: ['', Validators.required],
    nivel_riesgo: ['', Validators.required],
    estado_plaga: ['Detectada', Validators.required],
    descripcion: [''],
    observaciones: [''],
    estado: [true]
  });

  public ngOnInit(): void {
    this.listarCultivos();
    this.listarPlagasRegistradas();
  }

  public listarCultivos(): void {
    this.servicioCultivo.listar().subscribe({
      next: (resp: ICultivo[]) => {
        this.cultivos = resp;
      },
      error: (err) => {
        console.error(err);
        this.mensajeError('No se pudieron cargar los cultivos.');
      }
    });
  }

  public listarPlagasRegistradas(): void {
    this.servicioPlaga.listar().subscribe({
      next: (resp: IPlagaRegistrada[]) => {
        this.plagasRegistradas = resp;
      },
      error: (err) => {
        console.error(err);
        this.mensajeError('No se pudieron cargar las plagas registradas.');
      }
    });
  }

  public cambiarOrigenPlaga(): void {
    this.form.patchValue({
      id_plaga_registrada: null,
      nombre_manual: '',
      tipo_plaga_manual: ''
    });
  }

  public guardar(): void {

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const origen = this.form.value.origen_plaga;

    if (
      origen === 'Plaga registrada'
      &&
      !this.form.value.id_plaga_registrada
    ) {
      this.mensajeError('Debe seleccionar una plaga registrada.');
      return;
    }

    if (
      origen === 'Plaga manual'
      &&
      !this.form.value.nombre_manual
    ) {
      this.mensajeError('Debe ingresar el nombre de la plaga.');
      return;
    }

    this.dialogo.open(Mensaje, {
      width: '100%',
      maxWidth: '420px',
      disableClose: true,
      data: {
        titulo: 'Confirmación',
        mensaje: '¿Desea guardar este registro de plaga?',
        confirmacion: true
      }
    }).afterClosed().subscribe((resultado: boolean) => {

      if (!resultado) return;

      const payload = {
        id_cultivo: this.form.value.id_cultivo,
        id_plaga_registrada:
          origen === 'Plaga registrada'
            ? this.form.value.id_plaga_registrada
            : null,
        nombre_manual:
          origen === 'Plaga manual'
            ? this.form.value.nombre_manual
            : null,
        tipo_plaga_manual:
          origen === 'Plaga manual'
            ? this.form.value.tipo_plaga_manual
            : null,
        fecha_deteccion: this.form.value.fecha_deteccion,
        nivel_riesgo: this.form.value.nivel_riesgo,
        estado_plaga: this.form.value.estado_plaga,
        descripcion: this.form.value.descripcion,
        observaciones: this.form.value.observaciones,
        estado: this.form.value.estado ? 1 : 0
      };

      this.servicio.guardar(payload as unknown as IPlagaCultivo).subscribe({
        next: () => {
          this.mensajeExito('Plaga guardada correctamente.');
        },
        error: (err) => {
          console.error(err);

          if (err.status === 422) {
            this.mensajeError('Datos inválidos. Revise los campos requeridos.');
            return;
          }

          this.mensajeError('Error interno del servidor.');
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

    this.router.navigate(['/app/plagas']);
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

  public get f() {
    return this.form.controls;
  }
}