import { Component, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { PoFieldModule, PoModalAction, PoModalComponent, PoModalModule, PoNotificationService } from '@po-ui/ng-components';
import { UserService } from '../../../../services/user.service';
import { strongPasswordValidator } from '../../../../validators/password.validator';

@Component({
  selector: 'app-form',
  standalone: true,
  imports: [PoModalModule, PoFieldModule, ReactiveFormsModule],
  templateUrl: './form.component.html',
  styleUrl: './form.component.scss'
})
export class FormComponent {
  @ViewChild(PoModalComponent, { static: true }) poModal!: PoModalComponent;

  callback: any;
  form: FormGroup;

  readonly primaryAction: PoModalAction = {
    label: 'Salvar',
    action: async() => {
      const payload = this.form.value;

      await this.service.createUser(payload).then(() => {
        this.poModal.close();
        this.callback();
        this.poNotification.success('Usuário salvo com sucesso!');
      }).catch(() => {
        this.poNotification.error('Erro ao criar usuário!');
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
      is_admin: [false],
      email: ['', [Validators.required, Validators.email]],
      name: ['', [Validators.required]],
      password: ['', [Validators.required, strongPasswordValidator(), Validators.minLength(6)]]
    })
    this.form.valueChanges.subscribe(() => {
      this.primaryAction.disabled = this.form.invalid;
    })
    this.poNotification.setDefaultDuration(2500)
  }


  open(user = null) {
    if (user) {
      console.log(user)
      this.form.patchValue(user);
    }
    this.poModal.open();
  }

}
