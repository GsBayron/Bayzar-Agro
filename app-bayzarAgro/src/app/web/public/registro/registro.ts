import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { catchError, finalize, of, timeout } from 'rxjs';

import { Publico } from '../../../shared/services/publico';

import { IPlan } from '../../../shared/interfaces/iplan';
import {
  IRegistro,
  IRespuestaRegistro
} from '../../../shared/interfaces/iregistro';

@Component({
  selector: 'app-registro',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    ReactiveFormsModule
  ],
  templateUrl: './registro.html',
  styleUrl: './registro.scss'
})
export class Registro implements OnInit {

  private fb = inject(FormBuilder);
  private ruta = inject(ActivatedRoute);
  private router = inject(Router);
  private publico = inject(Publico);
  private cd = inject(ChangeDetectorRef);

  public planes: IPlan[] = [];
  public cargandoPlanes = false;
  public guardando = false;
  public error = '';

  public form = this.fb.group({
    nombre: ['', Validators.required],
    apellidos: [''],
    correo: ['', [Validators.required, Validators.email]],
    telefono: [''],
    secreto: ['', [Validators.required, Validators.minLength(8), Validators.maxLength(255)]],
    confirmar_secreto: ['', Validators.required],
    plan: ['gratuito', Validators.required]
  });

  public get f() {
    return this.form.controls;
  }

  public ngOnInit(): void {

    const plan = this.ruta.snapshot.queryParamMap.get('plan');

    if (plan) {
      this.form.patchValue({
        plan: plan
      });
    }

    this.listarPlanes();
  }

  public listarPlanes(): void {

    this.cargandoPlanes = true;

    this.publico.listarPlanes().pipe(
      timeout({
        first: 8000
      }),
      catchError((err) => {
        console.error(err);
        this.error = 'No se pudieron cargar los planes. Inténtelo nuevamente.';
        return of([] as IPlan[]);
      }),
      finalize(() => {
        this.cargandoPlanes = false;
        this.cd.detectChanges();
      })
    ).subscribe({
      next: (resp: IPlan[]) => {

        this.planes = Array.isArray(resp) ? resp : [];

        this.validarPlanSeleccionado();
      }
    });
  }

  private validarPlanSeleccionado(): void {

    const planActual = this.form.value.plan || 'gratuito';

    const existePlan = this.planes.some(
      item => item.codigo === planActual
    );

    if (!existePlan && this.planes.length > 0) {
      this.form.patchValue({
        plan: this.planes[0].codigo
      });
    }
  }

  public seleccionarPlan(codigo: string): void {
    this.form.patchValue({
      plan: codigo
    });
  }

  public planSeleccionado(codigo: string): boolean {
    return this.form.value.plan === codigo;
  }

  public registrar(): void {

    this.error = '';

    if (this.planes.length === 0) {
      this.error = 'Debe cargar y seleccionar un plan antes de registrarse.';
      return;
    }

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const secreto = this.form.value.secreto || '';
    const confirmar = this.form.value.confirmar_secreto || '';

    if (secreto !== confirmar) {
      this.error = 'La confirmación de contraseña no coincide.';
      return;
    }

    this.guardando = true;

    const datos = this.form.getRawValue();

    const payload: IRegistro = {
      nombre: datos.nombre || '',
      apellidos: datos.apellidos || '',
      correo: datos.correo || '',
      telefono: datos.telefono || '',
      secreto: datos.secreto || '',
      confirmar_secreto: datos.confirmar_secreto || '',
      plan: datos.plan || 'gratuito'
    };

    this.publico.registrar(payload).pipe(
      finalize(() => {
        this.guardando = false;
        this.cd.detectChanges();
      })
    ).subscribe({
      next: (resp: IRespuestaRegistro) => {
        if (resp.redirect) {
          this.router.navigateByUrl(resp.redirect);
          return;
        }

        this.router.navigate(['/bienvenida'], {
          queryParams: {
            tipo: resp.requiere_pago ? 'pago-pendiente' : 'gratuito'
          }
        });
      },
      error: (err) => {
        console.error(err);

        if (err.status === 422) {
          this.error = 'Revise la información ingresada. El correo podría estar registrado o el plan no es válido.';
          return;
        }

        this.error = 'No se pudo completar el registro. Inténtelo nuevamente.';
      }
    });
  }

  public formatoPrecio(precio: number | string | null | undefined): string {

    const valor = Number(precio || 0);

    if (valor === 0) {
      return 'Gratis';
    }

    return valor.toLocaleString('es-CR', {
      style: 'currency',
      currency: 'CRC',
      minimumFractionDigits: 0
    });
  }

  public tienePrecio(precio: number | string | null | undefined): boolean {
    return Number(precio || 0) > 0;
  }

  public beneficiosPlan(codigo: string): string[] {

    if (codigo === 'gratuito') {
      return [
        'Usuarios limitados',
        'Funcionalidades básicas',
        'Registro de fincas y cultivos',
        'Inventario básico',
        'Soporte básico'
      ];
    }

    if (codigo === 'emprendedor') {
      return [
        'Más usuarios disponibles',
        'Gestión completa de actividades',
        'Costos e ingresos',
        'Reportes avanzados',
        'Soporte prioritario'
      ];
    }

    return [
      'Funcionalidades completas',
      'Usuarios ampliados',
      'Dashboard ejecutivo',
      'Reportes premium',
      'Soporte preferencial'
    ];
  }
  public planActual(): IPlan | undefined {
    return this.planes.find(
      plan => plan.codigo === this.form.value.plan
    );
  }

  public esPlanPago(): boolean {
    const plan = this.planActual();

    if (!plan) {
      return false;
    }

    return Number(plan.precio_mensual || 0) > 0;
  }

  public nombrePlanSeleccionado(): string {
    return this.planActual()?.nombre || 'Gratuito';
  }

  public precioPlanSeleccionado(): string {
    const plan = this.planActual();

    if (!plan) {
      return 'Gratis';
    }

    return this.formatoPrecio(plan.precio_mensual);
  }
}
