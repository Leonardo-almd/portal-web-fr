import { inject } from '@angular/core';
import { CanActivateFn } from '@angular/router';
import { PoNotificationService } from '@po-ui/ng-components';
import { from } from 'rxjs';

export const roleGuard: CanActivateFn = (route, state) => {
  console.log('roleGuard');
  const user = localStorage.getItem('user');
  const userAdmin = user ? JSON.parse(user).is_admin : null;
  if(!userAdmin){
    const poNotification = inject(PoNotificationService);
    poNotification.error('Acesso não permitido!');
  }
  return userAdmin ? from([true]) : from([false]);
};
