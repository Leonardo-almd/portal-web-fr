import { Routes } from '@angular/router';
import { AuthComponent } from './components/auth/auth.component';
import { authGuard } from './guards/auth.guard';
import { ListComponent } from './components/registers/users/list/list.component';
import { ListComponent as InvoiceListComponent } from './components/menu/invoice/list/list.component';
import { ListComponent as BranchListComponent } from './components/registers/branches/list/list.component';

import { roleGuard } from './guards/role.guard';

export const routes: Routes = [
  { path: 'auth', component: AuthComponent },
  {
    path: 'menu',
    canActivate: [authGuard],
    children: [
      { path: 'invoice', component: InvoiceListComponent},
    ]
  },
  {
    path: 'register',
    canActivate: [authGuard],
    children: [
      { path: 'user', component: ListComponent, canActivate: [roleGuard]},
      { path: 'branch', component: BranchListComponent},
    ]
  },
  { path: '**', redirectTo: '/menu/invoice' }
];
