import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';

import {
  ReactiveFormsModule,
  FormBuilder,
  Validators
} from '@angular/forms';

import { Router, RouterLink } from '@angular/router';
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
  selector: 'app-guardar-inventario',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink
  ],
  templateUrl: './guardar-inventario.html',
  styleUrl: './guardar-inventario.scss'
})
export class GuardarInventario implements OnInit {

  // Inyección de dependencias
  private fb = inject(FormBuilder);
  private servicio = inject(Inventario);
  private servicioFinca = inject(Finca);
  private servicioPlaguicida = inject(PlaguicidaRegistrado);
  private servicioFertilizante = inject(FertilizanteRegistrado);
  private router = inject(Router);
  private dialogo = inject(MatDialog);

  // Listas
  public fincas: Ifinca[] = [];
  public plaguicidas: IPlaguicidaRegistrado[] = [];
  public fertilizantes: IFertilizanteRegistrado[] = [];
  public productos: IInventario[] = [];

  public unidadesMedida = UNIDADES_MEDIDA;

  public origenProducto: string[] = [
    'Plaguicida registrado',
    'Fertilizante registrado',
    'Producto manual'
  ];

  // Formulario
  public form = this.fb.group({
    id_finca: [null, Validators.required],
    tipo_producto: ['', Validators.required],
    id_plaguicida_registrado: [null],
    id_fertilizante_registrado: [null],
    nombre_manual: [''],
    descripcion_manual: [''],
    cantidad: [0, Validators.required],
    unidad_medida: ['', Validators.required],
    fecha_compra: [''],
    fecha_vencimiento: [''],
    ubicacion: [''],
    observaciones: [''],
    estado: [true]
  });

  // Inicio
  public ngOnInit(): void {
    this.listarFincas();
    this.listarPlaguicidas();
    this.listarFertilizantes();
  }

  // Listar fincas
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

  // Listar plaguicidas registrados
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

  // Listar fertilizantes registrados
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

  // Cambio de tipo de producto
  public cambiarTipoProducto(): void {

    this.form.patchValue({
      id_plaguicida_registrado: null,
      id_fertilizante_registrado: null,
      nombre_manual: '',
      descripcion_manual: ''
    });
  }

  public agregarProducto(): void {

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
      this.mensajeError(
        'Debe seleccionar un plaguicida.'
      );
      return;
    }

    if (
      tipo === 'Fertilizante registrado'
      &&
      !this.form.value.id_fertilizante_registrado
    ) {
      this.mensajeError(
        'Debe seleccionar un fertilizante.'
      );
      return;
    }

    if (
      tipo === 'Producto manual'
      &&
      !this.form.value.nombre_manual
    ) {
      this.mensajeError(
        'Debe ingresar el nombre del producto.'
      );
      return;
    }

    const producto: IInventario = {

      id_finca: this.form.value.id_finca ?? null,

      tipo_producto: tipo!,

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

      unidad_medida: this.form.value.unidad_medida!,

      fecha_compra:
        this.form.value.fecha_compra || null,

      fecha_vencimiento:
        this.form.value.fecha_vencimiento || null,

      ubicacion:
        this.form.value.ubicacion || '',

      observaciones:
        this.form.value.observaciones || '',

      estado:
        this.form.value.estado ? 1 : 0
    };

    this.productos.push(producto);

    this.form.patchValue({

      tipo_producto: '',

      id_plaguicida_registrado: null,

      id_fertilizante_registrado: null,

      nombre_manual: '',

      descripcion_manual: '',

      cantidad: 0,

      unidad_medida: '',

      fecha_compra: '',

      fecha_vencimiento: '',

      ubicacion: '',

      observaciones: '',

      estado: true
    });
  }

  public obtenerNombreProducto(
    producto: IInventario
  ): string {

    if (
      producto.tipo_producto === 'Producto manual'
    ) {
      return producto.nombre_manual ?? '';
    }

    if (
      producto.tipo_producto === 'Plaguicida registrado'
    ) {

      const plaguicida = this.plaguicidas.find(
        p =>
          p.id_plaguicida_registrado ===
          producto.id_plaguicida_registrado
      );

      return plaguicida
        ? `${plaguicida.nombre_comercial}
         (${plaguicida.ingrediente_activo})`
        : '';
    }

    if (
      producto.tipo_producto === 'Fertilizante registrado'
    ) {

      const fertilizante =
        this.fertilizantes.find(
          f =>
            f.id_fertilizante_registrado ===
            producto.id_fertilizante_registrado
        );

      return fertilizante
        ? `${fertilizante.nombre_comercial}
         (${fertilizante.composicion})`
        : '';
    }

    return '';
  }

  public eliminarProducto(
    index: number
  ): void {

    this.productos.splice(index, 1);
  }

  // Guardar
  public guardar(): void {

    if (this.productos.length === 0) {

      this.mensajeError(
        'Debe agregar al menos un producto.'
      );

      return;
    }

    this.dialogo.open(Mensaje, {

      width: '100%',
      maxWidth: '420px',

      disableClose: true,

      data: {

        titulo: 'Confirmación',

        mensaje:
          '¿Desea guardar todos los productos?',

        confirmacion: true
      }

    }).afterClosed().subscribe(

      (resultado: boolean) => {

        if (!resultado) {
          return;
        }

        this.servicio.guardarLote(
          this.productos
        ).subscribe({

          next: () => {

            this.mensajeExito(
              'Productos guardados correctamente.'
            );
          },

          error: (err) => {

            console.error(err);

            this.mensajeError(
              'No se pudieron guardar los productos.'
            );
          }
        });
      }
    );
  }

  // Mensaje éxito
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

  // Mensaje error
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

  // Getter formulario
  public get f() {
    return this.form.controls;
  }
}