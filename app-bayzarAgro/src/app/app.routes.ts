import { Routes } from '@angular/router';

import { authGuard } from './shared/guards/auth-guard';
import { rolGuard } from './shared/guards/rol-guard';
import { noAuthGuard } from './shared/guards/no-auth-guard';

export const routes: Routes = [

    // HOME PÚBLICO
    {
        path: '',
        pathMatch: 'full',
        loadComponent: () =>
            import('./web/public/home/home')
                .then(c => c.Home)
    },

    // TÉRMINOS Y CONDICIONES
    {
        path: 'terminos-condiciones',
        title: 'Términos y condiciones - BayzarAgro',
        loadComponent: () =>
            import('./web/public/terminos-condiciones/terminos-condiciones')
                .then(c => c.TerminosCondiciones)
    },

    // POLÍTICAS DE PRIVACIDAD
    {
        path: 'politicas-privacidad',
        title: 'Políticas de privacidad - BayzarAgro',
        loadComponent: () =>
            import('./web/public/politicas-privacidad/politicas-privacidad')
                .then(c => c.PoliticasPrivacidad)
    },

    // LOGIN
    {
        path: 'login',
        title: 'Login - BayzarAgro',
        canActivate: [noAuthGuard],
        loadComponent: () =>
            import('./web/auth/login/login')
                .then(c => c.Login)
    },

    // REGISTRO PÚBLICO
    {
        path: 'registro',
        title: 'Registro - BayzarAgro',
        canActivate: [noAuthGuard],
        loadComponent: () =>
            import('./web/public/registro/registro')
                .then(c => c.Registro)
    },

    // BIENVENIDA PÚBLICA
    {
        path: 'bienvenida',
        title: 'Bienvenido - BayzarAgro',
        canActivate: [noAuthGuard],
        loadComponent: () =>
            import('./web/public/bienvenida/bienvenida')
                .then(c => c.Bienvenida)
    },

    // APP PRIVADA
    {
        path: 'app',
        canActivate: [authGuard],
        loadComponent: () =>
            import('./shared/layout/layout/layout')
                .then(c => c.Layout),

        children: [

            // REDIRECT INTERNO
            {
                path: '',
                redirectTo: 'inicio',
                pathMatch: 'full'
            },

            // INICIO
            {
                path: 'inicio',
                loadComponent: () =>
                    import('./web/inicio/inicio')
                        .then(c => c.Inicio)
            },

            // USUARIOS
            {
                path: 'usuarios',
                canActivate: [rolGuard],
                data: {
                    roles: ['Administrador']
                },
                loadComponent: () =>
                    import('./web/usuario/listar-usuario/listar-usuario')
                        .then(c => c.ListarUsuario)
            },
            {
                path: 'usuarios/guardar',
                canActivate: [rolGuard],
                data: {
                    roles: ['Administrador']
                },
                loadComponent: () =>
                    import('./web/usuario/guardar-usuario/guardar-usuario')
                        .then(c => c.GuardarUsuario)
            },
            {
                path: 'usuarios/actualizar/:id',
                canActivate: [rolGuard],
                data: {
                    roles: ['Administrador']
                },
                loadComponent: () =>
                    import('./web/usuario/actualizar-usuario/actualizar-usuario')
                        .then(c => c.ActualizarUsuario)
            },

            // FINCAS
            {
                path: 'fincas',
                loadComponent: () =>
                    import('./web/finca/listar-finca/listar-finca')
                        .then(c => c.ListarFinca)
            },
            {
                path: 'fincas/guardar',
                loadComponent: () =>
                    import('./web/finca/guardar-finca/guardar-finca')
                        .then(c => c.GuardarFinca)
            },
            {
                path: 'fincas/actualizar/:id',
                loadComponent: () =>
                    import('./web/finca/actualizar-finca/actualizar-finca')
                        .then(c => c.ActualizarFinca)
            },

            // CULTIVOS
            {
                path: 'cultivos',
                loadComponent: () =>
                    import('./web/cultivo/listar-cultivo/listar-cultivo')
                        .then(c => c.ListarCultivo)
            },
            {
                path: 'cultivos/guardar',
                loadComponent: () =>
                    import('./web/cultivo/guardar-cultivo/guardar-cultivo')
                        .then(c => c.GuardarCultivo)
            },
            {
                path: 'cultivos/actualizar/:id',
                loadComponent: () =>
                    import('./web/cultivo/actualizar-cultivo/actualizar-cultivo')
                        .then(c => c.ActualizarCultivo)
            },

            // ACTIVIDADES
            {
                path: 'actividades',
                loadComponent: () =>
                    import('./web/actividad/listar-actividad/listar-actividad')
                        .then(c => c.ListarActividad)
            },
            {
                path: 'actividades/guardar',
                loadComponent: () =>
                    import('./web/actividad/guardar-actividad/guardar-actividad')
                        .then(c => c.GuardarActividad)
            },
            {
                path: 'actividades/actualizar/:id',
                loadComponent: () =>
                    import('./web/actividad/actualizar-actividad/actualizar-actividad')
                        .then(c => c.ActualizarActividad)
            },

            // INVENTARIO
            {
                path: 'inventario',
                loadComponent: () =>
                    import('./web/inventario/listar-inventario/listar-inventario')
                        .then(c => c.ListarInventario)
            },
            {
                path: 'inventario/guardar',
                loadComponent: () =>
                    import('./web/inventario/guardar-inventario/guardar-inventario')
                        .then(c => c.GuardarInventario)
            },
            {
                path: 'inventario/actualizar/:id',
                loadComponent: () =>
                    import('./web/inventario/actualizar-inventario/actualizar-inventario')
                        .then(c => c.ActualizarInventario)
            },

            // PLAGAS
            {
                path: 'plagas',
                loadComponent: () =>
                    import('./web/plaga/listar-plaga/listar-plaga')
                        .then(c => c.ListarPlaga)
            },
            {
                path: 'plagas/guardar',
                loadComponent: () =>
                    import('./web/plaga/guardar-plaga/guardar-plaga')
                        .then(c => c.GuardarPlaga)
            },
            {
                path: 'plagas/actualizar/:id',
                loadComponent: () =>
                    import('./web/plaga/actualizar-plaga/actualizar-plaga')
                        .then(c => c.ActualizarPlaga)
            },

            // CATÁLOGO: PLAGUICIDAS
            {
                path: 'plaguicidas-registrados',
                canActivate: [rolGuard],
                data: {
                    roles: ['Administrador']
                },
                loadComponent: () =>
                    import('./web/plaguicida-registrado/listar-plaguicida-registrado/listar-plaguicida-registrado')
                        .then(c => c.ListarPlaguicidaRegistrado)
            },
            {
                path: 'plaguicidas-registrados/guardar',
                canActivate: [rolGuard],
                data: {
                    roles: ['Administrador']
                },
                loadComponent: () =>
                    import('./web/plaguicida-registrado/guardar-plaguicida-registrado/guardar-plaguicida-registrado')
                        .then(c => c.GuardarPlaguicidaRegistrado)
            },
            {
                path: 'plaguicidas-registrados/actualizar/:id',
                canActivate: [rolGuard],
                data: {
                    roles: ['Administrador']
                },
                loadComponent: () =>
                    import('./web/plaguicida-registrado/actualizar-plaguicida-registrado/actualizar-plaguicida-registrado')
                        .then(c => c.ActualizarPlaguicidaRegistrado)
            },

            // CATÁLOGO: FERTILIZANTES
            {
                path: 'fertilizantes-registrados',
                canActivate: [rolGuard],
                data: {
                    roles: ['Administrador']
                },
                loadComponent: () =>
                    import('./web/fertilizante-registrado/listar-fertilizante-registrado/listar-fertilizante-registrado')
                        .then(c => c.ListarFertilizanteRegistrado)
            },
            {
                path: 'fertilizantes-registrados/guardar',
                canActivate: [rolGuard],
                data: {
                    roles: ['Administrador']
                },
                loadComponent: () =>
                    import('./web/fertilizante-registrado/guardar-fertilizante-registrado/guardar-fertilizante-registrado')
                        .then(c => c.GuardarFertilizanteRegistrado)
            },
            {
                path: 'fertilizantes-registrados/actualizar/:id',
                canActivate: [rolGuard],
                data: {
                    roles: ['Administrador']
                },
                loadComponent: () =>
                    import('./web/fertilizante-registrado/actualizar-fertilizante-registrado/actualizar-fertilizante-registrado')
                        .then(c => c.ActualizarFertilizanteRegistrado)
            },

            // CATÁLOGO: PLAGAS REGISTRADAS
            {
                path: 'plagas-registradas',
                canActivate: [rolGuard],
                data: {
                    roles: ['Administrador']
                },
                loadComponent: () =>
                    import('./web/plaga-registrada/listar-plaga-registrada/listar-plaga-registrada')
                        .then(c => c.ListarPlagaRegistrada)
            },
            {
                path: 'plagas-registradas/guardar',
                canActivate: [rolGuard],
                data: {
                    roles: ['Administrador']
                },
                loadComponent: () =>
                    import('./web/plaga-registrada/guardar-plaga-registrada/guardar-plaga-registrada')
                        .then(c => c.GuardarPlagaRegistrada)
            },
            {
                path: 'plagas-registradas/actualizar/:id',
                canActivate: [rolGuard],
                data: {
                    roles: ['Administrador']
                },
                loadComponent: () =>
                    import('./web/plaga-registrada/actualizar-plaga-registrada/actualizar-plaga-registrada')
                        .then(c => c.ActualizarPlagaRegistrada)
            },

            // COSTOS
            {
                path: 'costos',
                loadComponent: () =>
                    import('./web/costo/listar-costo/listar-costo')
                        .then(c => c.ListarCosto)
            },
            {
                path: 'costos/guardar',
                loadComponent: () =>
                    import('./web/costo/guardar-costo/guardar-costo')
                        .then(c => c.GuardarCosto)
            },
            {
                path: 'costos/actualizar/:id',
                loadComponent: () =>
                    import('./web/costo/actualizar-costo/actualizar-costo')
                        .then(c => c.ActualizarCosto)
            },

            // PRODUCCIÓN
            {
                path: 'produccion',
                loadComponent: () =>
                    import('./web/produccion/listar-produccion/listar-produccion')
                        .then(c => c.ListarProduccion)
            },
            {
                path: 'produccion/guardar',
                loadComponent: () =>
                    import('./web/produccion/guardar-produccion/guardar-produccion')
                        .then(c => c.GuardarProduccion)
            },
            {
                path: 'produccion/actualizar/:id',
                loadComponent: () =>
                    import('./web/produccion/actualizar-produccion/actualizar-produccion')
                        .then(c => c.ActualizarProduccion)
            },

            // INGRESOS
            {
                path: 'ingresos',
                loadComponent: () =>
                    import('./web/ingreso/listar-ingreso/listar-ingreso')
                        .then(c => c.ListarIngreso)
            },
            {
                path: 'ingresos/guardar',
                loadComponent: () =>
                    import('./web/ingreso/guardar-ingreso/guardar-ingreso')
                        .then(c => c.GuardarIngreso)
            },
            {
                path: 'ingresos/actualizar/:id',
                loadComponent: () =>
                    import('./web/ingreso/actualizar-ingreso/actualizar-ingreso')
                        .then(c => c.ActualizarIngreso)
            },

            // ALERTAS
            {
                path: 'alertas',
                loadComponent: () =>
                    import('./web/alerta/listar-alerta/listar-alerta')
                        .then(c => c.ListarAlerta)
            },

            // REPORTES
            {
                path: 'reportes/financiero',
                loadComponent: () =>
                    import('./web/reporte/reporte-financiero/reporte-financiero')
                        .then(c => c.ReporteFinanciero)
            },

            // PERFIL
            {
                path: 'perfil',
                loadComponent: () =>
                    import('./web/perfil/perfil/perfil')
                        .then(c => c.Perfil)
            }
        ]
    },

    // 404
    {
        path: '**',
        redirectTo: ''
    }
];