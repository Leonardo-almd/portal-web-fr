import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { PoNotificationService } from '@po-ui/ng-components';
import { from } from 'rxjs';

export const permissionGuard: CanActivateFn = (route, state) => {
  const user = localStorage.getItem('user');
  const userPermissions = user ? JSON.parse(user).permissions : null;
  const requiredEntity = route.data['entity'];
  const hasPermission = userPermissions.some((permission: any) => permission.entity === requiredEntity)
  const userAdmin = user ? JSON.parse(user).is_admin : null;
  if(!hasPermission && !userAdmin) {
    const poNotification = inject(PoNotificationService);
    poNotification.error('Acesso não permitido!');
    const router = inject(Router)
    router.navigate(['/access-denied'])
  }
  return userAdmin || hasPermission ? from([true]) : from([false]);
};
