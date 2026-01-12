import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const superAdminGuard = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isSuperAdminAuthenticated()) {
    return true;
  }

  router.navigate(['/superadmin']);
  return false;
};

