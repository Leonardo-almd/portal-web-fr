import { Component, ViewChild } from '@angular/core';
import { PoPageLoginModule, PoModalPasswordRecoveryModule, PoPageLoginRecovery, PoModalPasswordRecoveryComponent } from '@po-ui/ng-templates';
import { PoLinkModule, PoNotificationService } from '@po-ui/ng-components';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-auth',
  standalone: true,
  imports: [PoPageLoginModule ],
  templateUrl: './auth.component.html',
  styleUrl: './auth.component.scss'
})
export class AuthComponent {
  @ViewChild(PoModalPasswordRecoveryComponent) poModalPasswordRecovery!: PoModalPasswordRecoveryComponent;
  logo = 'assets/logo.jpeg';
  constructor(private service: AuthService, private poNotification: PoNotificationService){}

  login(event: any){
    this.service.login(event.login, event.password)
  }

  recoverPassword(){
    this.poModalPasswordRecovery.open();
  }

  // onSubmitRecover(event: {email: string}){
  //   this.service.recoverPassword(event.email).then(() => {
  //     this.poNotification.success('Email enviado com sucesso!');
  //   }
  //   ).catch(() => {
  //     this.poNotification.error('Erro ao enviar email!');
  //   })

  // }

}
