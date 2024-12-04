import { PermissionsComponent } from './../permissions/permissions.component';
import { Component, ComponentFactoryResolver, OnInit, ViewContainerRef, signal } from '@angular/core';
import {
  PoButtonModule,
  PoContainerModule,
  PoDialogService,
  PoLoadingModule,
  PoNotificationService,
  PoPageAction,
  PoPageModule,
  PoSwitchModule,
  PoTableAction,
  PoTableColumn,
  PoTableModule,
} from '@po-ui/ng-components';
import { UserService } from '../../../../services/user.service';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { PoPageDynamicSearchModule } from '@po-ui/ng-templates';

@Component({
  selector: 'app-list',
  standalone: true,
  imports: [
    PoPageModule,
    PoTableModule,
    PoSwitchModule,
    FormsModule,
    PoLoadingModule,
    PoButtonModule,
    PoContainerModule,
    PoPageDynamicSearchModule
  ],
  templateUrl: './list.component.html',
  styleUrl: './list.component.scss',
})
export class ListComponent implements OnInit {
  tableItems = signal<any[]>([]);
  isLoading = signal(true);
  hasNext = signal(false);
  filter = signal({
    pageSize: 10,
    page: 1,
    search: ''
  });

  public readonly pageActions: Array<PoPageAction> = [
    {
      label: 'Criar Usuário',
      action: this.onCreate.bind(this),
      icon: 'ph ph-plus'
    }
  ]

  public readonly tableColumns: Array<PoTableColumn> = [
    { property: 'is_admin', label: 'Administrador', type: 'cellTemplate' },
    { property: 'id', label: 'ID', type: 'number' },
    { property: 'name', label: 'Nome', type: 'string' },
    { property: 'email', label: 'Email', type: 'string' }
  ];

  public readonly tableActions: Array<PoTableAction> = [
    {
      icon: 'ph ph-trash',
      label: 'Apagar',
      action: this.onDelete.bind(this),
      type: 'danger'
    },
    {
      icon: 'ph ph-pencil-simple',
      label: 'Editar',
      action: this.onCreate.bind(this),
    },
    {
      icon: 'ph ph-lock-key',
      label: 'Resetar senha',
      action: this.onResetPassword.bind(this),
    },
    {
      icon: 'ph ph-gear',
      label: 'Permissões',
      action: this.openPermissionsModal.bind(this)
    }
  ];

  constructor(
    private service: UserService,
    private poNotification: PoNotificationService,
    private poAlert: PoDialogService,
    private vcref: ViewContainerRef
  ) {
    this.poNotification.setDefaultDuration(2500);
  }

  ngOnInit() {
    this.refreshUsers();
  }

  refreshUsers() {
    this.isLoading.set(true);
    this.service.getUsers(this.filter()).subscribe({
      next: (res: any) => {
        if (res) {
          if(this.filter().page == 1){
            this.tableItems.set(res.data);
          } else {
            this.tableItems.set([...this.tableItems(), ...res.data]);
          }
        this.hasNext.set(res.hasNext);
        this.isLoading.set(false);
        } else {
          this.isLoading.set(false);
        }
      },
      error: (error) => {
        console.error(error);
        this.poNotification.error(`Erro ao buscar usuários: ${error}`);
        this.isLoading.set(false);
      },
    });
  }

  onShowMore() {
    this.filter.set({
      ...this.filter(),
      page: this.filter().page + 1
    });
    this.refreshUsers();
  }

  async onChangeStatus(event: any, user: any) {
    await this.service
      .toggleUserRole(user.id, event)
      .then(() => {
        this.poNotification.success('Permissão alterada com sucesso');
      })
      .catch(() => {
        user.is_admin = !event
        this.poNotification.error('Erro ao alterar permissão');
      });
  }

  async onDelete(user: any) {
    this.poAlert.confirm({
      literals: { cancel: 'Não', confirm: 'Sim' },
      title: 'Excluir usuário',
      message: 'Deseja realmente excluir o usuário?',
      confirm: async () => {
        await this.service
          .deleteUser(user.id)
          .then(() => {
            this.poNotification.success('Usuário excluído com sucesso');
            this.resetFilter();
          })
          .catch(() => {
            this.poNotification.error('Erro ao excluir usuário');
          });
      },
      cancel: () => undefined,
    });
  }

  async onCreate(row = null) {
    this.vcref.clear();
    const { FormComponent } = await import('../form/form.component');
    const comp = this.vcref.createComponent(FormComponent)
    comp.instance.callback = () => {
      this.resetFilter();
    }
    comp.instance.open(row)
  }

  async onResetPassword(row: any){
    this.vcref.clear();
    const { ResetPasswordComponent } = await import('../reset-password/reset-password.component');
    const comp = this.vcref.createComponent(ResetPasswordComponent)
    comp.instance.open(row.id)
  }

  async openPermissionsModal(row: any){
    this.vcref.clear();
    const { PermissionsComponent } = await import('../permissions/permissions.component');
    const comp = this.vcref.createComponent(PermissionsComponent)
    comp.instance.open(row.id)
  }

  resetFilter() {
    this.filter.set({
      pageSize: 10,
      page: 1,
      search: ''
    });
    this.refreshUsers();
  }

  onSearch(value: string) {
    if( Array.isArray(value) ){
      this.resetFilter();
      return;
    }
    this.filter.set({
      ...this.filter(),
      page: 1,
      search: value
    });
    this.refreshUsers();
  }
}
