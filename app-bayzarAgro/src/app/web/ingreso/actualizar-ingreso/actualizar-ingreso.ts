import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';

import { MatDialog, MatDialogModule } from '@angular/material/dialog';

import { forkJoin } from 'rxjs';

import { Ingreso } from '../../../shared/services/ingreso';
import { Finca } from '../../../shared/services/finca';
import { Cultivo } from '../../../shared/services/cultivo';
import { Produccion } from '../../../shared/services/produccion';

import { IIngreso } from '../../../shared/interfaces/iingreso';
import { Ifinca } from '../../../shared/interfaces/ifinca';
import { ICultivo } from '../../../shared/interfaces/icultivo';
import { IProduccion } from '../../../shared/interfaces/iproduccion';

import { UNIDADES_MEDIDA_COSECHAS } from '../../../shared/data/unidades-medida-cosechas';

import { Mensaje } from '../../../shared/components/mensaje/mensaje';

@Component({
  selector: 'app-actualizar-ingreso',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    ReactiveFormsModule,
    MatDialogModule
  ],
  templateUrl: './actualizar-ingreso.html',
  styleUrl: './actualizar-ingreso.scss'
})
export class ActualizarIngreso implements OnInit {

  private fb = inject(FormBuilder);
  private servicio = inject(Ingreso);
  private servicioFinca = inject(Finca);
  private servicioCultivo = inject(Cultivo);
  private servicioProduccion = inject(Produccion);
  private router = inject(Router);
  private ruta = inject(ActivatedRoute);
  private dialogo = inject(MatDialog);

  public id = 0;
  public cargando = false;

  public fincas: Ifinca[] = [];
  public cultivos: ICultivo[] = [];
  public producciones: IProduccion[] = [];

  public cultivosFiltrados: ICultivo[] = [];
  public produccionesFiltradas: IProduccion[] = [];

  public unidadesMedida = UNIDADES_MEDIDA_COSECHAS;

  public destinos: string[] = [
    'Feria del agricultor',
    'Supermercado',
    'Restaurante',
    'Intermediario',
    'Venta directa',
    'Otro'
  ];

  public form = this.fb.group({
    id_finca: this.fb.control<number | null>(null, Validators.required),
    id_cultivo: this.fb.control<number | null>(null, Validators.required),
    id_produccion: this.fb.control<number | null>(null),

    fecha: ['', Validators.required],
    descripcion: ['', [Validators.required, Validators.maxLength(255)]],

    cantidad_vendida: this.fb.control<number | null>(null, [
      Validators.required,
      Validators.min(0.01)
    ]),
    unidad_medida: ['', [Validators.required, Validators.maxLength(50)]],

    precio_unitario: this.fb.control<number | null>(null, [
      Validators.required,
      Validators.min(0)
    ]),
    monto_total: this.fb.control<number | null>(null, Validators.required),

    cliente: [''],
    destino: [''],

    observaciones: [''],
    estado: [true]
  });

  public get f() {
    return this.form.controls;
  }

  public ngOnInit(): void {

    this.id = Number(
      this.ruta.snapshot.paramMap.get('id')
    );

    this.cargarDatosIniciales();

    this.form.valueChanges.subscribe(() => {
      this.calcularTotal();
    });
  }

  public cargarDatosIniciales(): void {

    this.cargando = true;

    forkJoin({
      fincas: this.servicioFinca.listar(),
      cultivos: this.servicioCultivo.listar(),
      producciones: this.servicioProduccion.listar(),
      ingreso: this.servicio.consultar(this.id)
    }).subscribe({
      next: (resp) => {

        this.fincas = resp.fincas;
        this.cultivos = resp.cultivos;
        this.producciones = resp.producciones;

        this.cargarFormulario(resp.ingreso);

        this.cargando = false;
      },
      error: (err) => {
        console.error(err);

        this.cargando = false;

        this.mostrarMensaje(
          'Error',
          'No se pudo cargar la información del ingreso.',
          'error'
        );

        this.router.navigate(['/app/ingresos']);
      }
    });
  }

  private cargarFormulario(resp: IIngreso): void {

    this.cultivosFiltrados = this.cultivos.filter(
      cultivo => cultivo.id_finca === resp.id_finca
    );

    this.produccionesFiltradas = this.producciones.filter(
      item =>
        item.id_finca === resp.id_finca
        &&
        item.id_cultivo === resp.id_cultivo
    );

    this.form.patchValue({
      id_finca: resp.id_finca ?? null,
      id_cultivo: resp.id_cultivo ?? null,
      id_produccion: resp.id_produccion ?? null,

      fecha: resp.fecha || '',
      descripcion: resp.descripcion || '',

      cantidad_vendida: resp.cantidad_vendida ?? null,
      unidad_medida: resp.unidad_medida || '',

      precio_unitario: resp.precio_unitario ?? null,
      monto_total: resp.monto_total ?? null,

      cliente: resp.cliente || '',
      destino: resp.destino || '',

      observaciones: resp.observaciones || '',
      estado: resp.estado === 1
    });
  }

  public cambiarFinca(): void {

    const idFinca = Number(this.form.value.id_finca || 0);

    this.cultivosFiltrados = this.cultivos.filter(
      cultivo => cultivo.id_finca === idFinca
    );

    this.produccionesFiltradas = [];

    this.form.patchValue({
      id_cultivo: null,
      id_produccion: null
    });
  }

  public cambiarCultivo(): void {

    const idFinca = Number(this.form.value.id_finca || 0);
    const idCultivo = Number(this.form.value.id_cultivo || 0);

    this.produccionesFiltradas = this.producciones.filter(
      item =>
        item.id_finca === idFinca
        &&
        item.id_cultivo === idCultivo
    );

    this.form.patchValue({
      id_produccion: null
    });
  }

  public cambiarProduccion(): void {

    const idProduccion = Number(this.form.value.id_produccion || 0);

    const produccion = this.producciones.find(
      item => item.id_produccion === idProduccion
    );

    if (!produccion) {
      return;
    }

    this.form.patchValue({
      cantidad_vendida: produccion.cantidad,
      unidad_medida: produccion.unidad_medida,
      descripcion: `Venta de ${produccion.cultivo?.nombre || 'producción agrícola'}`
    });
  }

  private calcularTotal(): void {

    const cantidad = Number(this.form.value.cantidad_vendida || 0);
    const precio = Number(this.form.value.precio_unitario || 0);

    const total = cantidad * precio;

    if (Number(this.form.value.monto_total || 0) !== total) {
      this.form.patchValue(
        {
          monto_total: total
        },
        {
          emitEvent: false
        }
      );
    }
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
        mensaje: '¿Desea actualizar el ingreso registrado?',
        confirmacion: true
      }
    });

    dialogRef.afterClosed().subscribe((resultado: boolean) => {

      if (!resultado) {
        return;
      }

      const datos = this.form.getRawValue();

      const payload: IIngreso = {
        id_finca: Number(datos.id_finca),
        id_cultivo: Number(datos.id_cultivo),
        id_produccion: datos.id_produccion,

        fecha: datos.fecha || '',
        descripcion: datos.descripcion || '',

        cantidad_vendida: Number(datos.cantidad_vendida || 0),
        unidad_medida: datos.unidad_medida || '',

        precio_unitario: Number(datos.precio_unitario || 0),
        monto_total: Number(datos.monto_total || 0),

        cliente: datos.cliente,
        destino: datos.destino,

        observaciones: datos.observaciones,
        estado: datos.estado ? 1 : 0
      };

      this.servicio.actualizar(this.id, payload).subscribe({
        next: () => {
          this.mostrarMensaje(
            'Aviso',
            'Ingreso actualizado correctamente.',
            'exito'
          );

          this.router.navigate(['/app/ingresos']);
        },
        error: (err) => {
          console.error(err);

          this.mostrarMensaje(
            'Error',
            'No se pudo actualizar el ingreso.',
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
