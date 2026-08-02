import { inject } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivateFn, Router } from '@angular/router';

import { Auth } from '../services/auth';

export const rolGuard: CanActivateFn = (route: ActivatedRouteSnapshot) => {
  const auth = inject(Auth);
  const router = inject(Router);
  const rolesPermitidos = route.data['roles'];

  if (
    Array.isArray(rolesPermitidos)
    && rolesPermitidos.includes(auth.obtenerRol())
  ) {
    return true;
  }

  return router.createUrlTree(['/app/inicio']);
};
