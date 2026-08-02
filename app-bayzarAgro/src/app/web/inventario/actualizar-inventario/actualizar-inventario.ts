import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';

import {
  ReactiveFormsModule,
  FormBuilder,
  Validators
} from '@angular/forms';

import {
  ActivatedRoute,
  Router,
  RouterLink
} from '@angular/router';

import { MatDialog } from '@angular/material/dialog';

import { Inventario } from '../../../shared/services/inventario';
import { Finca } from '../../../shared/services/finca';
import { PlaguicidaRegistrado } from '../../../shared/services/plaguicida-registrado';
import { FertilizanteRegistrado } from '../../../shared/services/fertilizante-registrado';

import { IInventario } from '../../../shared/interfaces/iinventario';
import { Ifinca } from '../../../shared/interfaces/ifinca';
import { IPlaguicidaRegistrado } from '../../../shared/interfaces/iplaguicida-registrado';
import { IFertilizanteRegistrado } from '../../../shared/interfaces/ifertilizante-registrado';

import { Mensaje } from '../../../shared/components/mensaje/mensaje';

import { UNIDADES_MEDIDA } from '../../../shared/data/unidades-medida';

@Component({
  selector: 'app-actualizar-inventario',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink
  ],
  templateUrl: './actualizar-inventario.html',
  styleUrl: './actualizar-inventario.scss'
})
export class ActualizarInventario implements OnInit {

  private fb = inject(FormBuilder);
  private servicio = inject(Inventario);
  private servicioFinca = inject(Finca);
  private servicioPlaguicida = inject(PlaguicidaRegistrado);
  private servicioFertilizante = inject(FertilizanteRegistrado);
  private router = inject(Router);
  private ruta = inject(ActivatedRoute);
  private dialogo = inject(MatDialog);

  public id_inventario = 0;

  public fincas: Ifinca[] = [];
  public plaguicidas: IPlaguicidaRegistrado[] = [];
  public fertilizantes: IFertilizanteRegistrado[] = [];

  public unidadesMedida = UNIDADES_MEDIDA;

  public origenProducto: string[] = [
    'Plaguicida registrado',
    'Fertilizante registrado',
    'Producto manual'
  ];

  public form = this.fb.group({
    id_finca: [null],
    tipo_producto: ['', Validators.required],
    id_plaguicida_registrado: [null],
    id_fertilizante_registrado: [null],
    nombre_manual: [''],
    descripcion_manual: [''],
    cantidad: this.fb.control<number | null>(0, Validators.required),
    unidad_medida: ['', Validators.required],
    fecha_compra: [''],
    fecha_vencimiento: [''],
    ubicacion: [''],
    observaciones: [''],
    estado: [true]
  });

  public ngOnInit(): void {
    this.id_inventario = Number(
      this.ruta.snapshot.paramMap.get('id')
    );

    this.listarFincas();
    this.listarPlaguicidas();
    this.listarFertilizantes();
    this.consultar();
  }

  public listarFincas(): void {
    this.servicioFinca.listar().subscribe({
      next: (resp: Ifinca[]) => {
        this.fincas = resp;
      },
      error: (err) => {
        console.error(err);
        this.mensajeError('No se pudieron cargar las fincas.');
      }
    });
  }

  public listarPlaguicidas(): void {
    this.servicioPlaguicida.listar().subscribe({
      next: (resp: IPlaguicidaRegistrado[]) => {
        this.plaguicidas = resp;
      },
      error: (err) => {
        console.error(err);
        this.mensajeError('No se pudieron cargar los plaguicidas registrados.');
      }
    });
  }

  public listarFertilizantes(): void {
    this.servicioFertilizante.listar().subscribe({
      next: (resp: IFertilizanteRegistrado[]) => {
        this.fertilizantes = resp;
      },
      error: (err) => {
        console.error(err);
        this.mensajeError('No se pudieron cargar los fertilizantes registrados.');
      }
    });
  }

  public consultar(): void {
    this.servicio.consultar(this.id_inventario).subscribe({
      next: (resp: IInventario) => {
        this.form.patchValue({
          id_finca: resp.id_finca as any,
          tipo_producto: resp.tipo_producto,
          id_plaguicida_registrado:resp.id_plaguicida_registrado as any,
          id_fertilizante_registrado:resp.id_fertilizante_registrado as any,
          nombre_manual: resp.nombre_manual,
          descripcion_manual: resp.descripcion_manual,
          cantidad: resp.cantidad,
          unidad_medida: resp.unidad_medida,
          fecha_compra: resp.fecha_compra,
          fecha_vencimiento: resp.fecha_vencimiento,
          ubicacion: resp.ubicacion,
          observaciones: resp.observaciones,
          estado: resp.estado === 1
        });
      },
      error: (err) => {
        console.error(err);
        this.mensajeError('No se pudo consultar el producto.');
      }
    });
  }

  public cambiarTipoProducto(): void {
    this.form.patchValue({
      id_plaguicida_registrado: null,
      id_fertilizante_registrado: null,
      nombre_manual: '',
      descripcion_manual: ''
    });
  }

  public actualizar(): void {

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const tipo = this.form.value.tipo_producto;

    if (
      tipo === 'Plaguicida registrado'
      &&
      !this.form.value.id_plaguicida_registrado
    ) {
      this.mensajeError('Debe seleccionar un plaguicida registrado.');
      return;
    }

    if (
      tipo === 'Fertilizante registrado'
      &&
      !this.form.value.id_fertilizante_registrado
    ) {
      this.mensajeError('Debe seleccionar un fertilizante registrado.');
      return;
    }

    if (
      tipo === 'Producto manual'
      &&
      !this.form.value.nombre_manual
    ) {
      this.mensajeError('Debe ingresar el nombre del producto.');
      return;
    }

    this.dialogo.open(Mensaje, {
      width: '100%',
      maxWidth: '420px',
      disableClose: true,
      data: {
        titulo: 'Confirmación',
        mensaje: '¿Desea actualizar el producto?',
        confirmacion: true
      }
    }).afterClosed().subscribe((resultado: boolean) => {

      if (!resultado) {
        return;
      }

      const payload = {
        id_finca: this.form.value.id_finca,

        tipo_producto: tipo,

        id_plaguicida_registrado:
          tipo === 'Plaguicida registrado'
            ? this.form.value.id_plaguicida_registrado
            : null,

        id_fertilizante_registrado:
          tipo === 'Fertilizante registrado'
            ? this.form.value.id_fertilizante_registrado
            : null,

        nombre_manual:
          tipo === 'Producto manual'
            ? this.form.value.nombre_manual
            : null,

        descripcion_manual:
          tipo === 'Producto manual'
            ? this.form.value.descripcion_manual
            : null,

        cantidad: this.form.value.cantidad ?? 0,

        unidad_medida: this.form.value.unidad_medida,

        fecha_compra: this.form.value.fecha_compra || null,

        fecha_vencimiento: this.form.value.fecha_vencimiento || null,

        ubicacion: this.form.value.ubicacion,

        observaciones: this.form.value.observaciones,

        estado: this.form.value.estado ? 1 : 0
      };

      this.servicio.actualizar(
        this.id_inventario,
        payload as IInventario
      ).subscribe({
        next: () => {
          this.mensajeExito('Producto actualizado correctamente.');
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

    this.router.navigate(['/app/inventario']);
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