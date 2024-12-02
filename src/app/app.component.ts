import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { Component } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';

import {
  PoDialogService,
  PoIconModule,
  PoMenuItem,
  PoMenuModule,
  PoPageModule,
  PoToolbarModule,
} from '@po-ui/ng-components';
import { AuthService } from './services/auth.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    PoToolbarModule,
    PoMenuModule,
    PoPageModule,
    HttpClientModule,
    PoIconModule
  ],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent {
  constructor(public authService: AuthService, private router: Router, private poAlert: PoDialogService){}
  readonly menus: Array<PoMenuItem> = [
    { label: 'Invoices', icon: 'ph ph-files', shortLabel: 'Invoices', link: '/menu/invoice' },
    { label: 'Cadastros', icon: 'ph ph-database', shortLabel: 'Cadastros', subItems: [
      { label: 'Usuários', shortLabel: 'Usuários', link: '/register/user' },
      { label: 'Filiais', shortLabel: 'Filiais', link: '/register/branch' },
    ] },
    { label: 'Sair', icon: 'ph ph-sign-out', shortLabel: 'Sair', action: () => this.logout()}
  ];


logout(){
  this.poAlert.confirm({
    literals: { cancel: 'Não', confirm: 'Sim' },
    title: 'Sair do sistema',
    message: 'Deseja realmente sair do sistema?',
    confirm: () => {
      this.authService.logout();
    },
    cancel: () => undefined
  });

}


}
