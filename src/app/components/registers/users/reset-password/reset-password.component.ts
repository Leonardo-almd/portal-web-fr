import { Component, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { PoFieldModule, PoModalAction, PoModalComponent, PoModalModule, PoNotificationService } from '@po-ui/ng-components';
import { UserService } from '../../../../services/user.service';
import { passwordMatchValidator, strongPasswordValidator } from '../../../../validators/password.validator';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [PoModalModule, PoFieldModule, ReactiveFormsModule],
  templateUrl: './reset-password.component.html',
  styleUrl: './reset-password.component.scss'
})
export class ResetPasswordComponent {
  @ViewChild(PoModalComponent, { static: true }) poModal!: PoModalComponent;

  form: FormGroup;

  readonly primaryAction: PoModalAction = {
    label: 'Salvar',
    action: async() => {
      const payload = {password: this.form.value.password};
      const id = this.form.value.id;

      await this.service.resetPassword(id, payload).then(() => {
        this.poModal.close();
        this.poNotification.success('Senha alterada com sucesso!');
      }).catch(() => {
        this.poNotification.error('Erro ao alterar senha!');
      })
    },
    disabled: true
  };

  readonly secundaryAction: PoModalAction = {
    label: 'Fechar',
    action: () => this.poModal.close(),
  };

  constructor(private fb: FormBuilder, private service: UserService, private poNotification: PoNotificationService){
    this.form = this.fb.group({
      id: [null],
      password: ['', [Validators.required, strongPasswordValidator(), Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]]
    },
    { validators : passwordMatchValidator() }
    )
    this.form.valueChanges.subscribe(() => {
      this.primaryAction.disabled = this.form.invalid;
    })
    this.poNotification.setDefaultDuration(2500)
  }


  open(userId: string) {
    if (userId) {
      this.form.patchValue({ id: userId });
    }
    this.poModal.open();
  }

}
