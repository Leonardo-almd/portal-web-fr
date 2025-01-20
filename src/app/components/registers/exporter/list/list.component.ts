import { Component, OnInit, ViewContainerRef, signal } from '@angular/core';
import {
  PoButtonModule,
  PoContainerModule,
  PoDialogService,
  PoLoadingModule,
  PoNotificationService,
  PoPageModule,
  PoSwitchModule,
  PoTableAction,
  PoTableColumn,
  PoTableModule,
  PoPageAction} from '@po-ui/ng-components';
import { PoPageDynamicSearchModule } from '@po-ui/ng-templates';
import { FormsModule } from '@angular/forms';
import { ExporterService } from '../../../../services/exporter.service';

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
    search: ""
  });

  public readonly pageActions: Array<PoPageAction> = [
    {
      label: 'Criar Exportador',
      action: this.onCreate.bind(this),
      icon: 'ph ph-plus'
    }
  ]

  public readonly tableColumns: Array<PoTableColumn> = [
    // { property: 'is_admin', label: 'Administrador', type: 'cellTemplate', width: '150px' },
    { property: 'id', label: 'ID', type: 'number' },
    { property: 'name', label: 'Nome', type: 'string' },
    { property: 'address', label: 'Endereço', type: 'cellTemplate' },
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
      type: ''
    }
  ];

  constructor(
    private service: ExporterService,
    private poNotification: PoNotificationService,
    private poAlert: PoDialogService,
    private vcref: ViewContainerRef
  ) {
    this.poNotification.setDefaultDuration(2500);
  }

  ngOnInit() {
    this.refresh();
  }

  refresh() {
    this.isLoading.set(true);
    this.service.get(this.filter()).subscribe({
      next: (res: any) => {
        console.log(res)
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
        this.poNotification.error(`Erro ao buscar exportadores: ${error}`);
        this.isLoading.set(false);
      },
    });
  }

  onShowMore() {
    this.filter.set({
      ...this.filter(),
      page: this.filter().page + 1
    });
    this.refresh();
  }

  async onDelete(user: any) {
    this.poAlert.confirm({
      literals: { cancel: 'Não', confirm: 'Sim' },
      title: 'Excluir exportador',
      message: 'Deseja realmente excluir o exportador?',
      confirm: async () => {
        await this.service
          .delete(user.id)
          .then(() => {
            this.poNotification.success('Exportador excluída com sucesso');
            this.resetFilter();
          })
          .catch(() => {
            this.poNotification.error('Erro ao excluir exportador');
          });
      },
      cancel: () => undefined,
    });
  }

  async onCreate(row = null){
    this.vcref.clear();
    const { FormComponent } = await import('../form/form.component');
    const comp = this.vcref.createComponent(FormComponent)
    comp.instance.callback = () => {
      this.resetFilter();
    }
    comp.instance.open(row)
  }

  resetFilter() {
    this.filter.set({
      pageSize: 10,
      page: 1,
      search: ""
    });
    this.refresh();
  }

  formatCNPJ(cnpj: string) {
    cnpj = cnpj.toString().replace(/\D/g, '');
    return cnpj.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, '$1.$2.$3/$4-$5');
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
    this.refresh();
  }
}
