import { from } from 'rxjs';
import { Component, ViewChild } from '@angular/core';
import {
  FormArray,
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import {
  PoButtonModule,
  PoDialogService,
  PoDividerModule,
  PoFieldModule,
  PoInfoModule,
  PoListViewAction,
  PoModalAction,
  PoModalComponent,
  PoModalModule,
  PoNotificationService,
  PoStepperComponent,
  PoStepperModule,
  PoStepperOrientation,
  PoTableColumn,
  PoTableModule,
  PoUploadComponent,
  PoUploadFile,
} from '@po-ui/ng-components';
import { InvoiceService } from '../../../../services/invoice.service';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { BranchService } from '../../../../services/branch.service';
import { ExporterService } from '../../../../services/exporter.service';
import { CustomerService } from '../../../../services/customer.service';

@Component({
  selector: 'app-form',
  standalone: true,
  imports: [
    PoModalModule,
    PoFieldModule,
    ReactiveFormsModule,
    PoDividerModule,
    FormsModule,
    PoStepperModule,
    PoButtonModule,
    PoInfoModule,
    CommonModule,
    PoTableModule,
  ],
  templateUrl: './form.component.html',
  styleUrl: './form.component.scss',
})
export class FormComponent {
  @ViewChild(PoModalComponent, { static: true }) poModal!: PoModalComponent;
  @ViewChild(PoStepperComponent) poStepperComponent!: PoStepperComponent;

  callback: any;
  form: FormGroup;
  fileUpload: any;
  orientation: PoStepperOrientation = PoStepperOrientation.Vertical;
  items = [];
  title = 'Nova Invoice';
  editMode = false;

  readonly primaryAction: PoModalAction = {
    label: 'Salvar',
    action: async () => {
      let payload;
      const formData = new FormData();
      if (!this.editMode) {
        const formData = new FormData();
        formData.append('file', this.fileUpload, this.fileUpload.name);
        for (const key in this.form.value) {
          if (this.form.value.hasOwnProperty(key) && key !== 'id') {
            formData.append(key, this.form.value[key]);
          }
        }
        payload = formData;
      } else {
        payload = this.form.value;
      }
      this.service.createInvoice(payload).subscribe({
        next: (res) => {
          this.poModal.close();
          this.callback();
          this.poNotification.success('Invoice criada com sucesso');
        },
        error: (err) => {
          this.poNotification.error(`Erro ao criar invoice: ${err}`);
        },
      });
    },
    disabled: true,
  };

  readonly secundaryAction: PoModalAction = {
    label: 'Fechar',
    action: () => {
      this.callback();
      this.poModal.close();
    },
  };

  readonly productsColumns: PoTableColumn[] = [
    {
      label: 'Descrição',
      property: 'desc',
    },
    {
      label: 'Referência',
      property: 'ref',
    },
    {
      label: 'Unidade de Medida',
      property: 'um',
    },
    {
      label: 'Quantidade',
      property: 'qtd',
    },
    {
      label: 'Valor Unitário',
      property: 'unit',
      type: 'currency',
      format: 'BRL',
    },
  ];

  readonly tableActions: Array<PoListViewAction> = [
    {
      label: '',
      type: 'danger',
      icon: 'po-icon-delete',
      action: this.onRemoveBankData.bind(this),
    },
  ];

  readonly columns: Array<PoTableColumn> = [
    {
      property: 'header',
      label: 'Cabeçalho',
      type: 'cellTemplate',
      width: '200px'
    },
    {
      property: 'desc',
      label: 'Descrição',
      type: 'cellTemplate',
      width: '350px',
    }
  ];

  get bankData(): FormArray {
    return this.form.get('bank_data') as FormArray;
  }

  constructor(
    private fb: FormBuilder,
    private service: InvoiceService,
    private poNotification: PoNotificationService,
    public exporterService: ExporterService,
    public customerService: CustomerService,
    private poAlert: PoDialogService
  ) {
    this.form = this.fb.group({
      id: [null],
      import_customer: ['', Validators.required],
      buyer_customer: [''],
      number: ['', Validators.required],
      exporter: ['', Validators.required],
      date: ['', Validators.required],
      from: ['', Validators.required],
      to: ['', Validators.required],
      model_transport: ['', Validators.required],
      kind_package: ['', Validators.required],
      payment: ['', Validators.required],
      shipping_value: [0.0, Validators.required],
      total: [0.0],
      subtotal: [0.0],
      bank_data: this.fb.array([]),
    });
    this.form.valueChanges.subscribe((ev) => {
      if (this.editMode) {
        this.primaryAction.disabled = this.form.invalid;
      } else {
        this.primaryAction.disabled = this.form.invalid || !this.fileUpload;
      }
    });
    this.poNotification.setDefaultDuration(2500);
  }

  open(row: any = null) {
    if (row) {
      this.title = 'Editar Invoice';
      const data = row;
      this.items = data.items;
      this.editMode = true;
      data.exporter = data.exporter?.id.toString();
      data.import_customer = data.import_customer?.id.toString();
      data.buyer_customer = data.buyer_customer?.id.toString();

      this.bankData.clear();

      if (data.bank_data && Array.isArray(data.bank_data)) {
        data.bank_data.forEach((data: any) => {
          this.bankData.push(
            this.fb.group({
              desc: [data.desc || null, Validators.required],
              header: [data.header || null],
              item: [data.item || null],
            })
          );
        });
      }

      this.form.patchValue(data);
    }
    this.poModal.open();
  }

  canActiveNextStep() {
    return this.form.valid;
  }

  onUpload(event: any) {
    event.data = { test: 'test' };
    event.file.name = 'file.xlsx';
  }

  onFileSelected(event: any) {
    const file: File = event.target.files[0];
    if (file) {
      this.fileUpload = file;
      this.primaryAction.disabled = false;
    }
  }

  downloadModel() {
    this.service.downloadModelInvoice().subscribe({
      next: (res: any) => {
        const url = window.URL.createObjectURL(res);

        const a = document.createElement('a');
        a.href = url;
        a.download = `modelo-invoice.xlsx`;
        document.body.appendChild(a);
        a.click();

        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      },
    });
  }

  addBankData(): void {
    let lastItem: any;
    if (this.bankData.length > 0)
      lastItem =
        this.bankData.controls[this.bankData.controls.length - 1];
    const item =
      this.bankData.controls.length == 0 ? 1 : lastItem!.value.item + 1;
    const dataGroup = this.fb.group({
      item: [item],
      desc: [null, Validators.required],
      header: [null]
    });
    this.bankData.push(dataGroup);
  }

  onRemoveBankData(data: any): void {
    this.poAlert.confirm({
      literals: { cancel: 'Não', confirm: 'Sim' },
      title: 'Remover',
      message: 'Deseja realmente remover?',
      confirm: () => {
        const index = this.bankData.controls.findIndex(
          (control) => control.value.item === data.value.item
        );

        if (index !== -1) {
          this.bankData.removeAt(index);
        }
      },
    });
  }
}
