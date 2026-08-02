import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { finalize } from 'rxjs';

import { Publico } from '../../../shared/services/publico';
import { IPlan } from '../../../shared/interfaces/iplan';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink
  ],
  templateUrl: './home.html',
  styleUrl: './home.scss'
})
export class Home implements OnInit {

  private servicioPublico = inject(Publico);
  private cd = inject(ChangeDetectorRef);

  public planes: IPlan[] = [];
  public cargandoPlanes = false;
  public menuMovilAbierto = false;

  public beneficios = [
    {
      icono: 'bi-check2-circle',
      titulo: 'Gestión simplificada',
      descripcion: 'Centralice fincas, cultivos, actividades e insumos en una sola plataforma.'
    },
    {
      icono: 'bi-lightning-charge',
      titulo: 'Automatización de procesos',
      descripcion: 'Controle alertas, productos por vencer, actividades pendientes y riesgos agrícolas.'
    },
    {
      icono: 'bi-phone',
      titulo: 'Acceso desde cualquier dispositivo',
      descripcion: 'Utilice BayzarAgro desde computadora, tablet o celular.'
    },
    {
      icono: 'bi-bar-chart-line',
      titulo: 'Reportes en tiempo real',
      descripcion: 'Consulte costos, ingresos, producción y ganancia estimada de sus cultivos.'
    }
  ];

  public funcionalidades = [
    {
      icono: 'bi-kanban',
      titulo: 'Módulo operativo',
      descripcion: 'Fincas, cultivos, actividades, inventario, plagas y producción.'
    },
    {
      icono: 'bi-gear',
      titulo: 'Gestión administrativa',
      descripcion: 'Usuarios, roles, catálogos agrícolas y control interno.'
    },
    {
      icono: 'bi-file-earmark-bar-graph',
      titulo: 'Reportes',
      descripcion: 'Informes financieros, costos por tipo, ingresos y producción por cultivo.'
    },
    {
      icono: 'bi-people',
      titulo: 'Control de usuarios',
      descripcion: 'Accesos diferenciados para administrador y agricultor.'
    },
    {
      icono: 'bi-speedometer2',
      titulo: 'Dashboard ejecutivo',
      descripcion: 'Indicadores clave, alertas, clima, ingresos, costos y ganancias.'
    }
  ];

  public testimonios = [
    {
      nombre: 'Productor agrícola',
      ubicacion: 'Alajuela, Costa Rica',
      comentario: 'BayzarAgro nos ayuda a llevar un mejor control de actividades, inventario y costos de producción.'
    },
    {
      nombre: 'Pequeña finca familiar',
      ubicacion: 'Cartago, Costa Rica',
      comentario: 'Ahora tenemos más claridad sobre lo que producimos, lo que gastamos y lo que vendemos.'
    },
    {
      nombre: 'Emprendimiento agrícola',
      ubicacion: 'San Carlos, Costa Rica',
      comentario: 'La plataforma facilita organizar la información agrícola sin depender de hojas sueltas o archivos separados.'
    }
  ];

  public ngOnInit(): void {
    this.listarPlanes();
  }

  public listarPlanes(): void {

    this.cargandoPlanes = true;

    this.servicioPublico.listarPlanes().pipe(
      finalize(() => {
        this.cargandoPlanes = false;
        this.cd.detectChanges();
      })
    ).subscribe({
      next: (resp: IPlan[]) => {
        this.planes = resp;
      },
      error: (err) => {
        console.error(err);
        this.planes = [];
      }
    });
  }

  public toggleMenuMovil(): void {
    this.menuMovilAbierto = !this.menuMovilAbierto;
  }

  public cerrarMenuMovil(): void {
    this.menuMovilAbierto = false;
  }

  public irASeccion(id: string): void {
    this.cerrarMenuMovil();

    const elemento = document.getElementById(id);

    if (elemento) {
      elemento.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
    }
  }

  public formatoPrecio(precio: number | string): string {

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
}
