import { from } from 'rxjs';
import { Component, ViewChild } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import {
  PoButtonModule,
  PoDividerModule,
  PoFieldModule,
  PoInfoModule,
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
    PoTableModule
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
  title = 'Nova Invoice'
  editMode = false;

  readonly primaryAction: PoModalAction = {
    label: 'Salvar',
    action: async () => {
      let payload;
      const formData = new FormData();
      if(!this.editMode){
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
        next: res => {
          this.poModal.close();
          this.callback();
          this.poNotification.success('Invoice criada com sucesso');
        },
        error: err => {
          this.poNotification.error(`Erro ao criar invoice: ${err}`);
        }
      })
    },
    disabled: true
  };

  readonly secundaryAction: PoModalAction = {
    label: 'Fechar',
    action: () => {
      this.callback();
      this.poModal.close();
    }
  };

  readonly productsColumns: PoTableColumn[] = [
  {
    label: 'Descrição',
    property: 'desc'
  },
  {
    label: 'Referência',
    property: 'ref'
  },
  {
    label: 'Quantidade',
    property: 'qtd'
  },
  {
    label: 'Valor Unitário',
    property: 'unit',
    type: 'currency',
    format: 'BRL'
  }
]

  constructor(
    private fb: FormBuilder,
    private service: InvoiceService,
    private poNotification: PoNotificationService,
    public exporterService: ExporterService,
    public customerService: CustomerService
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
      beneficiary_name: ['', Validators.required],
      beneficiary_address: ['', Validators.required],
      bank_name: ['', Validators.required],
      bank_address: ['', Validators.required],
      account_number: ['', Validators.required],
      swift: ['', Validators.required],
      bank_code: ['', Validators.required],
      total: [0.0],
      subtotal: [0.0]
    });
    this.form.valueChanges.subscribe((ev) => {
      if(this.editMode){
        this.primaryAction.disabled = this.form.invalid;
      } else {
        this.primaryAction.disabled = this.form.invalid || !this.fileUpload;
      }
    })
    this.poNotification.setDefaultDuration(2500);
  }

  open(row: any = null) {
    if (row) {
      this.title = 'Editar Invoice';
      const data = row;
      console.log(data.items)
      this.items = data.items;
      this.editMode = true;
      data.exporter = data.exporter?.id.toString();
      data.import_customer = data.import_customer?.id.toString();
      data.buyer_customer = data.buyer_customer?.id.toString();

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
}
