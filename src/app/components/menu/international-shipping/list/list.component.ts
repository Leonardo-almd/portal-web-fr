import { Component, OnInit, ViewContainerRef, signal } from '@angular/core';
import { PoButtonModule, PoContainerModule, PoDialogService, PoLoadingModule, PoNotificationService, PoPageAction, PoPageModule, PoSearchModule, PoSwitchModule, PoTableAction, PoTableColumn, PoTableModule } from '@po-ui/ng-components';
import { UserService } from '../../../../services/user.service';
import { FormsModule } from '@angular/forms';
import { InvoiceService } from '../../../../services/invoice.service';
import { PoPageDynamicSearchModule } from '@po-ui/ng-templates';
import { InternationalShippingService } from '../../../../services/international-shipping.service';

@Component({
  selector: 'app-list',
  standalone: true,
  imports: [PoPageModule,
    PoTableModule,
    PoSwitchModule,
    FormsModule,
    PoLoadingModule,
    PoButtonModule,
    PoContainerModule,
    PoPageDynamicSearchModule
  ],
  templateUrl: './list.component.html',
  styleUrl: './list.component.scss'
})
export class ListComponent implements OnInit {
  tableItems = signal<any[]>([]);
  isLoading = signal(true);
  hasNext = signal(false);
  filter = signal({
    pageSize: 15,
    page: 1,
    search: ""
  });

  public readonly tableColumns: Array<PoTableColumn> = [
    { property: 'branch.name', label: 'Filial', type: 'cellTemplate' },
    { property: 'customer.name', label: 'Tomador', type: 'cellTemplate' },
    { property: 'process.name', label: 'Processo', type: 'cellTemplate' },
    { property: 'container', label: 'Container', type: 'string' },
    { property: 'arrival_date', label: 'Data de Atracação', type: 'date' },
  ];

  public readonly pageActions: Array<PoPageAction> = [
    {
      label: 'Criar Frete Internacional',
      action: this.onCreate.bind(this),
      icon: 'ph ph-plus'
    }
  ]

  public readonly tableActions: Array<PoTableAction> = [
    {
      icon: 'ph ph-pencil-simple',
      label: 'Editar',
      action: this.onCreate.bind(this),
    },
    {
      icon: 'po-icon-export',
      label: 'Exportar',
      action: (row: any) => {
        this.isLoading.set(true);
        this.service.export(row.id).subscribe({
          next: (data: any) => {
            this.isLoading.set(false);
            const downloadURL = window.URL.createObjectURL(data);
            const link = document.createElement('a');
            link.href = downloadURL;
            link.download =`frete_internacional_${row.id}_${new Date()}.pdf`;
            link.click();
          },

          error: (error) => {
            this.isLoading.set(false);
            this.poNotification.error(`Erro ao exportar invoice: ${error}`);
          },
        });
      },
    },
    {
      icon: 'ph ph-trash',
      label: 'Apagar',
      action: this.onDelete.bind(this),
      type: 'danger'
    },
  ];

  constructor(
    private service: InternationalShippingService,
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
        this.poNotification.error(`Erro ao buscar as invoices: ${error}`);
        this.isLoading.set(false);
      },
    });
  }

  async onDelete(row: any) {
    this.poAlert.confirm({
      literals: { cancel: 'Não', confirm: 'Sim' },
      title: 'Excluir invoice',
      message: 'Deseja realmente excluir a invoice?',
      confirm: async () => {
        await this.service
          .delete(row.id)
          .then(() => {
            this.poNotification.success('Invoice excluída com sucesso');
            this.resetFilter();
          })
          .catch(() => {
            this.poNotification.error('Erro ao excluir invoice');
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
    comp.instance.poModal.onXClosed.subscribe(() => {
      this.resetFilter();
    })
  }

  resetFilter() {
    this.filter.set({
      pageSize: 15,
      page: 1,
      search: ""
    });
    this.refresh();
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

  onShowMore() {
    this.filter.set({
      ...this.filter(),
      page: this.filter().page + 1
    });
    this.refresh();
  }

  formatCNPJ(cnpj: string) {
    cnpj = cnpj.toString().replace(/\D/g, '');
    return cnpj.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, '$1.$2.$3/$4-$5');
  }
}
