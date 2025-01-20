import { Component, OnInit, ViewChild, ViewContainerRef, signal } from '@angular/core';
import {
  PoButtonModule,
  PoContainerModule,
  PoDialogService,
  PoLoadingModule,
  PoModalComponent,
  PoModalModule,
  PoNotificationService,
  PoPageAction,
  PoPageModule,
  PoSearchModule,
  PoSwitchModule,
  PoTableAction,
  PoTableColumn,
  PoTableModule,
} from '@po-ui/ng-components';
import { UserService } from '../../../../services/user.service';
import { FormsModule } from '@angular/forms';
import { InvoiceService } from '../../../../services/invoice.service';
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
    PoPageDynamicSearchModule,
    PoModalModule
  ],
  templateUrl: './list.component.html',
  styleUrl: './list.component.scss',
})
export class ListComponent implements OnInit {
  @ViewChild('exportModal') exportModal!: PoModalComponent;
  tableItems = signal<any[]>([]);
  isLoading = signal(true);
  hasNext = signal(false);
  filter = signal({
    pageSize: 15,
    page: 1,
    search: '',
  });
  selectedRow = signal<any>(null);

  public readonly exportItems = [
    {model: 'SHENZEN'},
    {model: 'PRO-BRIGHTNESS'},
    {model: 'OESTE'},
    {model: 'FALCON'},
    {model: 'GENÉRICO'}
  ]

  public readonly exportActions: Array<PoTableAction> = [
    {
      label: '',
      icon: 'ph ph-download-simple',
      action: (row: any) => {
        const id = this.selectedRow().id;
        this.isLoading.set(true);
        this.exportModal.close();
        this.service.exportInvoice(id, row.model).subscribe({
          next: (data: any) => {
            this.isLoading.set(false);
            const downloadURL = window.URL.createObjectURL(data);
            const link = document.createElement('a');
            link.href = downloadURL;
            link.download = `invoice_${this.selectedRow().number}_${new Date().toISOString().split('T')[0]}.zip`; // Nome do arquivo ZIP
            link.click();

            // Revogar o objeto URL após o download
            window.URL.revokeObjectURL(downloadURL);
          },

          error: (error) => {
            this.isLoading.set(false);
            this.poNotification.error(`Erro ao exportar invoice: ${error}`);
          },
        });

      }
    }
  ]

  public readonly tableColumns: Array<PoTableColumn> = [
    { property: 'id', label: 'ID', type: 'number' },
    { property: 'number', label: 'Número', type: 'number' },
    { property: 'exporter.name', label: 'Exportador' },
    { property: 'import_customer.name', label: 'Cliente Importador' },
    { property: 'buyer_customer.name', label: 'Cliente Comprador' },
    { property: 'date', label: 'Data', type: 'date' },
    { property: 'itemsCount', label: 'Qtd. Produtos', type: 'number' },
    {
      property: 'shipping_value',
      label: 'Frete',
      type: 'currency',
      format: 'BRL',
    },
    { property: 'total', label: 'Total', type: 'currency', format: 'BRL' },
  ];

  public readonly pageActions: Array<PoPageAction> = [
    {
      label: 'Criar Invoice',
      action: this.onCreate.bind(this),
      icon: 'ph ph-plus',
    },
  ];

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
        this.selectedRow.set(row)
        this.exportModal.open();
      },
    },
    {
      icon: 'ph ph-trash',
      label: 'Apagar',
      action: this.onDelete.bind(this),
      type: 'danger',
    },
  ];

  constructor(
    private service: InvoiceService,
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
    this.service.getInvoices(this.filter()).subscribe({
      next: (res: any) => {
        console.log(res);
        if (res) {
          if (this.filter().page == 1) {
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

  async onCreate(row = null) {
    this.vcref.clear();
    const { FormComponent } = await import('../form/form.component');
    const comp = this.vcref.createComponent(FormComponent);
    comp.instance.callback = () => {
      this.resetFilter();
    };
    comp.instance.open(row);
    comp.instance.poModal.onXClosed.subscribe(() => {
      this.resetFilter();
    });
  }

  resetFilter() {
    this.filter.set({
      pageSize: 15,
      page: 1,
      search: '',
    });
    this.refresh();
  }

  onSearch(value: string) {
    if (Array.isArray(value)) {
      this.resetFilter();
      return;
    }
    this.filter.set({
      ...this.filter(),
      page: 1,
      search: value,
    });
    this.refresh();
  }

  onShowMore() {
    this.filter.set({
      ...this.filter(),
      page: this.filter().page + 1,
    });
    this.refresh();
  }

  formatCNPJ(cnpj: string) {
    cnpj = cnpj.toString().replace(/\D/g, '');
    return cnpj.replace(
      /^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/,
      '$1.$2.$3/$4-$5'
    );
  }
}
