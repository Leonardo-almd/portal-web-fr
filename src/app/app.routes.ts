import { Routes } from '@angular/router';
import { AuthComponent } from './components/auth/auth.component';
import { authGuard } from './guards/auth.guard';
import { ListComponent } from './components/registers/users/list/list.component';
import { ListComponent as InvoiceListComponent } from './components/menu/invoice/list/list.component';
import { ListComponent as BranchListComponent } from './components/registers/branches/list/list.component';
import { ListComponent as ProcessListComponent } from './components/registers/process/list/list.component';
import { ListComponent as CustomerListComponent } from './components/registers/customer/list/list.component';
import { permissionGuard } from './guards/permission.guard';
import { AccessDeniedComponent } from './components/access-denied/access-denied.component';

export const routes: Routes = [
  { path: 'auth', component: AuthComponent },
  {
    path: 'menu',
    canActivate: [authGuard],
    children: [
      { path: 'invoice', component: InvoiceListComponent, canActivate: [], data: { entity: 'invoice' }},
    ]
  },
  {
    path: 'register',
    canActivate: [authGuard],
    children: [
      { path: 'user', component: ListComponent, data: { entity: 'users' }, canActivate: [permissionGuard]},
      { path: 'branch', component: BranchListComponent, data: { entity: 'branches' }, canActivate: [permissionGuard]},
      { path: 'process', component: ProcessListComponent, data: { entity: 'processes' }, canActivate: [permissionGuard]},
      { path: 'customer', component: CustomerListComponent, data: { entity: 'customers' }, canActivate: [permissionGuard]},
    ]
  },
  {
      path: 'access-denied', component: AccessDeniedComponent
  },
  { path: '**', redirectTo: '/register/user' }
];
