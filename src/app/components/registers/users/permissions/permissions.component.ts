import { Component, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { PoFieldModule, PoModalAction, PoModalComponent, PoModalModule, PoNotificationService } from '@po-ui/ng-components';
import { UserService } from '../../../../services/user.service';
import { passwordMatchValidator, strongPasswordValidator } from '../../../../validators/password.validator';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-permissions',
  standalone: true,
  imports: [PoModalModule, PoFieldModule, ReactiveFormsModule, FormsModule, CommonModule],
  templateUrl: './permissions.component.html',
  styleUrl: './permissions.component.scss'
})
export class PermissionsComponent {
  @ViewChild(PoModalComponent, { static: true }) poModal!: PoModalComponent;

  form: FormGroup;

  allPermissions = [
    { entity: 'customers', label: 'Clientes', enable: false },
    { entity: 'invoice', label: 'Invoices', enable: false },
    { entity: 'branches', label: 'Filiais', enable: false  },
    { entity: 'processes', label: 'Processos', enable: false  },
    { entity: 'users', label: 'Usuários', enable: false  },
  ];

  readonly primaryAction: PoModalAction = {
    label: 'Salvar',
    action: async() => {
      await this.service.updatePermissions(this.form.value.id, this.allPermissions).then(() => {
        this.poModal.close();
        this.poNotification.success('Permissões alteradas com sucesso!');
      }).catch(() => {
        this.poNotification.error('Erro ao alterar permissões!');
      })

    }
  };

  readonly secundaryAction: PoModalAction = {
    label: 'Fechar',
    action: () => this.poModal.close(),
  };

  constructor(private fb: FormBuilder, private service: UserService, private poNotification: PoNotificationService){
    this.form = this.fb.group({
      id: [null],
    }
    )
    this.poNotification.setDefaultDuration(2500)
  }


  open(userId: string) {
    if (userId) {
      this.form.patchValue({ id: userId });
      this.service.getPermissionsByUser(userId).subscribe({
        next: (res: any) => {
          this.allPermissions.forEach(permission => {
            permission.enable = res.some(
              (userPermission: any) =>
                userPermission.entity === permission.entity
            );
          });
        }
      })
    }
    this.poModal.open();
  }

}
